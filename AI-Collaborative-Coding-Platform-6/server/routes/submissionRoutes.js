const express = require('express');
const router = express.Router();
const {
  submitCode,
  getSubmissions,
  checkPlagiarism,
  analyzeKeystroke,
  combinedAnalysis  // ✅ NEW
} = require('../controllers/submissionController');
const protect = require('../middleware/authMiddleware');

router.post('/submit', protect, submitCode);
router.get('/:roomId', protect, getSubmissions);
router.get('/:roomId/plagiarism', protect, checkPlagiarism);
router.get('/:roomId/keystroke/:studentId', protect, analyzeKeystroke);
router.get('/:roomId/combined', protect, combinedAnalysis); // ✅ NEW

module.exports = router;