const { db } = require('../db/database');
const currencyService = require('./currency.service');

class AnalyticsService {
  /**
   * Helper to build SQL WHERE clause from filters
   */
  _buildFilterClause(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.startDate) {
      conditions.push('o.order_date >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('o.order_date <= ?');
      params.push(filters.endDate);
    }
    if (filters.deliveryStatus) {
      conditions.push('LOWER(s.status) = LOWER(?)');
      params.push(filters.deliveryStatus);
    }
    if (filters.category) {
      conditions.push(`o.order_id IN (
        SELECT DISTINCT oi2.order_id 
        FROM order_items oi2 
        JOIN products p2 ON oi2.product_id = p2.product_id 
        WHERE LOWER(p2.category) = LOWER(?)
      )`);
      params.push(filters.category);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereSql, params };
  }

  /**
   * KPI Summary cards data
   */
  async getSummary(filters = {}) {
    const { whereSql, params } = this._buildFilterClause(filters);

    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT o.order_id) as totalOrders,
        COALESCE(SUM(o.total_order_value), 0) as totalRevenue,
        COALESCE(AVG(o.total_order_value), 0) as averageOrderValue,
        COALESCE(SUM(CASE WHEN s.delivery_delay = 1 OR LOWER(s.status) = 'delayed' THEN 1 ELSE 0 END), 0) as delayedOrders,
        COALESCE(SUM(CASE WHEN LOWER(s.status) = 'delivered' THEN 1 ELSE 0 END), 0) as deliveredOrders,
        COALESCE(AVG(s.delivery_days), 0) as averageDeliveryDays
      FROM orders o
      LEFT JOIN shipments s ON o.order_id = s.order_id
      ${whereSql}
    `;

    const row = db.prepare(summaryQuery).get(...params) || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      delayedOrders: 0,
      deliveredOrders: 0,
      averageDeliveryDays: 0
    };

    const exchangeRate = await currencyService.getExchangeRate('EUR', 'INR');

    return {
      totalOrders: Number(row.totalOrders) || 0,
      totalRevenue: Number(row.totalRevenue) || 0,
      delayedOrders: Number(row.delayedOrders) || 0,
      deliveredOrders: Number(row.deliveredOrders) || 0,
      averageOrderValue: Number(Number(row.averageOrderValue).toFixed(2)) || 0,
      averageDeliveryDays: Number(Number(row.averageDeliveryDays).toFixed(1)) || 0,

      // Also provide snake_case keys for alternative clients
      total_orders: Number(row.totalOrders) || 0,
      total_revenue: Number(row.totalRevenue) || 0,
      delayed_orders: Number(row.delayedOrders) || 0,
      currencyRate: exchangeRate,
      targetCurrency: 'EUR'
    };
  }

  /**
   * Daily revenue and order trend
   */
  getRevenue(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.startDate) {
      conditions.push('order_date >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('order_date <= ?');
      params.push(filters.endDate);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        order_date as date,
        ROUND(SUM(total_order_value), 2) as revenue,
        COUNT(order_id) as orders
      FROM orders
      ${whereSql}
      GROUP BY order_date
      ORDER BY order_date ASC
    `;

