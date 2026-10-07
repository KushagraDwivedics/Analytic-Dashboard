class CurrencyService {
  constructor() {
    this.cachedRates = {};
    this.cacheTimestamp = 0;
    this.ttlMs = 60 * 60 * 1000; // 1 hour cache TTL
  }

  /**
   * Fetch exchange rate with graceful offline/error fallback
   * @param {string} targetCurrency e.g. 'EUR', 'USD'
   * @param {string} baseCurrency e.g. 'USD', 'INR'
   */
  async getExchangeRate(targetCurrency = 'EUR', baseCurrency = 'USD') {
    if (targetCurrency === baseCurrency) {
      return 1.0;
    }

    const cacheKey = `${baseCurrency}_${targetCurrency}`;
    const now = Date.now();

    if (this.cachedRates[cacheKey] && (now - this.cacheTimestamp < this.ttlMs)) {
      return this.cachedRates[cacheKey];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Frankfurter API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const rate = data.rates[targetCurrency];
      if (rate && typeof rate === 'number') {
        this.cachedRates[cacheKey] = rate;
        this.cacheTimestamp = now;
        return rate;
      }
      throw new Error('Rate missing in API response');
    } catch (error) {
      // Realistic fallback exchange rates to ensure offline resilience
      const fallbacks = {
        'USD_EUR': 0.92,
        'EUR_USD': 1.09,
        'INR_EUR': 0.011,
        'INR_USD': 0.012,
        'USD_INR': 83.5,
        'EUR_INR': 91.2
      };

      const fallbackRate = fallbacks[cacheKey] || 1.0;
      this.cachedRates[cacheKey] = fallbackRate;
      return fallbackRate;
    }
  }

  async getAllRates(baseCurrency = 'INR') {
    const eurRate = await this.getExchangeRate('EUR', baseCurrency);
    const usdRate = await this.getExchangeRate('USD', baseCurrency);
    return {
      base: baseCurrency,
      rates: {
        EUR: eurRate,
        USD: usdRate,
        INR: baseCurrency === 'INR' ? 1.0 : await this.getExchangeRate('INR', baseCurrency)
      },
      cachedAt: new Date(this.cacheTimestamp || Date.now()).toISOString()
    };
  }

  clearCache() {
    this.cachedRates = {};
    this.cacheTimestamp = 0;
  }
}

module.exports = new CurrencyService();
