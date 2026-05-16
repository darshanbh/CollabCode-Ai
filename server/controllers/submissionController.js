const Submission = require('../models/Submission');
const Room = require('../models/Room');
const Session = require('../models/Session');

// ✅ Step 1 — Normalize code before comparing
function normalizeCode(code) {
  let normalized = code;

  normalized = normalized.replace(/\/\/.*$/gm, '');
  normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
  normalized = normalized.replace(/#.*$/gm, '');

  normalized = normalized.replace(/"[^"]*"/g, '"STR"');
  normalized = normalized.replace(/'[^']*'/g, '"STR"');

  normalized = normalized.replace(/\b\d+(\.\d+)?\b/g, 'NUM');

  const keywords = new Set([
    'function', 'return', 'var', 'let', 'const', 'if', 'else',
    'for', 'while', 'do', 'break', 'continue', 'new', 'this',
    'class', 'import', 'export', 'default', 'typeof', 'instanceof',
    'def', 'print', 'input', 'range', 'len', 'append', 'in',
    'not', 'and', 'or', 'True', 'False', 'None', 'pass', 'lambda',
    'int', 'float', 'double', 'char', 'boolean', 'void', 'static',
    'public', 'private', 'protected', 'main', 'System',
    'out', 'println', 'include', 'stdio', 'printf', 'scanf',
    'null', 'undefined', 'string', 'String', 'array', 'Array'
  ]);

  normalized = normalized.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (word) => {
    return keywords.has(word) ? word : 'VAR';
  });

  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
}

// ✅ Step 2 — LCS based similarity on normalized tokens
function similarityScore(codeA, codeB) {
  const normA = normalizeCode(codeA);
  const normB = normalizeCode(codeB);

  if (normA === normB) return 100;

  const tokensA = normA.split(' ');
  const tokensB = normB.split(' ');
  const m = tokensA.length;
  const n = tokensB.length;

  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensA[i - 1] === tokensB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs = dp[m][n];
  const similarity = (2 * lcs) / (m + n);
  return Math.round(similarity * 100);
}

// ✅ Helper — detect paste from snapshots array
function detectPaste(snapshots) {
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];
    const timeDiff = new Date(curr.timestamp) - new Date(prev.timestamp);
    const charDiff = curr.code.length - prev.code.length;

    if (charDiff > 100 && timeDiff < 2000) {
      return {
        detected: true,
        time: new Date(curr.timestamp).toLocaleTimeString(),
        charsAdded: charDiff,
        inSeconds: (timeDiff / 1000).toFixed(1)
      };
    }
  }
  return { detected: false };
}

