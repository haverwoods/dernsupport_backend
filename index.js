const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const authroutes = require("./routes/auth");
const requestroute = require("./routes/request")
const productroutes = require("./routes/product")
const userroutes = require("./routes/user")
// const middleware = require("./middleware");
const cors = require('cors');
const verifyRole = require("./middleware/verifyrole")

dotenv.config();


const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const port = process.env.PORT || 5000;
// middleware(app);
app.use(cors({
  origin: [ 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  


//routes
app.use("/api/auth", authroutes);
app.use("/routes/request" , requestroute);
app.use('/api', productroutes)
app.use('/api/user', userroutes)

//start server
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
