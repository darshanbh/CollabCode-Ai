const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: String },
  userName: { type: String },
  role: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    default: 'viewer'
  }
});

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  roomName: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  language: { type: String, default: 'javascript' },
  codeContent: { type: String, default: '// Start coding here...' },

  // RBAC
  isLocked: { type: Boolean, default: false },
  participants: [participantSchema],

  // Room type
  roomType: { type: String, enum: ['student', 'teacher'], default: 'student' },

  // Teacher controls
  disableAI: { type: Boolean, default: false },
  disableChat: { type: Boolean, default: false },

  // Exam Mode
  mode: { type: String, enum: ['collab', 'exam'], default: 'collab' },
  examDuration: { type: Number, default: 30 },
  examStartedAt: { type: Date, default: null },
  examEnded: { type: Boolean, default: false },
  examQuestion: { type: String, default: '' }

}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);