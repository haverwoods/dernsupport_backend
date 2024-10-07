
const express = require('express');
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './storage')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Add this new route to handle image uploads
router.post("/upload", upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    
  
    const filePath = req.file.path;
    
  
    res.status(200).json({
      msg: "Image uploaded successfully",
      filePath: filePath
    });
  } catch (error) {
    console.error("Error uploading image: ", error.message);
    res.status(500).send("Server error");
  }
});

// POST endpoint for client to submit a request
router.post(
  "/request",
  upload.single('image'), 
  [
    body("description").not().isEmpty().trim().escape(),
    body("userId").isInt().withMessage("User ID must be an integer"),
    // body("userEmail").isEmail().withMessage("Valid email is required"),
    body("pickupDate").not().isEmpty().withMessage("Pickup date is required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, userId ,  pickupDate } = req.body;
    // const { description, userId ,  userEmail, pickupDate } = req.body;
    const imageUrl = req.file ? req.file.path : null; 
   

    try {
      // Check if the user exists
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      // const email = await prisma.user.findUnique({ where: { id: parseInt(userEmail) } });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // if (user.email !== email) {
      //   return res.status(400).json({ msg: "Email does not match the user." });
      // }

    
      const newRequest = await prisma.request.create({
        data: {
          description,
          imageUrl,
          userId: parseInt(userId),
          // userEmail,
          pickupDate,
        },
      });

      res.status(201).json(newRequest);
    } catch (err) {
      console.error("Error creating request: ", err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
