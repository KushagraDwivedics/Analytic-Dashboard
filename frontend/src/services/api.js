import { 
  getMockSummary, 
  getMockRevenue, 
  getMockCategories, 
  getMockDelivery, 
  getMockOrders, 
  getMockProducts,
  mockIngestJson,
  mockIngestCsv,
  mockIngestXml,
  mockSeedData,
  mockGetPipelineStatus
} from './mockApi';

export const DEFAULT_API_URL = 'http://localhost:5000/api';

// Dynamic API URL getter (localStorage -> env var -> default)
export const getApiUrl = () => {
  const stored = localStorage.getItem('custom_api_url');
  if (stored !== null) {
    return stored.trim();
  }
  return (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim();
};

export const setApiUrl = (value) => {
  if (value === null || value === undefined) {
    localStorage.removeItem('custom_api_url');
  } else {
    localStorage.setItem('custom_api_url', String(value).trim());
  }
};

// Allow runtime override via localStorage, defaulting to env var (or false for live API)
export const getUseMock = () => {
  const stored = localStorage.getItem('use_mock_api');
  if (stored !== null) return stored === 'true';
  return import.meta.env.VITE_USE_MOCK_API === 'true';
};

export const setUseMock = (value) => {
  localStorage.setItem('use_mock_api', String(value));
};

const buildQueryString = (filters) => {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.category) params.append('category', filters.category);
  if (filters.deliveryStatus) params.append('deliveryStatus', filters.deliveryStatus);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  const str = params.toString();
  return str ? `?${str}` : '';
};

const fetchAPI = async (endpoint, filters) => {
  const baseUrl = getApiUrl();
  if (!baseUrl) {
    throw new Error('API Error: Backend API URL is empty. Please configure it in Settings.');
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const query = buildQueryString(filters);
  const targetUrl = `${cleanBase}${endpoint}${query}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const response = await fetch(targetUrl, { signal: controller.signal });
  clearTimeout(timeoutId);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText} (${response.status})`);
  }
  const result = await response.json();
  return result.data !== undefined ? result.data : result;
};

/**
 * Try fetching from the live backend first.
 * If it fails (e.g. on Vercel where there is no backend), silently fall back to mock data.
 */
const tryLiveOrMock = async (liveFn, mockFn) => {
  if (getUseMock()) return mockFn();

  // If deployed on HTTPS (like Vercel) and attempting to call insecure http://,
  // browsers will block mixed-content. Fail fast to mock so UI responds instantly.
  const baseUrl = getApiUrl();
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseUrl.startsWith('http:')) {
    return mockFn();
  }

  try {
    return await liveFn();
  } catch {
    // Backend unreachable — auto-fallback to mock data
    return mockFn();
  }
};

// Analytics Data
export const getSummary = async (filters) => {
  return tryLiveOrMock(
    () => fetchAPI('/analytics/summary', filters),
    () => getMockSummary(filters)
  );
};

export const getRevenue = async (filters) => {
  return tryLiveOrMock(
    () => fetchAPI('/analytics/revenue', filters),
    () => getMockRevenue(filters)
  );
};

export const getCategories = async (filters) => {
  return tryLiveOrMock(
    () => fetchAPI('/analytics/categories', filters),
    () => getMockCategories(filters)
  );
};

export const getDelivery = async (filters) => {
  return tryLiveOrMock(
    () => fetchAPI('/analytics/delivery', filters),
    () => getMockDelivery(filters)
  );
};

export const getOrders = async (filters) => {
  return tryLiveOrMock(
    () => fetchAPI('/analytics/orders', filters),
    () => getMockOrders(filters)
  );
};

export const getProducts = async (filters) => {
  return tryLiveOrMock(
    () => fetchAPI('/analytics/products', filters),
    () => getMockProducts(filters)
  );
};

// External APIs
export const getCurrencyRates = async (base = 'INR') => {
  return tryLiveOrMock(
    () => fetchAPI(`/analytics/currency?base=${base}`),
    () => Promise.resolve({ base, rates: { EUR: 0.011, USD: 0.012, INR: 1 } })
  );
};

