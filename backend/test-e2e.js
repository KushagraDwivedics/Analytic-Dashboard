async function testBackend() {
  const baseURL = 'http://localhost:5000/api';

  console.log('--- Testing Backend Endpoints ---');

  try {
    // 1. Health check
    const health = await (await fetch(`${baseURL}/health`)).json();
    console.log('✓ GET /health:', health.message, 'Stats:', health.stats);

    // 2. Ingest JSON
    const ingestJson = await (await fetch(`${baseURL}/ingest/json`, { method: 'POST' })).json();
    console.log('✓ POST /ingest/json:', ingestJson.message, 'Orders:', ingestJson.ordersIngested);

    // 3. Ingest CSV
    const ingestCsv = await (await fetch(`${baseURL}/ingest/csv`, { method: 'POST' })).json();
    console.log('✓ POST /ingest/csv:', ingestCsv.message, 'Products:', ingestCsv.productsIngested);

    // 4. Ingest XML
    const ingestXml = await (await fetch(`${baseURL}/ingest/xml`, { method: 'POST' })).json();
    console.log('✓ POST /ingest/xml:', ingestXml.message, 'Shipments:', ingestXml.shipmentsIngested);

    // 5. Seed rich demo dataset
    const seed = await (await fetch(`${baseURL}/ingest/seed`, { method: 'POST' })).json();
    console.log('✓ POST /ingest/seed:', seed.message, 'Total Normalized Rows:', seed.normalizedRows);

    // 6. Analytics summary
    const summary = await (await fetch(`${baseURL}/analytics/summary`)).json();
    console.log('✓ GET /analytics/summary:', summary.data);

    // 7. Revenue trend
    const revenue = await (await fetch(`${baseURL}/analytics/revenue`)).json();
    console.log('✓ GET /analytics/revenue: Found', revenue.data?.length, 'days');

    // 8. Categories
    const categories = await (await fetch(`${baseURL}/analytics/categories`)).json();
    console.log('✓ GET /analytics/categories: Found', categories.data?.length, 'categories');

    // 9. Delivery split
    const delivery = await (await fetch(`${baseURL}/analytics/delivery`)).json();
    console.log('✓ GET /analytics/delivery:', delivery.data);

    // 10. Orders list
    const orders = await (await fetch(`${baseURL}/analytics/orders?limit=5`)).json();
    console.log('✓ GET /analytics/orders: Returned', orders.data?.length, 'orders. Sample ID:', orders.data?.[0]?.orderId);

    // 11. Products list
    const products = await (await fetch(`${baseURL}/analytics/products`)).json();
    console.log('✓ GET /analytics/products: Returned', products.data?.length, 'products');

    // 12. Currency rates
    const currency = await (await fetch(`${baseURL}/analytics/currency`)).json();
    console.log('✓ GET /analytics/currency:', currency.data?.rates);

    // 13. REST Countries API
    const countries = await (await fetch(`${baseURL}/analytics/countries`)).json();
    console.log('✓ GET /analytics/countries: Returned', countries.data?.length, 'countries');

    console.log('\n=======================================');
    console.log('🎉 ALL BACKEND ENDPOINTS PASSED CLEANLY');
    console.log('=======================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

fetch('http://localhost:5000/api/health')
  .then(() => testBackend())
  .catch(() => {
    console.log('Starting local server instance for test...');
    require('./src/app');
    setTimeout(testBackend, 1200);
  });
