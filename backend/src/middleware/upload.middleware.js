const multer = require('multer');
const path = require('path');

// Memory storage keeps uploaded files in RAM buffer, preventing disk malware persistence
const storage = multer.memoryStorage();

// Allowed file extensions and MIME types
const allowedExtensions = ['.json', '.csv', '.xml'];
const allowedMimeTypes = [
  'application/json',
  'text/json',
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'text/xml',
  'application/xml'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`Invalid file extension: '${ext}'. Only .json, .csv, and .xml files are allowed.`), false);
  }

  // Permissive check for browser-reported MIME types with extension confirmation
  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'text/plain' || file.mimetype === 'application/octet-stream') {
    return cb(null, true);
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB safe limit per file
  },
  fileFilter
});

module.exports = upload;
