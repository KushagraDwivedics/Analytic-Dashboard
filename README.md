# Analytics Dashboard & Data Pipeline

A full-stack order analytics dashboard and data ingestion pipeline built with React, Node.js, and SQLite. It imports orders, product catalogs, and shipments across different formats (JSON, CSV, and XML), normalizes them into a relational database, calculates business metrics, and displays them in an interactive dashboard.

🔗 **Live Frontend Demo**: [analytic-dashboard-iota.vercel.app](https://analytic-dashboard-iota.vercel.app/)  
⚙️ **Backend REST API**: Connectable via Dashboard Settings (or set `VITE_API_URL` to your Render backend)  
🩺 **Backend Health Check**: `GET /api/health`

---

## What It Does

In e-commerce systems, operational data usually arrives from separate sources:
- **Orders in JSON** (customer information, order items, quantities, dates)
- **Products in CSV** (catalog details, categories, base prices)
- **Shipments in XML** (delivery days, carrier statuses, delay records)

This project connects those three streams:
1. **Parses & Cleans**: Handles malformed quoting, BOM tags, and nested structures.
2. **Relational Joins**: Matches orders to their respective products and delivery records.
3. **Calculates Metrics**: Flags delayed orders (> 5 days or marked delayed), computes total order values, and converts currency rates via live European Central Bank data (Frankfurter API).
4. **Visualizes**: Live charts for daily revenue trends, category breakdown, delivery performance, and order tracking tables with date & category filters.

---

## Live Demo & Offline Support

The frontend is live on Vercel at [analytic-dashboard-iota.vercel.app](https://analytic-dashboard-iota.vercel.app/).

- **Interactive Out-of-the-Box**: Includes an in-browser data simulator so you can test filters, date ranges, and custom JSON imports right away without needing a local backend running.
- **Connect Live Backend**: You can connect a local or hosted backend anytime from the Settings page.

---

## Tech Stack

- **Frontend**: React, Vite, Recharts, Tailwind CSS, Lucide icons
- **Backend**: Node.js, Express, SQLite (`better-sqlite3`), Multer
- **Parsers**: `csv-parse`, `fast-xml-parser`
- **External APIs**: Frankfurter API (currency exchange), REST Countries

---

## Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/KushagraDwivedics/Analytic-dashboard.git
cd Analytic-dashboard
```

### 2. Environment Variables
Create `.env` files based on the `.env.example` files provided:
- **Frontend** (`frontend/.env`):
  - `VITE_API_URL`: Set to `http://localhost:5000/api` for local development.
  - `VITE_USE_MOCK_API`: Set to `false` to connect to the backend.
- **Backend** (`backend/.env`):
  - `PORT`: Usually `5000`.
  - `NODE_ENV`: Set to `development`.
  - `CORS_ORIGIN`: Set to `http://localhost:5173`.
  - `AUTO_SEED`: Set to `true` to populate initial data.

### 3. Start the Backend API
```bash
cd backend
npm install
npm start
```
The API will start at `http://localhost:5000`. You can verify it by opening `http://localhost:5000/api/health` (Health Check URL).

### 4. Start the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Deployment

### Frontend Deployment (e.g., Vercel, Netlify)
1. Set the root directory to `frontend`.
2. Build command: `npm run build` (This generates the `frontend/dist` directory).
3. Output directory: `dist`.
4. Configure environment variables in the hosting dashboard:
   - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://your-backend-url.onrender.com/api`).
   - `VITE_USE_MOCK_API`: `false`.

### Backend Deployment (e.g., Render, Railway)
1. Set the root directory to `backend`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Configure environment variables in the hosting dashboard:
   - `PORT`: (Often auto-assigned by the platform).
   - `NODE_ENV`: `production`.
   - `CORS_ORIGIN`: The URL of your deployed frontend (e.g., `https://your-frontend-url.vercel.app`).
   - `AUTO_SEED`: `false`.
5. **SQLite Persistence Limitation**: This project uses a local SQLite file (`data/analytics.db`). Many modern cloud hosts (like Render or Heroku) use ephemeral file systems, meaning the database will reset whenever the server restarts. For persistent data, you must configure a persistent disk/volume on your hosting provider and point the database to that volume.

### Connecting Frontend and Backend
Ensure that the frontend's `VITE_API_URL` environment variable is pointing to the backend's deployment URL (with the `/api` suffix), and the backend's `CORS_ORIGIN` environment variable is pointing to the frontend's deployment URL.

## Features

- **Summary KPIs**: Total orders, revenue, average order value, delivered vs. delayed counts.
- **Date & Category Filters**: Quick presets (Week 1, Week 2, Full Dataset) plus custom date pickers.
- **Visual Analytics**:
  - Daily revenue & order volume trend (Area chart)
  - Sales by product category (Bar chart)
  - Delivery delay ratio (Donut chart)
- **Orders Table**: Search by customer or order ID, filter by category or shipment status, with side drawer drilldown.
- **Products Catalog**: Filter inventory by category with stock counts.
- **Data Ingestion Pipeline**:
  - Upload custom JSON orders, CSV products, or XML shipments.
  - One-click button to reset or re-seed the sample database.
- **Live Currency Conversion**: Live exchange rates (EUR, USD, INR) fetched from Frankfurter API with fallback handling.

---

## Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers for analytics and ingestion
│   │   ├── db/             # SQLite connection, tables, and schema migrations
│   │   ├── routes/         # Express API routes (/api/analytics, /api/ingest)
│   │   ├── services/       # File parsers (JSON, CSV, XML), ETL logic, currency service
│   │   └── app.js          # Express app entry point
│   ├── test-e2e.js         # End-to-end API verification test script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Dashboard, Charts, Orders, Pipeline, Settings
│   │   ├── services/       # API client & mock data adapter
│   │   ├── App.jsx         # Navigation shell & routing
│   │   └── index.css       # Tailwind styles
│   └── package.json
│
└── data/                   # Sample raw datasets (Orders.json, Products.csv, Shipment.xml)
```

---

## Testing the API

To run the end-to-end test suite that verifies all routes, data joins, and calculations:

```bash
cd backend
node test-e2e.js
```

---

## Author

- **Kushagra Dwivedi**
- GitHub: [@KushagraDwivedics](https://github.com/KushagraDwivedics)
- Repository: [Analytic-dashboard](https://github.com/KushagraDwivedics/Analytic-dashboard)
