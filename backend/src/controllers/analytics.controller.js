const analyticsService = require('../services/analytics.service');
const currencyService = require('../services/currency.service');

class AnalyticsController {
  async getSummary(req, res, next) {
    try {
      const summary = await analyticsService.getSummary(req.query);
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getRevenue(req, res, next) {
    try {
      const revenue = analyticsService.getRevenue(req.query);
      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = analyticsService.getCategories(req.query);
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getDelivery(req, res, next) {
    try {
      const delivery = analyticsService.getDelivery(req.query);
      res.json({
        success: true,
        data: delivery
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = analyticsService.getOrders(req.query);
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req, res, next) {
    try {
      const products = analyticsService.getProducts(req.query);
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrency(req, res, next) {
    try {
      const base = req.query.base || 'INR';
      const rates = await currencyService.getAllRates(base);
      res.json({
        success: true,
        data: rates
      });
    } catch (error) {
      next(error);
    }
  }

  async getCountries(req, res, next) {
    try {
      const countries = await analyticsService.getCountries(req.query.region);
      res.json({
        success: true,
        count: countries.length,
        data: countries
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
