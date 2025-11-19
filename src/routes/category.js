const express = require("express");
const router = express.Router();
const { auth, permit } = require("../middlewares/auth");
const ctrl = require("../controllers/categoryController");

// Public
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);

// Admin only
router.post("/", auth, permit("admin"), ctrl.create);
router.delete("/:id", auth, permit("admin"), ctrl.remove);

module.exports = router;
