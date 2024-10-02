// const express = require('express');
// const upload = require('../middleware/upload'); // Multer configuration file
// const { PrismaClient } = require('@prisma/client');
// const auth = require('./auth').auth; // Import the auth middleware for protected routes

// const router = express.Router();
// const prisma = new PrismaClient();

// // Request submission with image upload
// router.post('/submit-request', auth, upload.single('image'), async (req, res) => {
//   const { description } = req.body;
//   const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

//   try {
//     const newRequest = await prisma.request.create({
//       data: {
//         description,
//         imageUrl,
//         userId: req.user.id, // Use authenticated user's ID from the token
//       },
//     });
//     res.status(200).json({ message: 'Request submitted', request: newRequest });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Admin route to fetch all requests
// router.get('/requests', auth, async (req, res) => {
//   try {
//     const requests = await prisma.request.findMany({
//       include: { user: true },
//     });
//     res.status(200).json(requests);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// module.exports = router;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// const express = require('express');
// const uploads = require('../middleware/upload');
// const { body, validationResult } = require("express-validator");
// const { PrismaClient } = require('@prisma/client'); // Assuming you have a prismaClient.js file for Prisma setup
// const router = express.Router();
// const multer = require("multer")
// const prisma = new PrismaClient();

// // Add this new route to handle image uploads
// router.post(
//   "/upload", 
//   upload.single('image'), // Use the 'upload' middleware configured with multer
//   (req, res) => {
//     try {
//       // Check if file is uploaded
//       if (!req.file) {
//         return res.status(400).json({ msg: "No file uploaded" });
//       }

//       // File information
//       const filePath = req.file.path;

//       // Respond with the file path or any other relevant information
//       res.status(200).json({
//         msg: "Image uploaded successfully",
//         filePath: filePath
//       });
//     } catch (error) {
//       console.error("Error uploading image: ", error.message);
//       res.status(500).send("Server error");
//     }
//   }
// );


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './storage')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-'+ file.originalname  )
//   }
// })

// const upload = multer({ storage: storage })
// // POST endpoint for client to submit a request
// router.post(
//   "/request",
//   [
//     body("description").not().isEmpty().trim().escape(),
//     body("imageUrl").isURL().withMessage("Invalid URL for image"),
//     body("userId").isInt().withMessage("User ID must be an integer"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { description, imageUrl, userId } = req.body;

//     try {
//       // Check if the user exists
//       const user = await prisma.user.findUnique({ where: { id: userId } });
//       if (!user) {
//         return res.status(404).json({ msg: "User not found" });
//       }

//       // Create a new request
//       const newRequest = await prisma.request.create({
//         data: {
//           description,
//           imageUrl,
//           userId,
//         },
//       });

//       res.status(201).json(newRequest);
//     } catch (err) {
//       console.error("Error creating request: ", err.message);
//       res.status(500).send("Server error");
//     }
//   }
// );

// module.exports = router;
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
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    
    // File information
    const filePath = req.file.path;
    
    // Respond with the file path or any other relevant information
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
  upload.single('image'), // Add this line to handle file upload
  [
    body("description").not().isEmpty().trim().escape(),
    body("userId").isInt().withMessage("User ID must be an integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, userId , pickup_date } = req.body;
    const imageUrl = req.file ? req.file.path : null; // Get the file path if an image was uploaded
   

    try {
      // Check if the user exists
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Create a new request
      const newRequest = await prisma.request.create({
        data: {
          description,
          imageUrl,
          userId: parseInt(userId),
          pickup_date,
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
