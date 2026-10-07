const express = require('express');
const router = express.Router();
const ingestController = require('../controllers/ingest.controller');
const upload = require('../middleware/upload.middleware');

router.post('/json', upload.single('file'), ingestController.ingestJson);
router.post('/csv', upload.single('file'), ingestController.ingestCsv);
router.post('/xml', upload.single('file'), ingestController.ingestXml);
router.post(
  '/all',
  upload.fields([
    { name: 'orders', maxCount: 1 },
    { name: 'products', maxCount: 1 },
    { name: 'shipments', maxCount: 1 }
  ]),
  ingestController.ingestAll
);
router.post('/seed', ingestController.seedData);
router.get('/status', ingestController.getStatus);

module.exports = router;
