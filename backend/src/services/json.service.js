const fs = require('fs');
const { isSafeFilePath } = require('../utils/security.util');

class JsonService {
  /**
   * Parse orders from safe file path, raw string, buffer, or object
   * Supports standard formats, flat orders, camelCase / snake_case, and nested structures.
   * @param {string|Buffer|object} input 
   * @returns {Array} List of normalized orders
   */
  parseOrders(input) {
    let parsedData;

    if (typeof input === 'object' && input !== null && !(input instanceof Buffer)) {
      parsedData = input;
    } else {
      let raw;
      if (input instanceof Buffer) {
        raw = input.toString('utf8');
      } else if (typeof input === 'string') {
        // Safely check if it is an allowed internal file path
        if (isSafeFilePath(input) && fs.existsSync(input)) {
          raw = fs.readFileSync(input, 'utf8');
        } else {
          raw = input;
        }
      } else {
        throw new Error('Unsupported input type for JSON parser');
      }

      // Strip BOM and whitespace
      raw = raw.replace(/^\uFEFF/, '').trim();

      if (!raw) {
        return [];
      }

      // 1. Try standard JSON parse
      try {
        parsedData = JSON.parse(raw);
      } catch (e1) {
        // 2. Try cleanup for escaped quotes / malformed CSV export quotes
        try {
          const lines = raw.split(/\r?\n/);
          const fixedContent = lines.map(l => {
            const t = l.trim();
            if (t.startsWith('"') && (t.endsWith('"') || t.endsWith('",'))) {
              const hasComma = t.endsWith('",');
              let inner = t.substring(1, t.length - (hasComma ? 2 : 1));
              inner = inner.replace(/""/g, '"');
              const prefix = l.substring(0, l.indexOf('"'));
              return prefix + inner + (hasComma ? ',' : '');
            }
            return l;
          }).join('\n');
          parsedData = JSON.parse(fixedContent);
        } catch (e2) {
          throw new Error(`Invalid JSON syntax: ${e1.message}`);
        }
      }
    }

    // Extract orders array from various common payload structures
    let rawList = [];
    if (Array.isArray(parsedData)) {
      rawList = parsedData;
    } else if (parsedData && typeof parsedData === 'object') {
      if (Array.isArray(parsedData.orders)) {
        rawList = parsedData.orders;
      } else if (Array.isArray(parsedData.data)) {
        rawList = parsedData.data;
      } else if (Array.isArray(parsedData.items)) {
        rawList = parsedData.items;
      } else if (parsedData.order_id || parsedData.orderId || parsedData.id) {
        // Single order object passed directly
        rawList = [parsedData];
      } else if (Object.keys(parsedData).length === 0) {
        // Empty object fallback
        return [];
      } else {
        throw new Error('Invalid JSON structure: Expected an array of orders or {"orders": [...]}');
      }
    }

    // Normalize each order to standard schema
    return rawList.map((item, index) => {
      const orderId = String(item.order_id || item.orderId || item.id || `ORD-${1000 + index}`).trim();

      // Customer normalization
      let customer = { id: `C-${orderId}`, name: 'Customer' };
      if (typeof item.customer === 'string') {
        customer = { id: `C-${index + 1}`, name: item.customer };
      } else if (item.customer && typeof item.customer === 'object') {
        customer = {
          id: String(item.customer.id || item.customer.customerId || `C-${index + 1}`).trim(),
          name: String(item.customer.name || item.customer.customerName || 'Customer').trim()
        };
      } else if (item.customer_name || item.customerName) {
        customer = {
          id: String(item.customer_id || item.customerId || `C-${index + 1}`).trim(),
          name: String(item.customer_name || item.customerName).trim()
        };
      }

      // Date normalization
      let orderDate = '2024-01-01';
      const rawDate = item.order_date || item.orderDate || item.date;
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          orderDate = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : String(rawDate).slice(0, 10);
        } catch {
          orderDate = String(rawDate);
        }
      }

      // Items normalization
      let items = [];
      const rawItems = item.items || item.order_items || item.products;
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        items = rawItems.map((it, itIdx) => ({
          product_id: String(it.product_id || it.productId || it.id || `P-${100 + itIdx}`).trim(),
          qty: Number(it.qty || it.quantity) || 1,
          price: Number(it.price || it.unitPrice || it.amount) || 0
        }));
      } else {
        // Fallback item if order is flat with amount
        const amount = Number(item.amount || item.total || item.total_order_value || item.price) || 500;
        items = [{
          product_id: String(item.product_id || item.productId || 'P101').trim(),
          qty: Number(item.items || item.qty) || 1,
          price: amount
        }];
      }

      return {
        order_id: orderId,
        customer,
        items,
        order_date: orderDate
      };
    });
  }
}

module.exports = new JsonService();
