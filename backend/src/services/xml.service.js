const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const { isSafeFilePath } = require('../utils/security.util');

class XmlService {
  /**
   * Parse shipments from safe file path, raw string, buffer, or array
   * @param {string|Buffer|Array} input 
   * @returns {Array} List of shipment records
   */
  parseShipments(input) {
    if (Array.isArray(input)) {
      return input;
    }

    let raw;
    if (input instanceof Buffer) {
      raw = input.toString('utf8');
    } else if (typeof input === 'string') {
      if (isSafeFilePath(input)) {
        raw = fs.readFileSync(input, 'utf8');
      } else {
        raw = input;
      }
    } else {
      throw new Error('Unsupported input type for XML parser');
    }

    raw = raw.replace(/^\uFEFF/, '').trim();

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      trimValues: true,
      // Security: Disable XML Entity Expansion (XXE) attacks
      processEntities: false,
      stopNodes: []
    });

    let parsed;
    try {
      parsed = parser.parse(raw);
    } catch (err) {
      throw new Error(`Failed to parse Shipment XML: ${err.message}`);
    }

    if (!parsed) {
      throw new Error('Empty XML document.');
    }

    let shipments = null;
    if (parsed.shipments && parsed.shipments.shipment) {
      shipments = parsed.shipments.shipment;
    } else if (parsed.shipment) {
      shipments = parsed.shipment;
    } else if (parsed.root && parsed.root.shipment) {
      shipments = parsed.root.shipment;
    } else {
      throw new Error('Invalid XML structure: Missing <shipments> or <shipment> elements.');
    }

    if (!Array.isArray(shipments)) {
      shipments = [shipments];
    }

    return shipments.map(s => ({
      shipment_id: s.shipment_id ? String(s.shipment_id).trim() : null,
      order_id: s.order_id ? String(s.order_id).trim() : null,
      delivery_days: (!isNaN(Number(s.delivery_days)) && s.delivery_days !== null) ? Number(s.delivery_days) : null,
      status: s.status ? String(s.status).trim() : 'Unknown'
    }));
  }
}

module.exports = new XmlService();
