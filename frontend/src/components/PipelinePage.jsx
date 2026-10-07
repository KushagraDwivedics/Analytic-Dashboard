import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Upload, 
  RefreshCw, 
  Globe, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  ingestJson, 
  ingestCsv, 
  ingestXml, 
  seedDemoData, 
  getPipelineStatus, 
  checkBackendHealth, 
  getCurrencyRates,
  getCountries,
  getApiUrl
} from '../services/api';

const PipelinePage = () => {
  const [dbStats, setDbStats] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  
  // File inputs
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);

  // External APIs
  const [currencyData, setCurrencyData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const health = await checkBackendHealth();
      setBackendOnline(health.online);
      const statusRes = await getPipelineStatus();
      if (statusRes && statusRes.success) {
        setDbStats(statusRes.data);
      }
    } catch (e) {
      console.warn('Status refresh warning:', e);
      setBackendOnline(false);
    }
  }, []);

  const loadExternalApis = useCallback(async () => {
    try {
      const curr = await getCurrencyRates('INR');
      setCurrencyData(curr);
    } catch (e) {
      console.warn('Currency rates warning:', e);
    }

    try {
      setLoadingCountries(true);
      const c = await getCountries(selectedRegion);
      setCountries(c.slice(0, 10));
    } catch (e) {
      console.warn('Countries warning:', e);
    } finally {
      setLoadingCountries(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    loadExternalApis();
  }, [loadExternalApis]);

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleIngestJson = async () => {
    setLoadingAction('json');
    try {
      const res = await ingestJson(jsonFile || {});
      if (res.success) {
        showNotification('success', `JSON Ingested: Processed ${res.ordersIngested || 0} orders.`);
        refreshStatus();
      } else {
        showNotification('error', `JSON Ingestion Failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      showNotification('error', `JSON Ingestion Error: ${err.message}`);
    } finally {
      setLoadingAction('');
      setJsonFile(null);
    }
  };

  const handleIngestCsv = async () => {
    setLoadingAction('csv');
    try {
      const res = await ingestCsv(csvFile || '');
      if (res.success) {
        showNotification('success', `CSV Ingested: Processed ${res.productsIngested || 0} products.`);
        refreshStatus();
      } else {
        showNotification('error', `CSV Ingestion Failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      showNotification('error', `CSV Ingestion Error: ${err.message}`);
    } finally {
      setLoadingAction('');
      setCsvFile(null);
    }
  };

  const handleIngestXml = async () => {
    setLoadingAction('xml');
    try {
      const res = await ingestXml(xmlFile || '');
      if (res.success) {
        showNotification('success', `XML Ingested: Processed ${res.shipmentsIngested || 0} shipments.`);
        refreshStatus();
      } else {
        showNotification('error', `XML Ingestion Failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      showNotification('error', `XML Ingestion Error: ${err.message}`);
    } finally {
      setLoadingAction('');
      setXmlFile(null);
    }
  };

  const handleSeedDemo = async () => {
    setLoadingAction('seed');
    try {
      const res = await seedDemoData();
      if (res.success) {
        showNotification('success', `Demo Dataset Seeded: Populated ${res.rawOrders || 41} orders across 14 dates.`);
        refreshStatus();
      } else {
        showNotification('error', `Seed Failed: ${res.error}`);
      }
    } catch (err) {
      showNotification('error', `Seed Error: ${err.message}`);
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
            <Layers className="text-accent" /> Data Pipeline & Ingestion Engine
          </h2>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            ETL pipeline transforming JSON (Orders), CSV (Products), and XML (Shipments) into SQLite relational tables.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-surface max-w-full truncate">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="truncate">{backendOnline ? `Connected (${getApiUrl()})` : 'Backend Disconnected'}</span>
          </div>
          <button
            onClick={refreshStatus}
            className="p-2 border border-border rounded-lg bg-surface text-secondary hover:text-primary hover:bg-slate-50 transition-colors shrink-0"
            title="Refresh Status"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div className={`p-3.5 sm:p-4 rounded-xl border mb-6 flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
          <p className="font-medium text-xs sm:text-sm">{statusMessage.text}</p>
        </div>
      )}

      {/* Database State Banner */}
      <div className="bg-surface rounded-xl border border-border p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-4 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-primary flex items-center gap-2">
              <Database size={18} className="text-accent" /> Relational Storage Status (SQLite)
            </h3>
            <p className="text-xs text-secondary mt-0.5">Database: <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">backend/data/analytics.db</code> (WAL Mode)</p>
          </div>
          <button
            onClick={handleSeedDemo}
            disabled={loadingAction === 'seed'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-50 transition-all shadow-sm"
          >
            <Sparkles size={16} />
            {loadingAction === 'seed' ? 'Seeding Dataset...' : 'Seed Rich Demo Dataset'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-lg border border-border">
            <p className="text-xs font-medium text-secondary uppercase">Orders</p>
            <p className="text-lg sm:text-xl font-bold text-primary mt-1">{dbStats?.orders ?? '-'}</p>
          </div>
          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-lg border border-border">
            <p className="text-xs font-medium text-secondary uppercase">Products</p>
            <p className="text-lg sm:text-xl font-bold text-primary mt-1">{dbStats?.products ?? '-'}</p>
          </div>
          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-lg border border-border">
            <p className="text-xs font-medium text-secondary uppercase">Customers</p>
            <p className="text-lg sm:text-xl font-bold text-primary mt-1">{dbStats?.customers ?? '-'}</p>
          </div>
          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-lg border border-border">
            <p className="text-xs font-medium text-secondary uppercase">Shipments</p>
            <p className="text-lg sm:text-xl font-bold text-primary mt-1">{dbStats?.shipments ?? '-'}</p>
          </div>
          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-lg border border-border">
            <p className="text-xs font-medium text-secondary uppercase">Order Items</p>
            <p className="text-lg sm:text-xl font-bold text-primary mt-1">{dbStats?.orderItems ?? '-'}</p>
          </div>
        </div>
      </div>

      {/* Ingestion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* JSON Orders */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                JSON
              </span>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">Orders Endpoint</span>
            </div>
            <h4 className="text-base font-semibold text-primary mb-1">Nested JSON Ingestion</h4>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Flattens nested orders + items, sanitizes double-quoted JSON strings, and extracts customer objects.
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center mb-4 hover:border-accent transition-colors">
              <input
                type="file"
                accept=".json"
                id="json-file-input"
                className="hidden"
                onChange={(e) => setJsonFile(e.target.files[0])}
              />
              <label htmlFor="json-file-input" className="cursor-pointer block">
                <Upload size={20} className="mx-auto text-secondary mb-1" />
                <p className="text-xs font-medium text-primary">
                  {jsonFile ? jsonFile.name : 'Upload Orders.json'}
                </p>
                <p className="text-[11px] text-secondary">or trigger default baseline</p>
              </label>
            </div>
          </div>

          <button
            onClick={handleIngestJson}
            disabled={loadingAction === 'json'}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loadingAction === 'json' ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            Ingest JSON (/api/ingest/json)
          </button>
        </div>

        {/* CSV Products */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                CSV
              </span>
              <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">Products Endpoint</span>
            </div>
            <h4 className="text-base font-semibold text-primary mb-1">Products CSV Parser</h4>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Handles outer quotes, strips BOM headers, validates ProductID/Category columns, and handles data types.
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center mb-4 hover:border-emerald-500 transition-colors">
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={(e) => setCsvFile(e.target.files[0])}
              />
              <label htmlFor="csv-file-input" className="cursor-pointer block">
                <Upload size={20} className="mx-auto text-secondary mb-1" />
                <p className="text-xs font-medium text-primary">
                  {csvFile ? csvFile.name : 'Upload Products.csv'}
                </p>
                <p className="text-[11px] text-secondary">or trigger default baseline</p>
              </label>
            </div>
          </div>

          <button
            onClick={handleIngestCsv}
            disabled={loadingAction === 'csv'}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loadingAction === 'csv' ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            Ingest CSV (/api/ingest/csv)
          </button>
        </div>

        {/* XML Shipments */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                XML
              </span>
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium">Shipments Endpoint</span>
            </div>
            <h4 className="text-base font-semibold text-primary mb-1">XML Shipment Parser</h4>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Parses &lt;shipments&gt; tree, normalizes single vs array objects, calculates delay flags (&gt;5 days or Delayed).
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center mb-4 hover:border-amber-500 transition-colors">
              <input
                type="file"
                accept=".xml"
                id="xml-file-input"
                className="hidden"
                onChange={(e) => setXmlFile(e.target.files[0])}
              />
              <label htmlFor="xml-file-input" className="cursor-pointer block">
                <Upload size={20} className="mx-auto text-secondary mb-1" />
                <p className="text-xs font-medium text-primary">
                  {xmlFile ? xmlFile.name : 'Upload Shipment.xml'}
                </p>
                <p className="text-[11px] text-secondary">or trigger default baseline</p>
              </label>
            </div>
          </div>

          <button
            onClick={handleIngestXml}
            disabled={loadingAction === 'xml'}
            className="w-full py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loadingAction === 'xml' ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            Ingest XML (/api/ingest/xml)
          </button>
        </div>
      </div>

      {/* External API Integration Showcase (Full Width) */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
          <Globe size={18} className="text-accent" /> External API Integrations
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Currency conversion card */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-blue-600" />
                <span className="text-xs font-bold uppercase text-blue-900 tracking-wider">Frankfurter Currency API</span>
              </div>
              <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">Live Rates</span>
            </div>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Provides real-time currency conversions with 1-hour in-memory cache and resilient fallback rates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-white p-3 rounded-lg border border-blue-100 text-center shadow-xs">
                <span className="text-[10px] text-secondary uppercase font-semibold">1 INR → EUR</span>
                <p className="text-base font-bold text-primary mt-1">€{currencyData?.rates?.EUR?.toFixed(4) || '0.0092'}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100 text-center shadow-xs">
                <span className="text-[10px] text-secondary uppercase font-semibold">1 INR → USD</span>
                <p className="text-base font-bold text-primary mt-1">${currencyData?.rates?.USD?.toFixed(4) || '0.0120'}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100 text-center shadow-xs">
                <span className="text-[10px] text-secondary uppercase font-semibold">Base Currency</span>
                <p className="text-base font-bold text-primary mt-1">INR (₹)</p>
              </div>
            </div>
          </div>

          {/* REST Countries API */}
          <div className="bg-slate-50 border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-secondary tracking-wider">REST Countries Demographic API</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-xs border border-border rounded-md px-2.5 py-1 bg-white text-primary font-medium focus:outline-none"
              >
                <option value="">All Regions</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Americas">Americas</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>
            {loadingCountries ? (
              <div className="p-8 text-center text-xs text-secondary animate-pulse">Loading demographic data...</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {countries.map(c => (
                  <div key={c.name} className="flex items-center justify-between p-2.5 bg-white border border-border rounded-lg text-xs shadow-xs">
                    <span className="font-semibold text-primary">{c.name}</span>
                    <span className="text-secondary">{c.region}</span>
                    <span className="font-medium text-slate-700">{(c.population / 1000000).toFixed(1)}M pop</span>
                    <span className="text-accent font-semibold">{c.currencies}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;
