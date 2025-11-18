const express = require("express");
const router = express.Router();
const { auth, permit } = require("../middlewares/auth");
const coursesCtrl = require('../controllers/courseController');

// Anyone can list & view published courses
router.get("/", coursesCtrl.list);
router.get("/:id", coursesCtrl.get);

// Create course (instructor & admin)
router.post("/", auth, permit("instructor", "admin"), coursesCtrl.create);

// Update course (instructor owns course or admin)
router.put("/:id", auth, permit("instructor", "admin"), coursesCtrl.update);

// Delete course (instructor owns course or admin)
router.delete("/:id", auth, permit("instructor", "admin"), coursesCtrl.remove);

module.exports = router;