// =========================
// @route POST /api/submissions/submit
// =========================
exports.submitCode = async (req, res) => {
  const { roomId, code, language, isAutoSubmitted } = req.body;
  try {
    const existing = await Submission.findOne({
      roomId,
      studentId: String(req.user.id)
    });

    if (existing) {
      existing.code = code;
      existing.language = language;
      existing.submittedAt = new Date();
      existing.isAutoSubmitted = isAutoSubmitted || false;
      await existing.save();
      return res.json({ message: 'Submission updated', submission: existing });
    }

    const submission = await Submission.create({
      roomId,
      studentId: String(req.user.id),
      studentName: req.user.name,
      code,
      language,
      isAutoSubmitted: isAutoSubmitted || false
    });

    res.status(201).json({ message: 'Code submitted', submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================
// @route GET /api/submissions/:roomId
// =========================
exports.getSubmissions = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (String(room.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the room owner can view submissions' });
    }

    const submissions = await Submission.find({ roomId: req.params.roomId })
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================
// @route GET /api/submissions/:roomId/plagiarism
// =========================
exports.checkPlagiarism = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (String(room.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the room owner can check plagiarism' });
    }

    const submissions = await Submission.find({ roomId: req.params.roomId });

    if (submissions.length < 2) {
      return res.json({
        message: 'Need at least 2 submissions to check plagiarism',
        results: []
      });
    }

    const results = [];

    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        const a = submissions[i];
        const b = submissions[j];

        const percentage = similarityScore(a.code, b.code);
        const normA = normalizeCode(a.code);
        const normB = normalizeCode(b.code);

        results.push({
          studentA: a.studentName,
          studentB: b.studentName,
          similarity: percentage,
          flagged: percentage > 70,
          reason: percentage === 100
            ? 'Exact structural match — identical logic after normalization'
            : percentage > 70
              ? 'High structural similarity — possible copy with renamed variables'
              : percentage > 40
                ? 'Moderate similarity — may share common patterns'
                : 'Low similarity — likely independent work',
          normalizedA: normA.slice(0, 200),
          normalizedB: normB.slice(0, 200)
        });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    res.json({ results });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================
// @route GET /api/submissions/:roomId/keystroke/:studentId
// ✅ FIXED — looks up per-student session
// =========================
exports.analyzeKeystroke = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (String(room.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the room owner can view this' });
    }

    // ✅ FIXED — per-student session key
    const studentId = req.params.studentId;
    const sessionKey = `${req.params.roomId}_${studentId}`;
    const session = await Session.findOne({ roomId: sessionKey });

    if (!session || session.snapshots.length === 0) {
      return res.status(404).json({ message: 'No session recording found for this student' });
    }

    const snapshots = session.snapshots;
    const events = [];
    let pasteDetected = false;
    const suspiciousEvents = [];

    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];

      const timeDiff = new Date(curr.timestamp) - new Date(prev.timestamp);
      const charDiff = curr.code.length - prev.code.length;
const isSuspicious = charDiff > 30 && timeDiff < 6000;

      events.push({
        time: new Date(curr.timestamp).toLocaleTimeString(),
        timeDiffSeconds: (timeDiff / 1000).toFixed(1),
        charsDiff: charDiff,
        totalChars: curr.code.length,
        suspicious: isSuspicious
      });

      if (isSuspicious) {
        pasteDetected = true;
        suspiciousEvents.push({
          time: new Date(curr.timestamp).toLocaleTimeString(),
          charsAdded: charDiff,
          inSeconds: (timeDiff / 1000).toFixed(1),
          verdict: `⚠ ${charDiff} characters appeared in ${(timeDiff / 1000).toFixed(1)}s — possible paste`
        });
      }
    }

    const totalTime = snapshots.length > 1
      ? ((new Date(snapshots[snapshots.length - 1].timestamp) - new Date(snapshots[0].timestamp)) / 1000 / 60).toFixed(1)
      : 0;

    const totalChars = snapshots[snapshots.length - 1]?.code?.length || 0;
    const avgCharsPerMinute = totalTime > 0 ? Math.round(totalChars / totalTime) : 0;

    res.json({
      roomId: req.params.roomId,
      totalSnapshots: snapshots.length,
      totalTimeMinutes: totalTime,
      totalCharacters: totalChars,
      avgCharsPerMinute,
      pasteDetected,
      suspiciousEvents,
      verdict: pasteDetected
        ? '🚨 Suspicious activity detected — paste event found'
        : '✅ Normal typing pattern — no paste detected',
      events
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================
// @route GET /api/submissions/:roomId/combined
// ✅ FIXED — per-student session lookup for each pair
// =========================
exports.combinedAnalysis = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (String(room.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the room owner can view this' });
    }

    const submissions = await Submission.find({ roomId: req.params.roomId });
    if (submissions.length < 2) {
      return res.json({ message: 'Need at least 2 submissions', results: [] });
    }

    const results = [];

    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        const a = submissions[i];
        const b = submissions[j];

        // ✅ FIXED — get per-student sessions separately
        const sessionA = await Session.findOne({
          roomId: `${req.params.roomId}_${a.studentId}`
        });
        const sessionB = await Session.findOne({
          roomId: `${req.params.roomId}_${b.studentId}`
        });

        const pasteA = detectPaste(sessionA?.snapshots || []);
        const pasteB = detectPaste(sessionB?.snapshots || []);

        const pasteDetected = pasteA.detected || pasteB.detected;
        const pasteTime = pasteA.detected ? pasteA.time : pasteB.time;
        const pasteStudent = pasteA.detected ? a.studentName : pasteB.detected ? b.studentName : null;

        const plagScore = similarityScore(a.code, b.code);
        const normA = normalizeCode(a.code);
        const normB = normalizeCode(b.code);

        let riskLevel = 'LOW';
        let combinedVerdict = '';

        if (plagScore > 70 && pasteDetected) {
          riskLevel = 'CRITICAL';
          combinedVerdict = `Structural copy detected (${plagScore}%) AND ${pasteStudent} had a paste event at ${pasteTime}. Definitive evidence of cheating.`;
        } else if (plagScore > 70 && !pasteDetected) {
          riskLevel = 'HIGH';
          combinedVerdict = `Structural copy detected (${plagScore}%) but typing appeared normal for both students. Code likely shared externally and retyped manually.`;
        } else if (plagScore <= 70 && pasteDetected) {
          riskLevel = 'MEDIUM';
          combinedVerdict = `${pasteStudent} had a paste event at ${pasteTime} but plagiarism score is low (${plagScore}%). May have pasted their own notes.`;
        } else {
          riskLevel = 'LOW';
          combinedVerdict = `No plagiarism (${plagScore}%) and no paste events detected. Likely independent work.`;
        }

        results.push({
          studentA: a.studentName,
          studentB: b.studentName,
          plagiarismScore: plagScore,
          plagiarismFlagged: plagScore > 70,
          pasteDetected,
          pasteTime: pasteDetected ? pasteTime : null,
          pasteStudent,
          riskLevel,
          combinedVerdict,
          normalizedA: normA.slice(0, 200),
          normalizedB: normB.slice(0, 200)
        });
      }
    }

    results.sort((a, b) => b.plagiarismScore - a.plagiarismScore);
    res.json({ results });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};