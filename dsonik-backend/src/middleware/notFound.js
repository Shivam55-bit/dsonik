const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  res.json({
    success: false,
    message: error.message
  });
};

module.exports = notFound;
