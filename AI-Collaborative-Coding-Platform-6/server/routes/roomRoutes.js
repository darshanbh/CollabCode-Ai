const express = require('express');
const router = express.Router();
const {
  createRoom,
  joinRoom,
  getMyRooms,
  saveCode,
  startExam,
  endExam,
  deleteRoom,
  saveQuestion
} = require('../controllers/roomController');
const protect = require('../middleware/authMiddleware');

router.post('/create', protect, createRoom);
router.get('/join/:roomId', protect, joinRoom);
router.get('/my-rooms', protect, getMyRooms);
router.put('/save-code/:roomId', protect, saveCode);
router.put('/save-question/:roomId', protect, saveQuestion); // ✅ NEW
router.post('/start-exam/:roomId', protect, startExam);
router.post('/end-exam/:roomId', protect, endExam);
router.delete('/:roomId', protect, deleteRoom);

module.exports = router;