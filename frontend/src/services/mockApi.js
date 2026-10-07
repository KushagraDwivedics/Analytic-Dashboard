// Complete In-Memory & LocalStorage Analytics Simulator Engine

const baseCategories = ["Electronics", "Furniture", "Clothing", "Toys", "Books"];
const customersList = [
  "Rahul Sharma", "Amit Patel", "Sneha Gupta", "Vikram Singh", "Pooja Verma",
  "Arjun Reddy", "Neha Joshi", "Karan Mehta", "Priya Nair", "Rohan Das",
  "Anita Kumari", "Suresh Yadav", "Meena Iyer", "Deepak Jain", "Kavita Rao",
  "Ananya Roy", "Rajesh Khanna", "Pooja Hegde", "Sunil Gavaskar", "Simran Kaur",
  "Ritu Desai", "Manish Tiwari", "Swati Sengupta", "Gaurav Chopra", "Divya Nambiar"
];

// 42 Rich baseline orders spanning January 2024
const INITIAL_SEED_ORDERS = [
  { orderId: "ORD-1001", customer: "Rahul Sharma", date: "2024-01-01", items: 3, amount: 2200, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1002", customer: "Amit Patel", date: "2024-01-01", items: 1, amount: 1500, category: "Furniture", deliveryStatus: "Delayed", deliveryDays: 8 },
  { orderId: "ORD-1003", customer: "Sneha Gupta", date: "2024-01-02", items: 5, amount: 3100, category: "Clothing", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1004", customer: "Vikram Singh", date: "2024-01-02", items: 2, amount: 900, category: "Books", deliveryStatus: "Delivered", deliveryDays: 4 },
  { orderId: "ORD-1005", customer: "Pooja Verma", date: "2024-01-03", items: 4, amount: 4200, category: "Electronics", deliveryStatus: "Delayed", deliveryDays: 9 },
  { orderId: "ORD-1006", customer: "Arjun Reddy", date: "2024-01-03", items: 2, amount: 1800, category: "Toys", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1007", customer: "Neha Joshi", date: "2024-01-04", items: 1, amount: 650, category: "Books", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1008", customer: "Karan Mehta", date: "2024-01-04", items: 3, amount: 5400, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 5 },
  { orderId: "ORD-1009", customer: "Priya Nair", date: "2024-01-05", items: 2, amount: 2100, category: "Furniture", deliveryStatus: "Delayed", deliveryDays: 10 },
  { orderId: "ORD-1010", customer: "Rohan Das", date: "2024-01-05", items: 6, amount: 3600, category: "Clothing", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1011", customer: "Anita Kumari", date: "2024-01-06", items: 1, amount: 1200, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 4 },
  { orderId: "ORD-1012", customer: "Suresh Yadav", date: "2024-01-06", items: 4, amount: 2800, category: "Toys", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1013", customer: "Meena Iyer", date: "2024-01-07", items: 2, amount: 1750, category: "Clothing", deliveryStatus: "Delayed", deliveryDays: 7 },
  { orderId: "ORD-1014", customer: "Deepak Jain", date: "2024-01-07", items: 3, amount: 4100, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1015", customer: "Kavita Rao", date: "2024-01-08", items: 1, amount: 950, category: "Books", deliveryStatus: "Delivered", deliveryDays: 5 },
  { orderId: "ORD-1016", customer: "Ananya Roy", date: "2024-01-08", items: 4, amount: 3300, category: "Furniture", deliveryStatus: "Delivered", deliveryDays: 4 },
  { orderId: "ORD-1017", customer: "Rajesh Khanna", date: "2024-01-09", items: 2, amount: 2150, category: "Clothing", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1018", customer: "Pooja Hegde", date: "2024-01-09", items: 3, amount: 4800, category: "Electronics", deliveryStatus: "Delayed", deliveryDays: 9 },
  { orderId: "ORD-1019", customer: "Sunil Gavaskar", date: "2024-01-10", items: 1, amount: 1250, category: "Toys", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1020", customer: "Simran Kaur", date: "2024-01-10", items: 5, amount: 3900, category: "Furniture", deliveryStatus: "Delivered", deliveryDays: 4 },
  { orderId: "ORD-1021", customer: "Rahul Sharma", date: "2024-01-11", items: 2, amount: 1850, category: "Books", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1022", customer: "Amit Patel", date: "2024-01-11", items: 4, amount: 5600, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1023", customer: "Sneha Gupta", date: "2024-01-12", items: 3, amount: 2750, category: "Clothing", deliveryStatus: "Delayed", deliveryDays: 8 },
  { orderId: "ORD-1024", customer: "Vikram Singh", date: "2024-01-12", items: 2, amount: 1400, category: "Toys", deliveryStatus: "Delivered", deliveryDays: 4 },
  { orderId: "ORD-1025", customer: "Pooja Verma", date: "2024-01-13", items: 6, amount: 6200, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1026", customer: "Arjun Reddy", date: "2024-01-13", items: 1, amount: 850, category: "Books", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1027", customer: "Neha Joshi", date: "2024-01-14", items: 3, amount: 3100, category: "Furniture", deliveryStatus: "Delivered", deliveryDays: 5 },
  { orderId: "ORD-1028", customer: "Karan Mehta", date: "2024-01-14", items: 5, amount: 4700, category: "Clothing", deliveryStatus: "Delayed", deliveryDays: 7 },
  { orderId: "ORD-1029", customer: "Ritu Desai", date: "2024-01-15", items: 2, amount: 3800, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1030", customer: "Manish Tiwari", date: "2024-01-15", items: 1, amount: 1100, category: "Books", deliveryStatus: "Delivered", deliveryDays: 4 },
  { orderId: "ORD-1031", customer: "Swati Sengupta", date: "2024-01-16", items: 4, amount: 4500, category: "Furniture", deliveryStatus: "Delayed", deliveryDays: 9 },
  { orderId: "ORD-1032", customer: "Gaurav Chopra", date: "2024-01-16", items: 3, amount: 2600, category: "Clothing", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1033", customer: "Divya Nambiar", date: "2024-01-17", items: 2, amount: 1950, category: "Toys", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1034", customer: "Alok Mukherjee", date: "2024-01-17", items: 5, amount: 6400, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 4 },
  { orderId: "ORD-1035", customer: "Bhavna Bhatt", date: "2024-01-18", items: 1, amount: 750, category: "Books", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1036", customer: "Kunal Kapoor", date: "2024-01-18", items: 3, amount: 3400, category: "Clothing", deliveryStatus: "Delayed", deliveryDays: 8 },
  { orderId: "ORD-1037", customer: "Pallavi Ghosh", date: "2024-01-19", items: 2, amount: 2900, category: "Furniture", deliveryStatus: "Delivered", deliveryDays: 4 },
  { orderId: "ORD-1038", customer: "Tarun Bajaj", date: "2024-01-19", items: 4, amount: 5100, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1039", customer: "Geeta Somani", date: "2024-01-20", items: 2, amount: 1650, category: "Toys", deliveryStatus: "Delayed", deliveryDays: 7 },
  { orderId: "ORD-1040", customer: "Vivek Oberoi", date: "2024-01-20", items: 3, amount: 3200, category: "Clothing", deliveryStatus: "Delivered", deliveryDays: 3 },
  { orderId: "ORD-1041", customer: "Aditi Rao", date: "2024-01-21", items: 6, amount: 7200, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 2 },
  { orderId: "ORD-1042", customer: "Sanjay Singhania", date: "2024-01-21", items: 1, amount: 900, category: "Books", deliveryStatus: "Delivered", deliveryDays: 3 }
];

const INITIAL_PRODUCTS = [
  { id: "P101", name: "Laptop Pro", category: "Electronics", price: 45000, stock: 120 },
  { id: "P102", name: "Smartphone Ultra", category: "Electronics", price: 25000, stock: 340 },
  { id: "P103", name: "Tablet Touch", category: "Electronics", price: 18000, stock: 85 },
  { id: "P104", name: "4K Monitor 27\"", category: "Electronics", price: 12000, stock: 60 },
  { id: "P201", name: "Ergonomic Office Chair", category: "Furniture", price: 8500, stock: 45 },
  { id: "P202", name: "Electric Standing Desk", category: "Furniture", price: 15000, stock: 30 },
  { id: "P203", name: "Modular Bookshelf", category: "Furniture", price: 6500, stock: 55 },
  { id: "P301", name: "Cotton Crew T-Shirt", category: "Clothing", price: 800, stock: 500 },
  { id: "P302", name: "Slim Fit Denim Jeans", category: "Clothing", price: 1500, stock: 280 },
  { id: "P303", name: "All-Weather Bomber Jacket", category: "Clothing", price: 3500, stock: 90 },
  { id: "P401", name: "Magnetic Building Blocks", category: "Toys", price: 1200, stock: 200 },
  { id: "P402", name: "High-Speed RC Offroad Car", category: "Toys", price: 2500, stock: 75 },
  { id: "P501", name: "Classic Literature Novel Set", category: "Books", price: 600, stock: 400 },
  { id: "P502", name: "Modern Web Dev Guide", category: "Books", price: 950, stock: 150 }
];

// LocalStorage Persistence Helpers
const ORDERS_STORAGE_KEY = 'analytic_dashboard_orders_data';
const PRODUCTS_STORAGE_KEY = 'analytic_dashboard_products_data';

export const getStoredOrders = () => {
  if (typeof window === 'undefined') return [...INITIAL_SEED_ORDERS];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage orders read error:', e);
  }
  return [...INITIAL_SEED_ORDERS];
};

export const setStoredOrders = (orders) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('mock_dataset_updated', { detail: { count: orders.length } }));
  } catch (e) {
    console.warn('LocalStorage orders write error:', e);
  }
};

export const getStoredProducts = () => {
  if (typeof window === 'undefined') return [...INITIAL_PRODUCTS];
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage products read error:', e);
  }
  return [...INITIAL_PRODUCTS];
};

export const setStoredProducts = (products) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('mock_dataset_updated', { detail: { productsCount: products.length } }));
  } catch (e) {
    console.warn('LocalStorage products write error:', e);
  }
};

/**
 * Synthesizes dynamic records for an arbitrary date window outside seed data
 */
function synthesizeOrdersForDateRange(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

  const orders = [];
  let curr = new Date(start);
  let idCounter = 5000;
  let daysCount = 0;

  while (curr <= end && daysCount < 60) {
    const dateStr = curr.toISOString().slice(0, 10);
    const seed = (curr.getDate() * 7 + curr.getMonth() * 13 + curr.getFullYear()) % 10;
    const ordersToday = 2 + (seed % 4);

    for (let i = 0; i < ordersToday; i++) {
      const cat = baseCategories[(seed + i) % baseCategories.length];
      const isDelayed = (seed + i) % 4 === 0;
      const amount = 800 + ((seed * 340 + i * 510) % 5000);
      orders.push({
        orderId: `ORD-${idCounter++}`,
        customer: customersList[(seed * 2 + i) % customersList.length],
        date: dateStr,
        items: 1 + ((seed + i) % 4),
        amount,
        category: cat,
        deliveryStatus: isDelayed ? "Delayed" : "Delivered",
        deliveryDays: isDelayed ? 7 + ((seed + i) % 4) : 2 + ((seed + i) % 3)
      });
    }

    curr.setDate(curr.getDate() + 1);
    daysCount++;
  }

  return orders;
}

/**
 * Filter orders based on user query parameters.
 */
function getFilteredDataset(filters = {}) {
  const allOrders = getStoredOrders();
  let dataset = [...allOrders];

  if (filters.startDate && filters.endDate) {
    const seedMatches = dataset.filter(o => o.date >= filters.startDate && o.date <= filters.endDate);
    if (seedMatches.length > 0) {
      dataset = seedMatches;
    } else {
      dataset = synthesizeOrdersForDateRange(filters.startDate, filters.endDate);
    }
  } else if (filters.startDate) {
    dataset = dataset.filter(o => o.date >= filters.startDate);
  } else if (filters.endDate) {
    dataset = dataset.filter(o => o.date <= filters.endDate);
  }

  if (filters.category) {
    dataset = dataset.filter(o => o.category.toLowerCase() === filters.category.toLowerCase());
  }

  if (filters.deliveryStatus) {
    dataset = dataset.filter(o => o.deliveryStatus.toLowerCase() === filters.deliveryStatus.toLowerCase());
  }

  return dataset;
}

const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

// Dynamically calculated Summary KPI Card data — derived 100% from actual orders!
export const getMockSummary = async (filters = {}) => {
  await delay(80);
  const orders = getFilteredDataset(filters);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const delayedOrders = orders.filter(o => o.deliveryStatus === 'Delayed').length;
  const deliveredOrders = orders.filter(o => o.deliveryStatus === 'Delivered').length;
  const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(1)) : 0;
  const totalDays = orders.reduce((sum, o) => sum + (o.deliveryDays || 3), 0);
  const averageDeliveryDays = totalOrders > 0 ? Number((totalDays / totalOrders).toFixed(1)) : 0;

  return {
    totalOrders,
    totalRevenue,
    delayedOrders,
    deliveredOrders,
    averageOrderValue,
    averageDeliveryDays,
    // snake_case keys for cross-compatibility
    total_orders: totalOrders,
    total_revenue: totalRevenue,
    delayed_orders: delayedOrders
  };
};

// Dynamically aggregated Revenue trend chart — derived 100% from actual orders!
export const getMockRevenue = async (filters = {}) => {
  await delay(80);
  const orders = getFilteredDataset(filters);

  const map = new Map();
  orders.forEach(o => {
    if (!map.has(o.date)) {
      map.set(o.date, { date: o.date, revenue: 0, orders: 0 });
    }
    const item = map.get(o.date);
    item.revenue += (o.amount || 0);
    item.orders += 1;
  });

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};

// Dynamically aggregated Category chart — derived 100% from actual orders!
export const getMockCategories = async (filters = {}) => {
  await delay(80);
  const orders = getFilteredDataset(filters);

  const map = new Map();
  baseCategories.forEach(cat => map.set(cat, { category: cat, revenue: 0, orders: 0 }));

  orders.forEach(o => {
    const cat = o.category || 'General';
    if (!map.has(cat)) {
      map.set(cat, { category: cat, revenue: 0, orders: 0 });
    }
    const item = map.get(cat);
    item.revenue += (o.amount || 0);
    item.orders += 1;
  });

  let result = Array.from(map.values());
  if (filters.category) {
    result = result.filter(c => c.category.toLowerCase() === filters.category.toLowerCase());
  }
  return result;
};

// Dynamically aggregated Delivery performance donut — derived 100% from actual orders!
export const getMockDelivery = async (filters = {}) => {
  await delay(80);
  const orders = getFilteredDataset(filters);

  const delivered = orders.filter(o => o.deliveryStatus === 'Delivered').length;
  const delayed = orders.filter(o => o.deliveryStatus === 'Delayed').length;

  return {
    delivered,
    delayed,
    unknown: 0
  };
};

// Dynamically filtered Orders table — derived 100% from actual orders!
export const getMockOrders = async (filters = {}) => {
  await delay(80);
  return getFilteredDataset(filters);
};

// Products catalog
export const getMockProducts = async (filters = {}) => {
  await delay(80);
  let products = getStoredProducts();
  if (filters?.category) {
    products = products.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
  }
  return products;
};

// Pipeline status counter
export const mockGetPipelineStatus = async () => {
  await delay(60);
  const orders = getStoredOrders();
  const products = getStoredProducts();
  const uniqueCustomers = new Set(orders.map(o => o.customer)).size;

  return {
    success: true,
    data: {
      orders: orders.length,
      customers: Math.max(uniqueCustomers, 12),
      products: products.length,
      shipments: orders.length,
      orderItems: orders.reduce((sum, o) => sum + (o.items || 1), 0)
    }
  };
};

// JSON Ingestion — parses, validates, and stores orders to update entire app!
export const mockIngestJson = async (fileOrData) => {
  await delay(200);
  let newOrders = [];

  try {
    let parsed = fileOrData;
    if (typeof File !== 'undefined' && fileOrData instanceof File) {
      const text = await fileOrData.text();
      parsed = JSON.parse(text);
    } else if (typeof fileOrData === 'string' && fileOrData.trim()) {
      parsed = JSON.parse(fileOrData);
    }

    if (Array.isArray(parsed)) {
      newOrders = parsed;
    } else if (parsed && typeof parsed === 'object') {
      newOrders = parsed.orders || parsed.data || parsed.items || (parsed.order_id || parsed.id ? [parsed] : []);
    }
  } catch (err) {
    console.warn('[MockIngest] JSON parse notice:', err.message);
  }

  // If empty payload, ingest fresh sample batch
  if (!newOrders || newOrders.length === 0) {
    const timestamp = Date.now().toString().slice(-4);
    newOrders = [
      { orderId: `ORD-${timestamp}-1`, customer: "Sample User A", date: "2024-01-22", items: 2, amount: 2800, category: "Electronics", deliveryStatus: "Delivered", deliveryDays: 3 },
      { orderId: `ORD-${timestamp}-2`, customer: "Sample User B", date: "2024-01-22", items: 1, amount: 1600, category: "Furniture", deliveryStatus: "Delayed", deliveryDays: 8 },
      { orderId: `ORD-${timestamp}-3`, customer: "Sample User C", date: "2024-01-23", items: 3, amount: 3400, category: "Clothing", deliveryStatus: "Delivered", deliveryDays: 2 }
    ];
  }

  // Normalize fields
  const normalized = newOrders.map((o, idx) => ({
    orderId: String(o.order_id || o.orderId || o.id || `ORD-${Date.now().toString().slice(-4)}-${idx}`).trim(),
    customer: typeof o.customer === 'string' ? o.customer : (o.customer?.name || 'Customer'),
    date: String(o.order_date || o.orderDate || o.date || '2024-01-22').slice(0, 10),
    items: Number(o.items?.length || o.items || 1),
    amount: Number(o.amount || o.total || o.price || 1500),
    category: String(o.category || baseCategories[idx % baseCategories.length]),
    deliveryStatus: String(o.deliveryStatus || (idx % 3 === 0 ? "Delayed" : "Delivered")),
    deliveryDays: Number(o.deliveryDays || (idx % 3 === 0 ? 8 : 3))
  }));

  const current = getStoredOrders();
  const updated = [...normalized, ...current];
  setStoredOrders(updated);

  return {
    success: true,
    message: 'JSON Orders ingested and pipeline executed successfully',
    ordersIngested: normalized.length,
    normalizedRows: normalized.length * 2,
    dbStats: {
      orders: updated.length,
      customers: new Set(updated.map(o => o.customer)).size,
      products: getStoredProducts().length,
      shipments: updated.length,
      orderItems: updated.reduce((sum, o) => sum + (o.items || 1), 0)
    }
  };
};

export const mockIngestCsv = async (_fileOrData) => {
  await delay(200);
  const products = getStoredProducts();
  const newProduct = {
    id: `P${products.length + 101}`,
    name: `Imported Product ${products.length + 1}`,
    category: baseCategories[products.length % baseCategories.length],
    price: 1200 + (products.length * 150),
    stock: 100
  };
  const updated = [newProduct, ...products];
  setStoredProducts(updated);

  return {
    success: true,
    message: 'CSV Products ingested and pipeline executed successfully',
    productsIngested: 1,
    normalizedRows: 1,
    dbStats: {
      orders: getStoredOrders().length,
      customers: 20,
      products: updated.length,
      shipments: getStoredOrders().length,
      orderItems: getStoredOrders().reduce((sum, o) => sum + (o.items || 1), 0)
    }
  };
};

export const mockIngestXml = async (_fileOrData) => {
  await delay(200);
  // Mark a few orders as delivered
  const orders = getStoredOrders();
  const updated = orders.map((o, idx) => {
    if (idx < 2 && o.deliveryStatus === 'Delayed') {
      return { ...o, deliveryStatus: 'Delivered', deliveryDays: 4 };
    }
    return o;
  });
  setStoredOrders(updated);

  return {
    success: true,
    message: 'XML Shipments ingested and pipeline executed successfully',
    shipmentsIngested: 2,
    normalizedRows: 2,
    dbStats: {
      orders: updated.length,
      customers: 20,
      products: getStoredProducts().length,
      shipments: updated.length,
      orderItems: updated.reduce((sum, o) => sum + (o.items || 1), 0)
    }
  };
};

export const mockSeedData = async () => {
  await delay(300);
  setStoredOrders([...INITIAL_SEED_ORDERS]);
  setStoredProducts([...INITIAL_PRODUCTS]);

  return {
    success: true,
    message: 'Rich demonstration dataset seeded successfully',
    rawOrders: INITIAL_SEED_ORDERS.length,
    dbStats: {
      orders: INITIAL_SEED_ORDERS.length,
      customers: 25,
      products: INITIAL_PRODUCTS.length,
      shipments: INITIAL_SEED_ORDERS.length,
      orderItems: INITIAL_SEED_ORDERS.reduce((sum, o) => sum + (o.items || 1), 0)
    }
  };
};