export const getCountries = async (region = '') => {
  const mockCountries = [
    { name: 'India', capital: 'New Delhi', population: 1380004385, region: 'Asia', currencies: 'INR' },
    { name: 'Germany', capital: 'Berlin', population: 83783942, region: 'Europe', currencies: 'EUR' },
    { name: 'United States', capital: 'Washington, D.C.', population: 331002651, region: 'Americas', currencies: 'USD' },
    { name: 'Japan', capital: 'Tokyo', population: 126476461, region: 'Asia', currencies: 'JPY' },
    { name: 'United Kingdom', capital: 'London', population: 67886011, region: 'Europe', currencies: 'GBP' },
  ];
  return tryLiveOrMock(
    async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) throw new Error('Backend URL is empty');
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const query = region ? `?region=${encodeURIComponent(region)}` : '';
      const response = await fetch(`${cleanBase}/analytics/countries${query}`);
      if (!response.ok) throw new Error('Failed to load countries');
      const res = await response.json();
      return res.data || [];
    },
    () => Promise.resolve(region ? mockCountries.filter(c => c.region === region) : mockCountries)
  );
};

// Data Ingestion APIs
export const ingestJson = async (fileOrData) => {
  return tryLiveOrMock(
    async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) throw new Error('Backend URL is empty');
      const cleanBase = baseUrl.replace(/\/+$/, '');

      let body, headers = {};
      if (fileOrData instanceof File) {
        const formData = new FormData();
        formData.append('file', fileOrData);
        body = formData;
      } else if (typeof fileOrData === 'string') {
        headers['Content-Type'] = 'application/json';
        body = fileOrData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(fileOrData);
      }

      const res = await fetch(`${cleanBase}/ingest/json`, { method: 'POST', headers, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    },
    () => mockIngestJson(fileOrData)
  );
};

export const ingestCsv = async (fileOrData) => {
  return tryLiveOrMock(
    async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) throw new Error('Backend URL is empty');
      const cleanBase = baseUrl.replace(/\/+$/, '');

      let body, headers = {};
      if (fileOrData instanceof File) {
        const formData = new FormData();
        formData.append('file', fileOrData);
        body = formData;
      } else {
        headers['Content-Type'] = 'text/csv';
        body = String(fileOrData);
      }

      const res = await fetch(`${cleanBase}/ingest/csv`, { method: 'POST', headers, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    },
    () => mockIngestCsv(fileOrData)
  );
};

export const ingestXml = async (fileOrData) => {
  return tryLiveOrMock(
    async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) throw new Error('Backend URL is empty');
      const cleanBase = baseUrl.replace(/\/+$/, '');

      let body, headers = {};
      if (fileOrData instanceof File) {
        const formData = new FormData();
        formData.append('file', fileOrData);
        body = formData;
      } else {
        headers['Content-Type'] = 'application/xml';
        body = String(fileOrData);
      }

      const res = await fetch(`${cleanBase}/ingest/xml`, { method: 'POST', headers, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    },
    () => mockIngestXml(fileOrData)
  );
};

export const seedDemoData = async () => {
  return tryLiveOrMock(
    async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) throw new Error('Backend URL is empty');
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanBase}/ingest/seed`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    },
    () => mockSeedData()
  );
};

export const getPipelineStatus = async () => {
  return tryLiveOrMock(
    async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) throw new Error('Backend URL is empty');
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanBase}/ingest/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    },
    () => mockGetPipelineStatus()
  );
};

/**
 * Health check that validates the SPECIFIC URL passed to it
 * Returns { online: false, error: ... } if empty, invalid, or unreachable
 */
export const checkBackendHealth = async (testUrl) => {
  const raw = (testUrl !== undefined && testUrl !== null) ? testUrl.trim() : getApiUrl();
  
  if (!raw) {
    return { online: false, error: 'API URL is empty. Please enter a valid URL.' };
  }

  // Validate URL protocol and format
  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { online: false, error: 'URL must start with http:// or https://' };
    }

    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && parsed.protocol === 'http:') {
      return {
        online: false,
        error: 'The deployed frontend requires a secure HTTPS backend URL.'
      };
    }
  } catch {
    return { online: false, error: 'Invalid URL format (e.g. https://your-domain.com/api)' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const clean = raw.replace(/\/+$/, '');
    const healthUrl = clean.endsWith('/api') ? `${clean}/health` : `${clean}/api/health`;

    const res = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { online: false, error: `The backend returned an unexpected response (HTTP ${res.status}).` };
    }

    const data = await res.json();
    if (!data || data.success !== true) {
      return { online: false, error: 'The backend returned an unexpected response.' };
    }

    return { online: true, data };
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      return { online: false, error: 'The backend rejected this frontend origin. Check the backend CORS configuration.' };
    }
    return { 
      online: false, 
      error: 'Unable to reach the backend API.' 
    };
  }
};
