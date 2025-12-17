const path = require("path");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { auth } = require("../middlewares/auth");
const uploadController = require("../controllers/uploadController");

// Save uploads in root /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || "users"; // default folder 'users'
    const dir = path.join(process.cwd(), "uploads", folder);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

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

// POST /api/v1/uploads
router.post("/", auth, upload.single("file"), uploadController.uploadFile);

module.exports = router;
