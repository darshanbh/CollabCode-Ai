const express = require('express');
const router = express.Router();
const { getSession, saveSnapshot } = require('../controllers/sessionController');
const protect = require('../middleware/authMiddleware');

router.get('/:roomId', protect, getSession);
router.post('/snapshot', protect, saveSnapshot);

module.exports = router;