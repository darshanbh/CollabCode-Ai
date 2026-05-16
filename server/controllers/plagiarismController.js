const Room = require('../models/Room');
const Session = require('../models/Session');
const acorn = require('acorn');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function normalizeCode(code) {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/console\.log\(.*?\);?/g, '')
    .replace(/function\s+\w+/g, 'fn')
    .replace(/var|let|const/g, 'var')
    .replace(/\s+/g, ' ')
    .trim();
}

function codeToASTSignature(code) {
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2020,
      errorRecovery: true
    });
    const nodeTypes = [];
    function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (node.type) nodeTypes.push(node.type);
      for (const key of Object.keys(node)) {
        if (key === 'type') continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach(walk);
        else if (child && typeof child === 'object') walk(child);
      }
    }
    walk(ast);
    return nodeTypes.join(' ');
  } catch (e) {
    return normalizeCode(code); // fallback if AST parse fails
  }
}

function cosineSimilarity(a, b) {
  if (!a || !b) return 0;
  const wordsA = a.toLowerCase().split(/\W+/).filter(Boolean);
  const wordsB = b.toLowerCase().split(/\W+/).filter(Boolean);
  const allWords = [...new Set([...wordsA, ...wordsB])];
  const vecA = allWords.map(w => wordsA.filter(x => x === w).length);
  const vecB = allWords.map(w => wordsB.filter(x => x === w).length);
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function computeClassBaseline(results) {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.similarity, 0);
  return Math.round(total / results.length);
}

// ─── MAIN CONTROLLER ─────────────────────────────────────────────────────────

// GET /api/plagiarism/:roomId
exports.checkPlagiarism = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (String(room.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only room owner can view this' });
    }

    const session = await Session.findOne({ roomId: req.params.roomId });

    if (!session || session.snapshots.length === 0) {
      return res.json({
        message: 'No snapshots found. Students must complete exam first.',
        results: []
      });
    }

    // Get last snapshot per student = their final submitted code
    const studentCodes = {};
    for (const snapshot of session.snapshots) {
      studentCodes[snapshot.studentId] = {
        studentId: snapshot.studentId,
        studentName: snapshot.studentName || snapshot.studentId,
        code: snapshot.code,
        timestamp: snapshot.timestamp
      };
    }

    const students = Object.values(studentCodes);
    console.log('Students found for plagiarism check:', students.length);

    if (students.length < 2) {
      return res.json({
        message: `Only ${students.length} student submission found. Need at least 2 to compare.`,
        results: []
      });
    }

    // FIX: fetch all keystroke data ONCE before loop — not inside loop
    // This makes it 1 DB call instead of N² calls for large classes
    const allKeystrokes = session.keystrokes || [];

    function getPasteCountFast(studentId) {
      return allKeystrokes.filter(k =>
        String(k.studentId) === String(studentId) && k.type === 'paste'
      ).length;
    }

    // Step 1: collect raw similarity scores for all pairs
    const rawResults = [];

    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const studentA = students[i];
        const studentB = students[j];
        const codeA = studentA.code || '';
        const codeB = studentB.code || '';

        if (!codeA.trim() || !codeB.trim()) continue;

        // AST-based structural comparison
        const sigA = codeToASTSignature(codeA);
        const sigB = codeToASTSignature(codeB);
        const similarity = cosineSimilarity(sigA, sigB);
        const percentage = Math.round(similarity * 100);

        // Paste count from pre-fetched keystroke data
        const pasteA = getPasteCountFast(studentA.studentId);
        const pasteB = getPasteCountFast(studentB.studentId);

        rawResults.push({
          studentA: studentA.studentName,
          studentB: studentB.studentName,
          studentAId: studentA.studentId,
          studentBId: studentB.studentId,
          similarity: percentage,
          pasteEventsA: pasteA,
          pasteEventsB: pasteB,
        });
      }
    }

    // Step 2: compute dynamic class baseline
    const classAverage = computeClassBaseline(rawResults);

    // Step 3: apply dynamic verdict based on class average
    const finalResults = rawResults.map(r => {
      const deviation = r.similarity - classAverage;
      let flagged = false;
      let verdict = 'Original';
      let note = '';

      if (classAverage > 70) {
        // Whole class has similar code = lab assignment
        // Only flag if this pair is significantly above class average
        if (deviation > 15) {
          flagged = true;
          verdict = 'Flagged';
          note = `${deviation}% above class average (${classAverage}%) — suspicious even for this lab`;
        } else if (deviation > 8) {
          verdict = 'Suspicious';
          note = `Slightly above class average of ${classAverage}% — review recommended`;
        } else {
          verdict = 'Coincidental';
          note = `Matches class average of ${classAverage}% — standard lab code`;
        }
      } else {
        // Normal session — use absolute thresholds
        if (r.similarity > 85) {
          flagged = true;
          verdict = 'Flagged';
          note = 'High structural similarity detected';
        } else if (r.similarity > 60) {
          verdict = 'Suspicious';
          note = 'Moderate similarity — manual review recommended';
        } else {
          verdict = 'Original';
          note = 'Low similarity — looks independent';
        }
      }

      // Strengthen verdict with paste evidence
      if (flagged && (r.pasteEventsA > 2 || r.pasteEventsB > 2)) {
        const who = r.pasteEventsB > r.pasteEventsA ? r.studentB : r.studentA;
        note += `. ${who} had ${Math.max(r.pasteEventsA, r.pasteEventsB)} paste events`;
      }

      return { ...r, deviation, classAverage, flagged, verdict, note };
    });

    finalResults.sort((a, b) => b.similarity - a.similarity);
    res.json({ results: finalResults, classAverage });

  } catch (err) {
    console.error('Plagiarism check error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};