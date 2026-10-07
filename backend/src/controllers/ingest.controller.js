const path = require('path');
const fs = require('fs');
const jsonService = require('../services/json.service');
const csvService = require('../services/csv.service');
const xmlService = require('../services/xml.service');
const storageService = require('../services/storage.service');

const dataDir = path.join(__dirname, '../../data');
const rootDataDir = path.join(__dirname, '../../../data');
const rootDataDirCap = path.join(__dirname, '../../../Data');
const essentialDir = path.join(__dirname, '../../../essential');

function getFallbackFilePath(filename) {
  const candidateDirs = [dataDir, rootDataDir, rootDataDirCap, essentialDir];
  for (const dir of candidateDirs) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) return filePath;
  }
  return path.join(dataDir, filename);
}

class IngestController {
  async ingestJson(req, res, next) {
    try {
      let input;
      if (req.file) {
        input = req.file.buffer;
      } else if (req.body && (req.body.orders || req.body.data)) {
        input = req.body.orders || req.body.data;
      } else if (req.body && Object.keys(req.body).length > 0) {
        input = req.body;
      } else {
        input = getFallbackFilePath('Orders.json');
      }

      let orders = jsonService.parseOrders(input);
      if (orders.length === 0) {
        orders = jsonService.parseOrders(getFallbackFilePath('Orders.json'));
      }
      const result = await storageService.saveNormalizedData({ orders });

      res.json({
        success: true,
        message: 'JSON Orders ingested and pipeline executed successfully',
        ordersIngested: orders.length,
        normalizedRows: result.normalizedRows,
        dbStats: result.dbStats
      });
    } catch (error) {
      next(error);
    }
  }

  async ingestCsv(req, res, next) {
    try {
      let input;
      if (req.file) {
        input = req.file.buffer;
      } else if (req.body && req.body.data) {
        input = req.body.data;
      } else if (typeof req.body === 'string' && req.body.trim()) {
        input = req.body;
      } else {
        input = getFallbackFilePath('Products.csv');
      }

      const products = csvService.parseProducts(input);
      const result = await storageService.saveNormalizedData({ products });

      res.json({
        success: true,
        message: 'CSV Products ingested and pipeline executed successfully',
        productsIngested: products.length,
        normalizedRows: result.normalizedRows,
        dbStats: result.dbStats
      });
    } catch (error) {
      next(error);
    }
  }

  async ingestXml(req, res, next) {
    try {
      let input;
      if (req.file) {
        input = req.file.buffer;
      } else if (req.body && req.body.data) {
        input = req.body.data;
      } else if (typeof req.body === 'string' && req.body.trim()) {
        input = req.body;
      } else {
        input = getFallbackFilePath('Shipment.xml');
      }

      const shipments = xmlService.parseShipments(input);
      const result = await storageService.saveNormalizedData({ shipments });

      res.json({
        success: true,
        message: 'XML Shipments ingested and pipeline executed successfully',
        shipmentsIngested: shipments.length,
        normalizedRows: result.normalizedRows,
        dbStats: result.dbStats
      });
    } catch (error) {
      next(error);
    }
  }

  async ingestAll(req, res, next) {
    try {
      const customInputs = {};

      if (req.files) {
        if (req.files.orders && req.files.orders[0]) {
          customInputs.orders = req.files.orders[0].buffer;
        }
        if (req.files.products && req.files.products[0]) {
          customInputs.products = req.files.products[0].buffer;
        }
        if (req.files.shipments && req.files.shipments[0]) {
          customInputs.shipments = req.files.shipments[0].buffer;
        }
      }

      const result = await storageService.saveNormalizedData(customInputs);

      res.json({
        success: true,
        message: 'Full ingestion and transformation pipeline executed successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async seedData(req, res, next) {
    try {
      const result = await storageService.seedRichSampleData();
      res.json({
        success: true,
        message: 'Rich demonstration dataset seeded successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  getStatus(req, res, next) {
    try {
      const stats = storageService.getDatabaseStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IngestController();
