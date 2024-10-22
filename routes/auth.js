const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");

const rateLimit = require("express-rate-limit");

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// router.use(limiter);

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

// Register
router.post(
  "/register/admin",
  [
    body("username").not().isEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),

  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      //check if email already exist
      let user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        return res.status(400).json({ msg: "email already exists" });
      }
      //check if username already exist
      user = await prisma.user.findUnique({ where: { username } });
      if (user) {
        return res.status(400).json({ msg: "Username already taken" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      const payload = { user: { id: user.id , type:'admin'} };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);
// client Register
router.post(
  "/register/client",
  [
    body("username").not().isEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("accounttype").optional().isIn(["personal", "business"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password , accountType } = req.body;

    try {
      //check if email already exist
      let client = await prisma.client.findUnique({ where: { email } });
      if (client) {
        return res.status(400).json({ msg: "email already exists" });
      }
      //check if username already exist
      client = await prisma.client.findUnique({ where: { username } });
      if (client) {
        return res.status(400).json({ msg: "Username already taken" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      client = await prisma.client.create({
        data: {
          username,
          email,
          password: hashedPassword,
          accountType,
          // accountType: accounttype || "personal",
        },
      });

      const payload = { user: { id: client.id , email:client.email, type:'client' } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await prisma.user.findUnique({ where: { email } });
      let isclient = false;
      
      if (!user) {
        user = await prisma.user.findUnique({where:{email}})
        // return res.status(400).json({ msg: "wrong email" });
        isclient = true;
      }
      if (!user) {        
        return res.status(400).json({ msg: "wrong email" });       
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "wrong password" });
      }

      const payload = { user: { id: user.id , type: isclient ? 'client':'admin', email:user?.email } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token, msg: "Login successful! " , usertype:isclient ? 'client':'admin' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);
router.post(
  "/login/client",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let client = await prisma.client.findUnique({ where: { email } });
      let isclient = false;
      
      if (!client) {
        client = await prisma.client.findUnique({where:{email}})
        // return res.status(400).json({ msg: "wrong email" });
        isclient = true;
      }
      if (!client) {        
        return res.status(400).json({ msg: "wrong email" });       
      }
      const isMatch = await bcrypt.compare(password, client.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "wrong password" });
      }

      const payload = { client: { id: client.id , type: isclient ? 'client':'admin', email:client?.email } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token, msg: "Login successful! " , usertype:isclient ? 'client':'admin', });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Protected route example
router.get("/me", auth, async (req, res) => {
  // try {
  //   const user = await prisma.user.findUnique({
  //     where: { id: req.user.id },
  //     select: { id: true, username: true, email: true },
  //   });
  //   res.json(user);
  // } catch (err) {
  //   console.error(err.message);
  //   res.status(500).send("Server error");
  // }
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

module.exports = router;
