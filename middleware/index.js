const express = require("express");
const dotenv = require('dotenv');
const { PrismaClient } = require("@prisma/client");
const authRoutes = require('../routes/auth');
const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Middleware configuration in backend
app.use(cors({
origin: 'http://localhost:5173',
methods: ['GET', 'POST', 'PUT', 'DELETE'],
allowedHeaders: ['Content-Type', 'Authorization'],
}));


// app.use(helmet());
// app.use(morgan('dev'));

const port = process.env.PORT;

app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});