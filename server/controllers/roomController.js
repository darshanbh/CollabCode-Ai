const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');

exports.createRoom = async (req, res) => {
  const { roomName, language, mode, examDuration, roomType, disableAI, disableChat } = req.body;
  try {
    const roomId = uuidv4().slice(0, 8).toUpperCase();
    const room = await Room.create({
      roomId,
      roomName,
      language: language || 'javascript',
      createdBy: req.user.id,
      mode: mode || 'collab',
      examDuration: examDuration || 30,
      roomType: roomType || 'student',
      disableAI: disableAI || false,
      disableChat: disableChat || false,
      participants: [{
        userId: String(req.user.id),
        userName: req.user.name,
        role: 'owner'
      }]
    });
    res.status(201).json({ message: 'Room created', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const alreadyIn = room.participants.find(
      p => String(p.userId) === String(req.user.id)
    );
    if (!alreadyIn) {
      room.participants.push({
        userId: String(req.user.id),
        userName: req.user.name,
        role: 'editor'
      });
      await room.save();
    }
    res.json({ message: 'Room found', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.saveCode = async (req, res) => {
  const { codeContent } = req.body;
  try {
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { codeContent },
      { returnDocument: 'after' }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Code saved', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.startExam = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    console.log('room.createdBy:', String(room.createdBy));
    console.log('req.user.id:', String(req.user.id));

    if (String(room.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the room owner can start the exam' });
    }
    room.mode = 'exam';
    room.examStartedAt = new Date();
    room.examEnded = false;
    await room.save();
    res.json({ message: 'Exam started', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.endExam = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (String(room.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the room owner can end the exam' });
    }
    room.examEnded = true;
    room.mode = 'collab';
    await room.save();
    res.json({ message: 'Exam ended', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};