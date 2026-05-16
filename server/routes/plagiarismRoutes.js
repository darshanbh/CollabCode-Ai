const express = require('express');
const router = express.Router();
const { checkPlagiarism } = require('../controllers/plagiarismController');
const protect = require('../middleware/authMiddleware');

router.get('/:roomId', protect, checkPlagiarism);

module.exports = router;