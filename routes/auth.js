
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");

const rateLimit = require("express-rate-limit");
const { usertoAdmin } = require("../seeddata");

const router = express.Router();
const prisma = new PrismaClient();



// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};




// Register client
router.post('/register', 
  [
    body('username').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('accountType').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password, accountType } = req.body;

      // Check if client already exists
      const existingClient = await prisma.client.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingClient) {
        return res.status(400).json({ message: 'Client already exists' });
      }
         // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new client
      const Client = await prisma.client.create({
        data: {
          username,
          email,
          roles: {
            connectOrCreate: {
              where: {
                name: "user",
              },
              create: {
                name: "user",
              },
            }
          },
  
          password: hashedPassword,
          accountType
        },
        include: {
          roles: true, // Fetch the related roles
        },
      });
          // Generate JWT token
          const token = jwt.sign(
            { 
              id: Client.id,
              email: Client.email,
              role:Client.roles,
              accountType: Client.accountType
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );
          console.log(token)
   

      res.status(201).json({
        message: 'Client registered successfully',
        token:token,
        client: {
          id: Client.id,
          username: Client.username,
          email: Client.email,
          role:Client.roles,
          accountType: Client.accountType
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
// Login route
router.post('/login',
  [
    body('email').isEmail(),
    body('password').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find client by email
      const client = await prisma.client.findUnique({
        where: { email },
        include:{
          roles:true
        }
      });

      if (!client) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, client.password);

      if (!isValidPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: client.id,
          email: client.email,
          role:client.roles,
          accountType: client.accountType
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log(token)

      res.json({
        message: 'Login successful',
        token:token,
       
        client: {
          id: client.id,
          username: client.username,
          email: client.email,
          accountType: client.accountType,
          role:client.roles
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
// router.post(
//   "/login/client",
//   [body("email").isEmail().normalizeEmail(), body("password").exists()],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;

//     try {
//       let client = await prisma.client.findUnique({ where: { email } });
//       let isclient = false;
      
//       if (!client) {
//         client = await prisma.client.findUnique({where:{email}})
//         // return res.status(400).json({ msg: "wrong email" });
//         isclient = true;
//       }
//       if (!client) {        
//         return res.status(400).json({ msg: "wrong email" });       
//       }
//       const isMatch = await bcrypt.compare(password, client.password);
//       if (!isMatch) {
//         return res.status(400).json({ msg: "wrong password" });
//       }

//       const payload = { client: { id: client.id , type: isclient ? 'client':'admin', email:client?.email } };
//       const token = jwt.sign(payload, process.env.JWT_SECRET, {
//         expiresIn: "1h",
//       });
//       res.json({ token, msg: "Login successful! " , usertype:isclient ? 'client':'admin', });
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server error");
//     }
//   }
// );

// Protected route example
router.get("/me", auth, async (req, res) => {

  try {
    let user;
    if (req.user.type === 'admin') {
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, username: true, email: true },
      });
    } else {
      user = await prisma.client.findUnique({
        where: { id: req.user.id },
        select: { id: true, username: true, email: true, accountType: true },
      });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/usertoAdmin/:id", usertoAdmin  )

module.exports = router;
