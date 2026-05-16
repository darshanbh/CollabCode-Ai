import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import CodeEditor from '../components/CodeEditor';

const defaultCode = {
  javascript: '// JavaScript\nconsole.log("Hello World");',
  python: '# Python\nprint("Hello World")',
  java: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
  c: '// C\n#include <stdio.h>\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}'
};

function ExamRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const timerRef = useRef(null);
  const hasSubmitted = useRef(false);

  const [code, setCode] = useState('// Write your solution here...');
  const [language, setLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [running, setRunning] = useState(false);
  const [roomName, setRoomName] = useState('');
  const snapshotRef = useRef(null);
  const keystrokeLog = useRef([]);
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleKeystrokeEvent = (event) => {
    keystrokeLog.current.push(event);
  };

  // Fetch room info — get language + duration
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await API.get(`/rooms/join/${roomId}`);
        const room = data.room;
        setRoomName(room.roomName);
        setLanguage(room.language || 'javascript');
        setCode(defaultCode[room.language] || defaultCode.javascript);

        // Calculate time left
        if (room.examStartedAt && !room.examEnded) {
          const startedAt = new Date(room.examStartedAt).getTime();
          const durationMs = room.examDuration * 60 * 1000;
          const elapsed = Date.now() - startedAt;
          const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
          setTimeLeft(remaining);
        }
      } catch (err) {
        console.error('Failed to fetch room:', err);
        addToast('Failed to load exam details', 'error');
      }
    };
    fetchRoom();
  }, [roomId, addToast]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      // Auto-submit when time runs out
      if (!hasSubmitted.current) {
        handleSubmit(true);
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  // Snapshot logging
  useEffect(() => {
    snapshotRef.current = setInterval(async () => {
      if (codeRef.current && user?.id && !submitted) {
        try {
          await API.post('/sessions/snapshot', {
            roomId,
            studentId: user.id,
            code: codeRef.current,
            keystrokes: keystrokeLog.current
          });
          keystrokeLog.current = [];
        } catch (err) {
          console.error('Snapshot save failed:', err);
        }
      }
    }, 5000);

    return () => clearInterval(snapshotRef.current);
  }, [roomId, user?.id, submitted]);

  const handleSubmit = async (isAuto = false) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setSubmitting(true);

    try {
      await API.post('/submissions/submit', {
        roomId,
        code,
        language,
        isAutoSubmitted: isAuto
      });
      setSubmitted(true);
      addToast(isAuto ? 'Exam auto-submitted' : 'Exam submitted successfully', 'success');
    } catch (err) {
      console.error('Submission failed:', err);
      hasSubmitted.current = false;
      addToast('Submission failed, please try again', 'error');
    }
    setSubmitting(false);
  };

  const handleRunCode = async () => {
    setRunning(true);
    setShowOutput(true);
    setOutput('⏳ Running code...');
    try {
      const { data } = await API.post('/code/run', { code, language });
      setOutput(`Status: ${data.status}\n\n${data.output}`);
    } catch {
      setOutput('❌ Code execution failed.');
    }
    setRunning(false);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Submitted screen
  if (submitted) {
    return (
      <div style={styles.submittedScreen}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard style={styles.submittedBox}>
            <div style={styles.submittedIcon}>✅</div>
            <h2 style={styles.submittedTitle}>Code Submitted</h2>
            <p style={styles.submittedText}>
              Your solution has been submitted successfully.
              The teacher will review it after the exam ends.
            </p>
            <Button onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
              Return to Dashboard
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* TOP NAVIGATION BAR */}
      <header style={styles.topBar}>
        <div style={styles.leftSection}>
          <div style={styles.brandContainer}>
            <div style={styles.logo}>E</div>
          </div>
          <span style={styles.roomLabel}>{roomName}</span>
          <Badge variant="indigo">{language}</Badge>
        </div>

        <div style={styles.centerSection}>
          {timeLeft !== null && (
            <div style={styles.timerContainer}>
              <span style={styles.timerLabel}>Time Remaining</span>
              <span style={timeLeft < 60 ? styles.timerDanger : styles.timer}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        <div style={styles.rightSection}>
          <div style={styles.studentInfo}>
            <span style={styles.studentLabel}>Candidate:</span>
            <span style={styles.studentName}>{user?.name}</span>
          </div>
          
          <div style={styles.divider}></div>
          
          <Button variant="ghost" onClick={handleRunCode} loading={running} style={{ padding: '6px 12px', fontSize: '13px' }}>
            ▶ Run
          </Button>

          <Button 
            variant="primary" 
            onClick={() => handleSubmit(false)} 
            loading={submitting} 
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* WARNING BANNER */}
      <AnimatePresence>
        {timeLeft !== null && timeLeft < 60 && timeLeft > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.urgentBanner}
          >
            ⚠ Less than 1 minute remaining! Your code will be auto-submitted.
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDITOR WORKSPACE */}
      <div style={styles.editorPanel}>
        <CodeEditor
          code={code}
          language={language}
          onChange={setCode}
          isExamMode={true}
          onKeystrokeEvent={handleKeystrokeEvent}
        />

        {/* Output Panel */}
        <AnimatePresence>
          {showOutput && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 250, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={styles.outputPanel}
            >
              <div style={styles.outputHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Terminal Output</span>
                  <Badge variant="cyan">{language}</Badge>
                </div>
                <button style={styles.closeBtn} onClick={() => setShowOutput(false)}>✕</button>
              </div>
              <pre style={styles.outputText}>{output}</pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    height: '100vh', 
    backgroundColor: 'var(--bg-main)', 
    color: 'var(--text-primary)', 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden'
  },
  topBar: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    height: '56px', 
    padding: '0 16px', 
    backgroundColor: 'var(--bg-surface)', 
    borderBottom: '1px solid var(--bg-border)', 
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  centerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    justifyContent: 'center'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '8px'
  },
  logo: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-rose))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontFamily: 'var(--font-display)',
    fontSize: '18px'
  },
  roomLabel: { 
    color: 'var(--text-primary)', 
    fontSize: '15px', 
    fontWeight: 'bold',
    fontFamily: 'var(--font-display)'
  },
  studentInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    lineHeight: 1.2
  },
  studentLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  studentName: { 
    color: 'var(--text-secondary)', 
    fontSize: '13px',
    fontWeight: '500'
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--bg-border)',
    margin: '0 8px'
  },
  timerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
    padding: '4px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--bg-border)'
  },
  timerLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: '2px'
  },
  timer: { 
    color: 'var(--text-primary)', 
    fontWeight: 'bold', 
    fontSize: '18px',
    fontFamily: 'var(--font-code)',
    letterSpacing: '1px'
  },
  timerDanger: { 
    color: 'var(--accent-rose)', 
    fontWeight: 'bold', 
    fontSize: '18px',
    fontFamily: 'var(--font-code)',
    letterSpacing: '1px',
    animation: 'pulse 1s infinite'
  },
  editorPanel: { 
    flex: 1, 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative'
  },
  outputPanel: { 
    height: '250px', 
    backgroundColor: 'var(--bg-main)', 
    borderTop: '1px solid var(--bg-border)', 
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '0 -5px 20px rgba(0,0,0,0.2)',
    zIndex: 10
  },
  outputHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '8px 16px', 
    backgroundColor: 'var(--bg-surface)', 
    fontSize: '13px',
    fontFamily: 'var(--font-display)',
    borderBottom: '1px solid var(--bg-border)'
  },
  closeBtn: { 
    background: 'none', 
    border: 'none', 
    color: 'var(--text-muted)', 
    cursor: 'pointer', 
    fontSize: '14px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  },
  outputText: { 
    color: 'var(--text-primary)', 
    padding: '16px', 
    fontSize: '14px', 
    overflow: 'auto', 
    flex: 1, 
    margin: 0, 
    fontFamily: 'var(--font-code)',
    lineHeight: 1.5
  },
  urgentBanner: { 
    backgroundColor: 'rgba(244, 63, 94, 0.1)', 
    color: 'var(--accent-rose)', 
    padding: '8px 16px', 
    textAlign: 'center', 
    fontSize: '13px', 
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(244, 63, 94, 0.2)'
  },
  submittedScreen: { 
    height: '100vh', 
    backgroundColor: 'var(--bg-main)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '16px'
  },
  submittedBox: { 
    padding: '48px', 
    textAlign: 'center', 
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  submittedIcon: { 
    fontSize: '64px', 
    marginBottom: '24px',
    background: 'rgba(34, 197, 94, 0.1)',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)'
  },
  submittedTitle: { 
    color: 'var(--accent-green)', 
    fontSize: '28px', 
    marginBottom: '16px',
    fontFamily: 'var(--font-display)',
    fontWeight: 'bold'
  },
  submittedText: { 
    color: 'var(--text-secondary)', 
    fontSize: '15px', 
    lineHeight: '1.6', 
    marginBottom: '32px' 
  }
};

export default ExamRoom;