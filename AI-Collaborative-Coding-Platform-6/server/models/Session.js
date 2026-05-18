const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  code: { type: String },
  timestamp: { type: Date, default: Date.now },
  keystrokes: [          // ← ADD THIS
    {
      type: { type: String },   // 'keystroke' or 'paste'
      key: { type: String },
      length: { type: Number },
      timestamp: { type: Number }
    }
  ]
});
const sessionSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  snapshots: [snapshotSchema]
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);