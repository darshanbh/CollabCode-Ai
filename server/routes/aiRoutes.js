const express = require('express');
const router = express.Router();
const { aiAssist } = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware');

router.post('/assist', protect, aiAssist);

module.exports = router;