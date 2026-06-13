export const globalErrorHandler = (err, req, res, next) => {
  // Capture existing response codes or default to internal system fault boundaries
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || "An unmapped structural operational fault has occurred.",
    // Stack trace hidden securely in production conditions to safeguard backend parameters
    stack: process.env.NODE_ENV === 'production' ? '🔒 Enclosed' : err.stack
  });
};