const { db } = require('../db/database');
const transformationService = require('./transformation.service');

class StorageService {
  /**
   * Save normalized data into relational tables within an atomic SQLite transaction
   * @param {Object} [customInputs] Optional custom parsed data { orders, products, shipments }
   */
  async saveNormalizedData(customInputs = {}) {
    const { normalizedData, rawOrdersCount, rawProductsCount, rawShipmentsCount, exchangeRate } =
      await transformationService.processData(customInputs);

    const insertCustomer = db.prepare(`INSERT OR IGNORE INTO customers (id, name) VALUES (?, ?)`);
    const insertProduct = db.prepare(`
      INSERT INTO products (product_id, name, category, price) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET 
        name = excluded.name, 
        category = excluded.category,
        price = CASE WHEN excluded.price > 0 THEN excluded.price ELSE products.price END
    `);
    const insertOrder = db.prepare(`INSERT OR REPLACE INTO orders (order_id, customer_id, order_date, total_order_value, total_order_value_converted) VALUES (?, ?, ?, ?, ?)`);
    const insertShipment = db.prepare(`INSERT OR REPLACE INTO shipments (shipment_id, order_id, delivery_days, status, delivery_delay) VALUES (?, ?, ?, ?, ?)`);
    const deleteOrderItems = db.prepare(`DELETE FROM order_items WHERE order_id = ?`);
    const insertOrderItem = db.prepare(`INSERT INTO order_items (order_id, product_id, qty, price, price_converted, item_value, item_value_converted) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    const transaction = db.transaction((data) => {
      const processedOrders = new Set();

      for (const row of data) {
        if (row.customer_id && row.customer_id !== 'C-UNKNOWN') {
          insertCustomer.run(row.customer_id, row.customer_name);
        }

        if (row.product_id && row.product_id !== 'P-UNKNOWN') {
          insertProduct.run(row.product_id, row.product_name, row.category, row.price || 0);
        }

        if (!processedOrders.has(row.order_id)) {
          insertOrder.run(
            row.order_id,
            row.customer_id !== 'C-UNKNOWN' ? row.customer_id : null,
            row.order_date,
            row.total_order_value,
            row.total_order_value_converted
          );

          if (row.shipment_id) {
            insertShipment.run(
              row.shipment_id,
              row.order_id,
              row.delivery_days,
              row.shipment_status,
              row.delivery_delay ? 1 : 0
            );
          }

          deleteOrderItems.run(row.order_id);
          processedOrders.add(row.order_id);
        }

        insertOrderItem.run(
          row.order_id,
          row.product_id !== 'P-UNKNOWN' ? row.product_id : null,
          row.qty,
          row.price,
          row.price_converted,
          row.item_value,
          row.item_value_converted
        );
      }
    });

    transaction(normalizedData);

    return {
      success: true,
      rawOrders: rawOrdersCount,
      rawProducts: rawProductsCount,
      rawShipments: rawShipmentsCount,
      normalizedRows: normalizedData.length,
      exchangeRate,
      dbStats: this.getDatabaseStats()
    };
  }

  getDatabaseStats() {
    const ordersCount = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
    const customersCount = db.prepare('SELECT COUNT(*) as c FROM customers').get().c;
    const productsCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
    const shipmentsCount = db.prepare('SELECT COUNT(*) as c FROM shipments').get().c;
    const itemsCount = db.prepare('SELECT COUNT(*) as c FROM order_items').get().c;

    return {
      orders: ordersCount,
      customers: customersCount,
      products: productsCount,
      shipments: shipmentsCount,
      orderItems: itemsCount
    };
  }

  /**
   * Seed a comprehensive realistic dataset for rich analytics visualization
   */
  async seedRichSampleData() {
    const sampleProducts = [
      { ProductID: 'P101', ProductName: 'Ultra Laptop 15"', Category: 'Electronics', Price: 45000 },
      { ProductID: 'P102', ProductName: 'Smartphone Pro Max', Category: 'Electronics', Price: 25000 },
      { ProductID: 'P103', ProductName: 'Ergonomic Mesh Chair', Category: 'Furniture', Price: 8500 },
      { ProductID: 'P104', ProductName: 'Standing Motorized Desk', Category: 'Furniture', Price: 15000 },
      { ProductID: 'P105', ProductName: 'Wireless Noise-Canceling Headphones', Category: 'Electronics', Price: 6500 },
      { ProductID: 'P106', ProductName: 'Classic Denim Jacket', Category: 'Clothing', Price: 3500 },
      { ProductID: 'P107', ProductName: 'Cotton Casual T-Shirt', Category: 'Clothing', Price: 800 },
      { ProductID: 'P108', ProductName: 'Programmable Robotic Kit', Category: 'Toys', Price: 2500 },
      { ProductID: 'P109', ProductName: 'Modular Building Blocks', Category: 'Toys', Price: 1200 },
      { ProductID: 'P110', ProductName: 'Modern Clean Code Guide', Category: 'Books', Price: 950 },
      { ProductID: 'P111', ProductName: 'System Architecture Handbook', Category: 'Books', Price: 1400 },
      { ProductID: 'P112', ProductName: 'Mechanical Keyboard RGB', Category: 'Electronics', Price: 4200 },
    ];

    const sampleShipments = [];
    const sampleOrders = [];
    const customers = [
      { id: 'C001', name: 'Rahul Sharma' },
      { id: 'C002', name: 'Anita Kumari' },
      { id: 'C003', name: 'Amit Patel' },
      { id: 'C004', name: 'Sneha Gupta' },
      { id: 'C005', name: 'Vikram Singh' },
      { id: 'C006', name: 'Pooja Verma' },
      { id: 'C007', name: 'Arjun Reddy' },
      { id: 'C008', name: 'Neha Joshi' },
      { id: 'C009', name: 'Deepak Jain' },
      { id: 'C010', name: 'Meena Iyer' },
    ];

    const dates = [
      '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05',
      '2024-01-06', '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10',
      '2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14'
    ];

    let orderIndex = 1001;
    for (let dayIdx = 0; dayIdx < dates.length; dayIdx++) {
      const orderDate = dates[dayIdx];
      const ordersForDay = 2 + (dayIdx % 3);

      for (let o = 0; o < ordersForDay; o++) {
        const orderId = String(orderIndex++);
        const cust = customers[(orderIndex + o) % customers.length];
        const prodA = sampleProducts[(orderIndex + 1) % sampleProducts.length];
        const prodB = sampleProducts[(orderIndex + 4) % sampleProducts.length];

        const isDelayed = (orderIndex % 5 === 0);
        const deliveryDays = isDelayed ? 6 + (orderIndex % 4) : 2 + (orderIndex % 3);
        const status = isDelayed ? 'Delayed' : 'Delivered';

        sampleShipments.push({
          shipment_id: `S${orderId}`,
          order_id: orderId,
          delivery_days: deliveryDays,
          status: status
        });

        sampleOrders.push({
          order_id: orderId,
          customer: cust,
          order_date: orderDate,
          items: [
            { product_id: prodA.ProductID, qty: 1 + (orderIndex % 3), price: prodA.Price },
            { product_id: prodB.ProductID, qty: 1, price: prodB.Price }
          ]
        });
      }
    }

    return await this.saveNormalizedData({
      orders: sampleOrders,
      products: sampleProducts,
      shipments: sampleShipments
    });
  }
}

module.exports = new StorageService();
