const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Default error
    // let statusCode = err.statusCode || 500;
    let message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;
  
    // Handle specific errors
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Invalid input data';
    } else if (err.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Unauthorized access';
    }
  
    res.status(statusCode).json({
      status: 'error',
      message
    });
  };
  
  module.exports = errorHandler;