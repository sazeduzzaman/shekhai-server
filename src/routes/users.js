const express = require('express');
const router = express.Router();
const { auth, permit } = require('../middlewares/auth');
const User = require('../models/User');

// GET /me - logged-in user info
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json(user);
});

// GET / - all users (admin only) + optional role filter
router.get('/', auth, permit('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role; // filter by role if ?role=xyz

    const users = await User.find(filter).select('-passwordHash'); // hide passwords
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
