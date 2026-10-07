const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// Analytics endpoints
router.get('/summary', analyticsController.getSummary);
router.get('/revenue', analyticsController.getRevenue);
router.get('/categories', analyticsController.getCategories);
router.get('/delivery', analyticsController.getDelivery);
router.get('/orders', analyticsController.getOrders);
router.get('/products', analyticsController.getProducts);

// External API integrations
router.get('/currency', analyticsController.getCurrency);
router.get('/countries', analyticsController.getCountries);

module.exports = router;
