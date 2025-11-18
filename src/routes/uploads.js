const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const ctrl = require('../controllers/uploadController');

router.post('/signed-url', auth, ctrl.getSignedUrl);

module.exports = router;
