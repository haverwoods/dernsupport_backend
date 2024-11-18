const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const express = require("express");

// Changed to middleware function
const Security = () => {
  const router = express.Router();
  router.use(helmet());
  router.use(cookieParser());


  // CORS configuration
  router.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:5174',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
  }));

  // Global rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 
  });

  // Apply rate limiting
//   router.use(limiter);

  // Auth routes rate limiter
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

//   router.use('/api/auth', authLimiter);

  return router;
};

module.exports = Security;