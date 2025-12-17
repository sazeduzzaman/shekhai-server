const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadController = require("../controllers/uploadController");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dynamically get folder from frontend or default to 'users'
    const folder = req.body.folder || "users";
    const dir = path.join(process.cwd(), "uploads", folder);

    // Automatically create folder if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /uploads
router.post("/", auth, upload.single("file"), uploadController.uploadFile);

module.exports = router;
