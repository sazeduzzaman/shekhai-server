const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadController = require("../controllers/uploadController");

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || "users"; // dynamic folder from frontend
    const dir = path.join(process.cwd(), "uploads", folder);

    // Create folder recursively if not exists
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/v1/uploads
router.post("/", auth, upload.single("file"), uploadController.uploadFile);

module.exports = router;
