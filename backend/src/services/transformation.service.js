const path = require('path');
const fs = require('fs');
const jsonService = require('./json.service');
const csvService = require('./csv.service');
const xmlService = require('./xml.service');
const currencyService = require('./currency.service');

const dataDir = path.join(__dirname, '../../data');
const rootDataDir = path.join(__dirname, '../../../data');
const rootDataDirCap = path.join(__dirname, '../../../Data');
const essentialDir = path.join(__dirname, '../../../essential');

function getFallbackFilePath(filename) {
  const candidateDirs = [dataDir, rootDataDir, rootDataDirCap, essentialDir];
  for (const dir of candidateDirs) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) return filePath;
  }
  return path.join(dataDir, filename);
}

class TransformationService {
  /**
   * Process and join datasets (Orders + Products + Shipments)
   * @param {Object} [customInputs] Optional direct inputs { orders, products, shipments }
   * @returns {Object} { normalizedRows, summary, exchangeRate }
   */
  async processData(customInputs = {}) {
    // 1. Ingest raw datasets (use provided inputs or fallback to files)
    const rawOrders = customInputs.orders
      ? jsonService.parseOrders(customInputs.orders)
      : jsonService.parseOrders(getFallbackFilePath('Orders.json'));

    const rawProducts = customInputs.products
      ? csvService.parseProducts(customInputs.products)
      : csvService.parseProducts(getFallbackFilePath('Products.csv'));

    const rawShipments = customInputs.shipments
      ? xmlService.parseShipments(customInputs.shipments)
      : xmlService.parseShipments(getFallbackFilePath('Shipment.xml'));

    // 2. Fetch live currency exchange rate (INR to EUR / USD)
    const exchangeRate = await currencyService.getExchangeRate('EUR', 'INR');

    // 3. Index Products by ProductID for O(1) lookup
    const productsMap = {};
    for (const p of rawProducts) {
      const pid = String(p.ProductID || p.id || '').trim();
      if (pid) {
        productsMap[pid] = {
          product_id: pid,
          product_name: p.ProductName || p.name || 'Unknown Product',
          category: p.Category || p.category || 'General',
          price: Number(p.Price || p.price) || 0
        };
      }
    }

    // 4. Index Shipments by order_id for O(1) lookup
    const shipmentsMap = {};
    for (const s of rawShipments) {
      const oid = String(s.order_id || '').trim();
      if (oid) {
        const status = s.status ? String(s.status).trim() : 'Unknown';
        const days = !isNaN(Number(s.delivery_days)) && s.delivery_days !== null ? Number(s.delivery_days) : null;
        const isDelayed = status.toLowerCase() === 'delayed' || (days !== null && days > 5);

        shipmentsMap[oid] = {
          shipment_id: s.shipment_id || `S-${oid}`,
          order_id: oid,
          delivery_days: days,
          status: status,
          delivery_delay: isDelayed
        };
      }
    }

    // 5. Precalculate total_order_value for each order
    const orderTotals = {};
    for (const order of rawOrders) {
      let total = 0;
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const qty = Number(item.qty) || 0;
          const price = Number(item.price) || 0;
          total += qty * price;
        }
      }
      const orderId = String(order.order_id || 'UNKNOWN').trim();
      orderTotals[orderId] = {
        total_order_value: total,
        total_order_value_converted: Number((total * exchangeRate).toFixed(2))
      };
    }

    // 6. Flatten nested JSON and perform Multi-Way Join
    const normalizedData = [];
    const processedOrderIds = new Set();

    for (const order of rawOrders) {
      const orderId = String(order.order_id || 'UNKNOWN').trim();
      processedOrderIds.add(orderId);

      const customerId = order.customer?.id ? String(order.customer.id).trim() : 'C-UNKNOWN';
      const customerName = order.customer?.name ? String(order.customer.name).trim() : 'Unknown Customer';

      let orderDate = '2024-01-01';
      if (order.order_date) {
        try {
          const d = new Date(order.order_date);
          orderDate = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : String(order.order_date);
        } catch (e) {
          orderDate = String(order.order_date);
        }
      }

      const shipment = shipmentsMap[orderId] || {
        shipment_id: null,
        delivery_days: null,
        status: 'Pending',
        delivery_delay: false
      };

      const orderTotalInfo = orderTotals[orderId] || { total_order_value: 0, total_order_value_converted: 0 };
      const items = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : [{ product_id: 'P-DEFAULT', qty: 1, price: 0 }];

      for (const item of items) {
        const productId = String(item.product_id || 'P-UNKNOWN').trim();
        const qty = Number(item.qty) || 1;
        const price = Number(item.price) || 0;
        const itemValue = qty * price;

        const productInfo = productsMap[productId] || {
          product_id: productId,
          product_name: `Product ${productId}`,
          category: 'General',
          price: price
        };

        normalizedData.push({
          order_id: orderId,
          customer_id: customerId,
          customer_name: customerName,
          order_date: orderDate,

          product_id: productId,
          product_name: productInfo.product_name,
          category: productInfo.category,

          qty: qty,
          price: price,
          price_converted: Number((price * exchangeRate).toFixed(2)),
          item_value: itemValue,
          item_value_converted: Number((itemValue * exchangeRate).toFixed(2)),
          total_order_value: orderTotalInfo.total_order_value,
          total_order_value_converted: orderTotalInfo.total_order_value_converted,

          shipment_id: shipment.shipment_id,
          delivery_days: shipment.delivery_days,
          shipment_status: shipment.status,
          delivery_delay: shipment.delivery_delay
        });
      }
    }

    return {
      normalizedData,
      rawOrdersCount: rawOrders.length,
      rawProductsCount: rawProducts.length,
      rawShipmentsCount: rawShipments.length,
      normalizedRowsCount: normalizedData.length,
      exchangeRate
    };
  }
}

module.exports = new TransformationService();
