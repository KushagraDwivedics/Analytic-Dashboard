// Centralized error handling middleware with security sanitation
const errorHandler = (err, req, res, next) => {
  // Log error on server side for auditing
  console.error('[API Error]:', err.message);

  const statusCode = err.statusCode || (err.message && err.message.includes('Invalid') ? 400 : 500);
  
  // Sanitize message to prevent leaking database paths or internal system details
  let cleanMessage = err.message || 'An internal server error occurred';
  if (cleanMessage.includes('better-sqlite3') || cleanMessage.includes('SQLITE_')) {
    cleanMessage = 'Database error: Request could not be processed';
  }

  res.status(statusCode).json({
    success: false,
    error: cleanMessage
  });
};

module.exports = errorHandler;
