const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'analytics.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      product_id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      price REAL DEFAULT 0,
      stock INTEGER DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      customer_id TEXT,
      order_date TEXT,
      total_order_value REAL,
      total_order_value_converted REAL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS shipments (
      shipment_id TEXT PRIMARY KEY,
      order_id TEXT,
      delivery_days INTEGER,
      status TEXT,
      delivery_delay BOOLEAN,
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT,
      product_id TEXT,
      qty INTEGER,
      price REAL,
      price_converted REAL,
      item_value REAL,
      item_value_converted REAL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
    CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
    CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
  `);

  // Run dynamic schema migrations for existing SQLite databases
  const ensureColumn = (table, column, colDef) => {
    try {
      const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
      if (!cols.includes(column)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${colDef}`);
      }
    } catch (e) {
      console.warn(`Migration notice for ${table}.${column}:`, e.message);
    }
  };

  ensureColumn('products', 'price', 'REAL DEFAULT 0');
  ensureColumn('products', 'stock', 'INTEGER DEFAULT 100');
  ensureColumn('orders', 'total_order_value_converted', 'REAL DEFAULT 0');
  ensureColumn('shipments', 'delivery_delay', 'BOOLEAN DEFAULT 0');
  ensureColumn('order_items', 'price_converted', 'REAL DEFAULT 0');
  ensureColumn('order_items', 'item_value_converted', 'REAL DEFAULT 0');
}

// Auto-run schema & migration initialization
initDB();

module.exports = { db, initDB };
