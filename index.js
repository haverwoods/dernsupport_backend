const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const authroutes = require("./routes/auth");
// const middleware = require("./middleware");
const cors = require('cors');

dotenv.config();


const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const port = process.env.PORT || 5000;
// middleware(app);
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  }));



//routes
app.use("/api/auth", authroutes);

//start server
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});