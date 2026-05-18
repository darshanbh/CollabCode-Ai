const Session = require('../models/Session');

// GET /api/sessions/:roomId
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findOne({ roomId: req.params.roomId });
    if (!session) {
      return res.status(404).json({ message: 'No session found' });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/sessions/snapshot
exports.saveSnapshot = async (req, res) => {
  console.log('Snapshot received:', req.body);

  const { roomId, studentId, code, keystrokes } = req.body;

  if (!roomId || !studentId || !code) {
    return res.status(400).json({
      message: 'Missing fields',
      received: req.body
    });
  }

  try {
    // Get student name from user if available
    const studentName = req.user?.name || 'Unknown';

    await Session.findOneAndUpdate(
  { roomId: `${roomId}_${studentId}` },
      {
        $push: {
          snapshots: {
            studentId: studentId,
            studentName: studentName,
            code: code,
            timestamp: new Date(),
            keystrokes: keystrokes || []   // ← ADD THIS
          }
        }
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Snapshot saved' });

  } catch (err) {
    console.error('Snapshot error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};