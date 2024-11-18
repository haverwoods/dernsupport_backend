// const express = require("express");
// const multer = require("multer");
// const { body, validationResult } = require("express-validator");
// const { PrismaClient } = require("@prisma/client");

// const router = express.Router();
// const prisma = new PrismaClient();

// // Configure multer for file storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./storage");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// // image uplaod route
// router.post("/upload", upload.single("image"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ msg: "No file uploaded" });
//     }

//     const filePath = req.file.path;

//     res.status(200).json({
//       msg: "Image uploaded successfully",
//       filePath: filePath,
//     });
//   } catch (error) {
//     console.error("Error uploading image: ", error.message);
//     res.status(500).send("Server error");
//   }
// });

// router.post(
//   "/request",
//   upload.single("image"),
//   [
//     body("description").not().isEmpty().trim().escape(),
//     body("clientId").isInt().withMessage("User ID must be an integer"),
//     body("pickupDate").not().isEmpty().withMessage("Pickup date is required"),
//   ],
//   async (req, res) => {
//     console.log("Received request body:", req.body);

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { description, clientId, pickupDate } = req.body;
//     const imageUrl = req.file ? req.file.path : null;

//     try {
//       const client = await prisma.client.findUnique({
//         where: { id: parseInt(clientId) },
//         select: {
//           id: true,
//           email: true,
//         },
//       });

//       // if (!client.id) {
//       //   return res.status(404).json({ msg: "User not found" });
//       // }

//       //new request
//       const newRequest = await prisma.request.create({
//         data: {
//           description,
//           imageUrl,
//           client: {connect: {
//               id: parseInt(clientId), // request to existing client using the clientId
//             },
//           },
//           clientemail: client.email,
//           pickupDate,
//         },
//       });

//       console.log("New request created:", newRequest);
//       res.status(201).json(newRequest);
//     } catch (err) {
//       console.error("Error creating request: ", err);
//       res.status(500).json({ error: err.message || "Server error" });
//     }
//   }
// );

// router.get("/request", async (req, res) => {
//   try {
//     const request = await prisma.request.findMany();
//     res.json(request);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// module.exports = router;
const express = require("express");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./storage");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Image upload route
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    res.status(200).json({
      message: "Image uploaded successfully",
      filePath: filePath,
    });
  } catch (error) {
    console.error("Error uploading image:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/request",
  upload.single("image"),
  [
    body("description")
      .not()
      .isEmpty()
      .withMessage("Description is required")
      .trim()
      .escape(),
    body("clientId").isInt().withMessage("User ID must be an integer"),
    body("clientEmail").isEmail().withMessage("A valid email is required"),
    body("pickupDate").not().isEmpty().withMessage("Pickup date is required"),
  ],
  async (req, res) => {
    console.log("Received request body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    const { description, clientId, pickupDate } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    try {
      const client = await prisma.client.findUnique({
        where: { id: parseInt(clientId) },
        select: {
          id: true,
          email: true,
        },
      });

      const newRequest = await prisma.request.create({
        data: {
          description,
          imageUrl,
          client: {
            connect: {
              id: parseInt(clientId), // request to existing client using the clientId
            },
          },
          clientEmail: client.email,
          pickupDate,
        },
      });
            res.status(200).json({
              message: "Repair request submitted successfully",

            });
          } catch (error) {
            console.error("Error submitting repair request:", error.message);
            res.status(500).json({ message: "Server error" });

          }
        }
      );
      // console.log("New request created:", newRequest);
      // res.status(201).json(newRequest);
//      catch (err) {
//       console.error("Error creating request: ", err);
//       res.status(500).json({ error: err.message || "Server error" });
//     }
//   }
// );
router.get("/request", async (req, res) => {
  try {
    const request = await prisma.request.findMany();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
module.exports = router;
