const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    if (Object.keys(err.keyValue).includes('email')) {
      message = 'Email already exists';
    }
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, message: message });
  }

  // JWT invalid token
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    return res.status(401).json({ success: false, message });
  }

  // JWT expired token
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    return res.status(401).json({ success: false, message });
  }

  // Default to 500 server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
