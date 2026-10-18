export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error.' : error.message
  });
}