    return db.prepare(query).all(...params);
  }

  /**
   * Category-wise revenue and order counts
   */
  getCategories(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.category) {
      conditions.push('LOWER(p.category) = LOWER(?)');
      params.push(filters.category);
    }
    if (filters.startDate) {
      conditions.push('o.order_date >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('o.order_date <= ?');
      params.push(filters.endDate);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        COALESCE(p.category, 'Uncategorized') as category,
        ROUND(SUM(oi.item_value), 2) as revenue,
        COUNT(DISTINCT oi.order_id) as orders
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN orders o ON oi.order_id = o.order_id
      ${whereSql}
      GROUP BY p.category
      ORDER BY revenue DESC
    `;

    return db.prepare(query).all(...params);
  }

  /**
   * Delivery status counts (delivered, delayed, unknown)
   */
  getDelivery(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.startDate) {
      conditions.push('o.order_date >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('o.order_date <= ?');
      params.push(filters.endDate);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        COALESCE(s.status, 'Unknown') as status,
        s.delivery_delay as isDelayed,
        COUNT(s.shipment_id) as count
      FROM shipments s
      JOIN orders o ON s.order_id = o.order_id
      ${whereSql}
      GROUP BY s.status, s.delivery_delay
    `;

    const rows = db.prepare(query).all(...params);
    let delivered = 0;
    let delayed = 0;
    let unknown = 0;

    for (const r of rows) {
      const st = String(r.status || '').toLowerCase();
      if (st === 'delivered') {
        delivered += r.count;
      } else if (st === 'delayed' || r.isDelayed === 1) {
        delayed += r.count;
      } else {
        unknown += r.count;
      }
    }

    return { delivered, delayed, unknown };
  }

  /**
   * List of customer orders with detailed attributes
   */
  getOrders(filters = {}) {
    const { whereSql, params } = this._buildFilterClause(filters);

    let query = `
      SELECT 
        o.order_id as orderId,
        COALESCE(c.name, 'Customer ' || o.customer_id) as customer,
        o.order_date as date,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) as items,
        ROUND(o.total_order_value, 2) as amount,
        ROUND(COALESCE(o.total_order_value_converted, 0), 2) as amountConverted,
        COALESCE((
          SELECT p.category 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.product_id 
          WHERE oi.order_id = o.order_id 
          LIMIT 1
        ), 'General') as category,
        COALESCE(s.status, 'Pending') as deliveryStatus,
        s.delivery_days as deliveryDays
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN shipments s ON o.order_id = s.order_id
      ${whereSql}
      ORDER BY o.order_date DESC, o.order_id DESC
    `;

    if (filters.limit) {
      query += ` LIMIT ${Number(filters.limit)}`;
      if (filters.offset) {
        query += ` OFFSET ${Number(filters.offset)}`;
      }
    }

    const orders = db.prepare(query).all(...params);

    // Optional search term filter (client or backend)
    if (filters.search) {
      const q = String(filters.search).toLowerCase();
      return orders.filter(o =>
        String(o.orderId).toLowerCase().includes(q) ||
        String(o.customer).toLowerCase().includes(q)
      );
    }

    return orders;
  }

  /**
   * List of products
   */
  getProducts(filters = {}) {
    let query = `
      SELECT 
        product_id as id,
        name,
        category,
        price,
        stock
      FROM products
    `;

    const conditions = [];
    const params = [];

    if (filters.category) {
      conditions.push('LOWER(category) = LOWER(?)');
      params.push(filters.category);
    }
    if (filters.search) {
      conditions.push('(LOWER(name) LIKE ? OR LOWER(product_id) LIKE ?)');
      params.push(`%${filters.search.toLowerCase()}%`);
      params.push(`%${filters.search.toLowerCase()}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY category ASC, name ASC';

    return db.prepare(query).all(...params);
  }

  /**
   * External REST Countries API Integration (From Exercise Specification)
   */
  async getCountries(region = '') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = region
        ? `https://restcountries.com/v3.1/region/${encodeURIComponent(region)}?fields=name,currencies,population,region,capital,flags`
        : 'https://restcountries.com/v3.1/all?fields=name,currencies,population,region,capital,flags';

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`REST Countries API returned HTTP ${response.status}`);
      }

      const raw = await response.json();
      return (raw || []).slice(0, 50).map(c => ({
        name: c.name?.common || 'Unknown',
        region: c.region || 'Unknown',
        population: c.population || 0,
        capital: (c.capital && c.capital[0]) || 'N/A',
        currencies: c.currencies ? Object.keys(c.currencies).join(', ') : 'N/A',
        flag: c.flags?.png || ''
      }));
    } catch (e) {
      // Local fallback in case of no internet access
      return [
        { name: 'India', region: 'Asia', population: 1400000000, capital: 'New Delhi', currencies: 'INR' },
        { name: 'United States', region: 'Americas', population: 331000000, capital: 'Washington, D.C.', currencies: 'USD' },
        { name: 'Germany', region: 'Europe', population: 83000000, capital: 'Berlin', currencies: 'EUR' },
        { name: 'United Kingdom', region: 'Europe', population: 67000000, capital: 'London', currencies: 'GBP' },
        { name: 'Japan', region: 'Asia', population: 125000000, capital: 'Tokyo', currencies: 'JPY' }
      ];
    }
  }
}

module.exports = new AnalyticsService();
