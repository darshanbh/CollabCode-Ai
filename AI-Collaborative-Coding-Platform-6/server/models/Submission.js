const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  submittedAt: { type: Date, default: Date.now },
  isAutoSubmitted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);