const Room = require('../models/Room');
const Session = require('../models/Session');

function normalizeCode(code) {
  return code
    .replace(/\/\/.*$/gm, '')              // remove comments
    .replace(/console\.log\(.*?\);?/g, '') // remove console.log
    .replace(/function\s+\w+/g, 'fn')     // normalize function names
    .replace(/var|let|const/g, 'var')     // normalize declarations
    .replace(/\s+/g, ' ')                 // collapse whitespace
    .trim();
}

// Cosine similarity between two code strings
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

// Check if code is a standard well known algorithm
// that any student would write identically
function isStandardAlgorithm(codeA, codeB) {
  const standardPatterns = [
    // Hello world
    /hello.?world/i,
    // Factorial
    /factorial/i,
    // Fibonacci
    /fibonacci|fib/i,
    // Bubble sort
    /bubble.?sort/i,
    // Simple add/sum function
    /def\s+add\s*\(|function\s+add\s*\(/i,
    // Print hello
    /print\s*\(\s*["']hello/i,
    /console\.log\s*\(\s*["']hello/i
  ]

  // If both codes match a standard pattern — coincidental
  for (const pattern of standardPatterns) {
    if (pattern.test(codeA) && pattern.test(codeB)) {
      return true;
    }
  }
  return false;
}

// GET /api/plagiarism/:roomId
exports.checkPlagiarism = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Only owner can see plagiarism report
    if (String(room.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only room owner can view this' });
    }

    // Get session with all snapshots
    const session = await Session.findOne({ roomId: req.params.roomId });

    if (!session || session.snapshots.length === 0) {
      return res.json({
        message: 'No snapshots found. Students must complete exam first.',
        results: []
      });
    }

    // Group snapshots by studentId
    // Get LAST snapshot for each student = their final code
    const studentCodes = {};

    for (const snapshot of session.snapshots) {
      // Always overwrite — last snapshot wins = final code
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

    // Compare every pair of students
    const results = [];

    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {

        const studentA = students[i];
        const studentB = students[j];

        const codeA = studentA.code || '';
        const codeB = studentB.code || '';

        // Skip if either student has no code
        if (!codeA.trim() || !codeB.trim()) continue;

        // Calculate similarity
     const normalA = normalizeCode(codeA);
const normalB = normalizeCode(codeB);
const similarity = cosineSimilarity(normalA, normalB);
const percentage = Math.round(similarity * 100);

        // Check if this is a standard lab algorithm
        const isStandard = isStandardAlgorithm(codeA, codeB);

        // Determine verdict
        let flagged = false;
        let verdict = 'Original';
        let note = '';

        if (percentage > 85) {        // was 70 — raise flagged threshold
          if (isStandard) {
            // Standard algorithm — do not flag
            flagged = false;
            verdict = 'Coincidental';
            note = 'Standard lab program — all students write this identically';
          } else {
            // High similarity + not standard = flag
            flagged = true;
            verdict = 'Flagged';
            note = 'High structural similarity detected';
          }
        } else if (percentage > 60) {
          verdict = 'Suspicious';
          note = 'Moderate similarity — manual review recommended';
        } else {
          verdict = 'Original';
          note = 'Low similarity — looks independent';
        }

        results.push({
          studentA: studentA.studentName,
          studentB: studentB.studentName,
          similarity: percentage,
          flagged,
          verdict,
          note,
          isStandard
        });
      }
    }

    // Sort by highest similarity first
    results.sort((a, b) => b.similarity - a.similarity);

    res.json({ results });

  } catch (err) {
    console.error('Plagiarism check error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};