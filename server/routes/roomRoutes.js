const express = require('express');
const router = express.Router();
const {
  createRoom,
  joinRoom,
  getMyRooms,
  saveCode,
  startExam,
  endExam
} = require('../controllers/roomController');
const protect = require('../middleware/authMiddleware');

router.post('/create', protect, createRoom);
router.get('/join/:roomId', protect, joinRoom);
router.get('/my-rooms', protect, getMyRooms);
router.put('/save-code/:roomId', protect, saveCode);
router.post('/start-exam/:roomId', protect, startExam); // ✅ NEW
router.post('/end-exam/:roomId', protect, endExam);     // ✅ NEW

module.exports = router;