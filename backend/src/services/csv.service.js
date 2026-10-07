const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { isSafeFilePath } = require('../utils/security.util');

class CsvService {
  /**
   * Parse products from safe file path, raw string, buffer, or array
   * @param {string|Buffer|Array} input 
   * @returns {Array} List of product records
   */
  parseProducts(input) {
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
      throw new Error('Unsupported input type for CSV parser');
    }

    raw = raw.replace(/^\uFEFF/, '').trim();

    // Fix outer quoting on every line if present (e.g. "ProductID,ProductName,Category")
    const fixedCsv = raw.split(/\r?\n/).map(l => {
      const t = l.trim();
      if (t.startsWith('"') && t.endsWith('"') && t.includes(',')) {
        return t.substring(1, t.length - 1);
      }
      return l;
    }).join('\n');

    let records;
    try {
      records = parse(fixedCsv, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (err) {
      throw new Error(`Failed to parse Products CSV: ${err.message}`);
    }

    if (!records || records.length === 0) {
      throw new Error('CSV is empty or could not be parsed.');
    }

    // Normalize keys so both ProductID/product_id, ProductName/product_name work
    return records.map(r => {
      const product_id = r.ProductID || r.product_id || r.id || r.ID || 'UNKNOWN';
      const product_name = r.ProductName || r.product_name || r.name || r.Name || 'Unknown Product';
      const category = r.Category || r.category || 'General';
      const price = Number(r.Price || r.price || 0);

      return {
        ProductID: product_id,
        ProductName: product_name,
        Category: category,
        Price: isNaN(price) ? 0 : price
      };
    });
  }
}

module.exports = new CsvService();
