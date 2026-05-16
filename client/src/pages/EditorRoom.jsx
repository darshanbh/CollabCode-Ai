import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CodeEditor from '../components/CodeEditor';
import ChatPanel from '../components/ChatPanel';
import ActiveUsers from '../components/ActiveUsers';
import AIHelper from '../components/AIHelper';

const SERVER_URL = 'http://localhost:5001';

const fileExtensions = {
  javascript: 'js',
  python: 'py',
  java: 'java',
  c: 'c'
};

const defaultCode = {
  javascript: '// JavaScript\nconsole.log("Hello World");',
  python: '# Python\nprint("Hello World")',
  java: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
  c: '// C\n#include <stdio.h>\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}'
};

function EditorRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const timeoutRef = useRef(null);
  const timerRef = useRef(null);

  // existing state
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [fileName, setFileName] = useState('main');
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [conflictLine, setConflictLine] = useState(null);

  const [disableAI, setDisableAI] = useState(false);
  const [disableChat, setDisableChat] = useState(false);

  const [examMode, setExamMode] = useState(false);
  const [examLocked, setExamLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [roomType, setRoomType] = useState('student');

  // =========================
  // SOCKET SETUP
  // =========================
  useEffect(() => {
    socketRef.current = io(SERVER_URL);
    const socket = socketRef.current;

    socket.on("connect", () => console.log("✅ Connected:", socket.id));
    socket.on("disconnect", () => console.log("❌ Disconnected"));

    socket.on('language-update', (lang) => setLanguage(lang));
    socket.on('active-users', (users) => setActiveUsers(users));
    socket.on('code-update', (newCode) => setCode(newCode));
    socket.on('receive-message', (msg) => setMessages(prev => [...prev, msg]));

    socket.on('conflict-warning', ({ line }) => {
      setConflictLine(line);
      setTimeout(() => setConflictLine(null), 3000);
    });

    socket.on('save-status', ({ status }) => {
      if (status === 'saved') {
        setAutoSaveStatus('All changes saved ✅');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } else {
        setAutoSaveStatus('Save failed ❌');
      }
    });

    socket.on('edit-blocked', ({ reason }) => {
      addToast(`🚫 ${reason}`, 'error');
    });

    // ✅ Exam events from server
    socket.on('exam-started', ({ duration }) => {
      setExamMode(true);
      setExamLocked(false);
      setTimeLeft(duration);
    });

    socket.on('exam-ended', () => {
      setExamMode(false);
      setExamLocked(false);
      setTimeLeft(null);
    });

    return () => socket.disconnect();
  }, [addToast]);

  // =========================
  // JOIN ROOM + FETCH ROOM INFO
  // =========================
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('join-room', {
      roomId,
      userName: user?.name,
      userId: user?.id
    });

    // Fetch room to check exam state and ownership
    const fetchRoom = async () => {
      try {
        const { data } = await API.get(`/rooms/join/${roomId}`);
        const room = data.room;
        const isOwnerCheck = String(room.createdBy) === String(user?.id);

        // ✅ GUARD — if student lands on /editor for a teacher room, redirect to /exam
        if (room.roomType === 'teacher' && !isOwnerCheck) {
          navigate(`/exam/${roomId}`);
          return;
        }

        if (isOwnerCheck) setIsOwner(true);
        setRoomType(room.roomType || 'student');
        setDisableAI(room.disableAI || false);
        setDisableChat(room.disableChat || false);

        if (room.mode === 'exam' && !room.examEnded && room.examStartedAt) {
          const startedAt = new Date(room.examStartedAt).getTime();
          const durationMs = room.examDuration * 60 * 1000;
          const elapsed = Date.now() - startedAt;
          const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
          setExamMode(true);
          setTimeLeft(remaining);
        }
      } catch (err) {
        console.error('Failed to fetch room:', err);
        addToast('Failed to load room data', 'error');
      }
    };

    fetchRoom();
  }, [roomId, user?.name, user?.id, navigate, addToast]);

  // =========================
  // COUNTDOWN TIMER
  // =========================
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      setExamLocked(true);
      handleSaveCode();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  // =========================
  // EXAM CONTROLS
  // =========================
  const handleStartExam = async () => {
    try {
      await API.post(`/rooms/start-exam/${roomId}`);
      const { data } = await API.get(`/rooms/join/${roomId}`);
      const durationSec = data.room.examDuration * 60;
      setExamMode(true);
      setExamLocked(false);
      setTimeLeft(durationSec);
      socketRef.current.emit('exam-started', { roomId, duration: durationSec });
      addToast('Exam started successfully', 'success');
    } catch (err) {
      console.error('Failed to start exam:', err);
      addToast('Failed to start exam. Make sure you are the room owner.', 'error');
    }
  };

  const handleEndExam = async () => {
    try {
      await API.post(`/rooms/end-exam/${roomId}`);
      setExamMode(false);
      setExamLocked(false);
      setTimeLeft(null);
      socketRef.current.emit('exam-ended', { roomId });
      addToast('Exam ended', 'success');
    } catch (err) {
      console.error('Failed to end exam:', err);
    }
  };

  // =========================
  // CODE CHANGE
  // =========================
  const handleCodeChange = (newCode) => {
    if (examLocked) return; // ✅ block typing when exam over
    setCode(newCode);
    setAutoSaveStatus('Saving...');
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("code-change", { roomId, code: newCode });
      }
    }, 300);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(defaultCode[lang]);
    socketRef.current.emit('language-change', { roomId, language: lang });
  };

  const handleSendMessage = (message) => {
    socketRef.current.emit('send-message', {
      roomId, userId: user?.id, userName: user?.name, message
    });
  };

  const handleAI = async (action, description) => {
    setAiLoading(true);
    setAiResponse('');
    try {
      const { data } = await API.post('/ai/assist', {
        code, action, language, description
      });
      setAiResponse(data.result);
      setActiveTab('ai');
    } catch {
      setAiResponse('AI request failed. Check your API key.');
    }
    setAiLoading(false);
  };

  const handleSaveCode = async () => {
    try {
      await API.put(`/rooms/save-code/${roomId}`, { codeContent: code });
      setAutoSaveStatus('Saved ✅');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch {
      setAutoSaveStatus('Save failed ❌');
    }
  };

  const handleSaveAs = () => {
    const ext = fileExtensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowFileMenu(false);
  };

  const handleOpenFile = () => {
    fileInputRef.current.click();
    setShowFileMenu(false);
  };

  const handleFileRead = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = file.name.split('.')[0];
    setFileName(name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setCode(content);
      socketRef.current.emit('code-change', { roomId, code: content });
    };
    reader.readAsText(file);
  };

  const handleNewFile = () => {
    setCode(defaultCode[language]);
    setFileName('main');
    socketRef.current.emit('code-change', { roomId, code: defaultCode[language] });
    setShowFileMenu(false);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  // Format timer display
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={styles.container}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".js,.py,.java,.c,.txt"
        onChange={handleFileRead}
      />

      {/* TOP NAVIGATION BAR */}
      <header style={styles.topBar}>
        <div style={styles.leftSection}>
          <div style={styles.brandContainer}>
            <div style={styles.logo}>C</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button style={styles.menuBtn} onClick={() => setShowFileMenu(!showFileMenu)}>
              File
            </button>
            {showFileMenu && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownItem} onClick={handleNewFile}>📄 New File</div>
                <div style={styles.dropdownItem} onClick={handleOpenFile}>📂 Open File...</div>
                <div style={styles.dropdownItem} onClick={handleSaveCode}>💾 Save (Ctrl+S)</div>
                <div style={styles.dropdownItem} onClick={handleSaveAs}>📥 Save As...</div>
              </div>
            )}
          </div>
          
          <div style={styles.divider}></div>
          <span style={styles.fileName}>{fileName}.{fileExtensions[language] || 'txt'}</span>
          <span style={styles.saveStatus}>{autoSaveStatus}</span>
        </div>

        <div style={styles.centerSection}>
          {conflictLine && (
            <Badge variant="rose">⚠ Conflict: Line {conflictLine}</Badge>
          )}

          {examMode && (
            <Badge variant="amber">📝 EXAM MODE</Badge>
          )}

          {examMode && timeLeft !== null && (
            <div style={timeLeft < 60 ? styles.timerDanger : styles.timer}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}

          {examLocked && (
            <Badge variant="rose">🔒 EXAM ENDED — Editor Locked</Badge>
          )}
        </div>

        <div style={styles.rightSection}>
          <select
            style={styles.langSelect}
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>

          <Button variant="primary" onClick={handleRunCode} loading={running} style={{ padding: '6px 12px', fontSize: '13px' }}>
            ▶ Run
          </Button>

          {isOwner && roomType === 'teacher' && !examMode && (
            <Button variant="secondary" onClick={handleStartExam} style={{ padding: '6px 12px', fontSize: '13px' }}>
              🎓 Start Exam
            </Button>
          )}
          {isOwner && roomType === 'teacher' && examMode && (
            <Button variant="danger" onClick={handleEndExam} style={{ padding: '6px 12px', fontSize: '13px' }}>
              ⛔ End Exam
            </Button>
          )}
          
          {isOwner && roomType === 'teacher' && (
            <>
              <div style={styles.divider}></div>
              <button style={styles.iconBtn} onClick={() => navigate(`/plagiarism/${roomId}`)} title="Plagiarism Report">
                🔍
              </button>
              <button style={styles.iconBtn} onClick={() => navigate(`/submissions/${roomId}`)} title="Submissions">
                📋
              </button>
            </>
          )}
          
          <div style={styles.divider}></div>
          <button style={styles.leaveBtn} onClick={() => navigate('/dashboard')} title="Leave Room">
            ✕
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div style={styles.main}>
        {/* LEFT/MAIN: EDITOR */}
        <div style={styles.editorPanel}>
          <div style={styles.editorWrapper}>
            <CodeEditor
              code={code}
              language={language}
              onChange={examLocked ? () => { } : handleCodeChange}
              options={{ readOnly: examLocked }}
            />
          </div>
          
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
                    <span style={{ color: 'var(--text-primary)' }}>Terminal</span>
                    <Badge variant="indigo">{language}</Badge>
                  </div>
                  <button style={styles.closeBtn} onClick={() => setShowOutput(false)}>✕</button>
                </div>
                <pre style={styles.outputText}>{output}</pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: SIDEBAR TABS */}
        <div style={styles.rightPanel}>
          <div style={styles.tabs}>
            <button style={activeTab === 'chat' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('chat')}>
              💬 Chat
            </button>
            <button style={activeTab === 'ai' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('ai')}>
              🤖 AI
            </button>
            <button style={activeTab === 'users' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('users')}>
              👥 Users
            </button>
          </div>

          <div style={styles.tabContent}>
            {activeTab === 'chat' && (
              (examMode && !isOwner) || (disableChat && !isOwner)
                ? <div style={styles.blocked}>
                    <span style={{ fontSize: '32px', marginBottom: '8px' }}>🚫</span>
                    Chat disabled during exam
                  </div>
                : <ChatPanel messages={messages} onSend={handleSendMessage} currentUser={user?.name} />
            )}
            
            {activeTab === 'ai' && (
              (examMode && !isOwner) || (disableAI && !isOwner)
                ? <div style={styles.blocked}>
                    <span style={{ fontSize: '32px', marginBottom: '8px' }}>🚫</span>
                    AI disabled during exam
                  </div>
                : <AIHelper onAsk={handleAI} response={aiResponse} loading={aiLoading} />
            )}
            
            {activeTab === 'users' && (
              <ActiveUsers users={activeUsers} />
            )}
          </div>
        </div>
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
    height: '48px', 
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
    gap: '12px'
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
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontFamily: 'var(--font-display)',
    fontSize: '16px'
  },
  menuBtn: { 
    padding: '4px 12px', 
    backgroundColor: 'transparent', 
    color: 'var(--text-secondary)', 
    border: '1px solid transparent', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontSize: '13px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)'
    }
  },
  iconBtn: {
    padding: '6px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leaveBtn: {
    padding: '6px',
    background: 'transparent',
    border: 'none',
    color: 'var(--accent-rose)',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'var(--bg-border)',
    margin: '0 4px'
  },
  fileName: {
    fontFamily: 'var(--font-code)',
    fontSize: '13px',
    color: 'var(--text-primary)'
  },
  saveStatus: { 
    color: 'var(--text-muted)', 
    fontSize: '12px', 
    marginLeft: '8px',
    fontStyle: 'italic'
  },
  dropdown: { 
    position: 'absolute', 
    top: '100%', 
    left: 0, 
    marginTop: '4px',
    backgroundColor: 'var(--bg-surface)', 
    border: '1px solid var(--bg-border)', 
    borderRadius: 'var(--radius-md)', 
    zIndex: 100, 
    minWidth: '200px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    padding: '4px'
  },
  dropdownItem: { 
    padding: '8px 12px', 
    color: 'var(--text-primary)', 
    cursor: 'pointer', 
    fontSize: '13px', 
    borderRadius: '4px',
    transition: 'background 0.2s',
    ':hover': {
      backgroundColor: 'var(--bg-border)'
    }
  },
  langSelect: { 
    padding: '4px 8px', 
    backgroundColor: 'var(--bg-main)', 
    color: 'var(--text-primary)', 
    border: '1px solid var(--bg-border)', 
    borderRadius: 'var(--radius-sm)', 
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer'
  },
  timer: { 
    color: 'var(--accent-green)', 
    fontWeight: 'bold', 
    fontSize: '14px',
    fontFamily: 'var(--font-code)'
  },
  timerDanger: { 
    color: 'var(--accent-rose)', 
    fontWeight: 'bold', 
    fontSize: '14px',
    animation: 'pulse 1s infinite',
    fontFamily: 'var(--font-code)'
  },
  main: { 
    display: 'flex', 
    flex: 1, 
    overflow: 'hidden' 
  },
  editorPanel: { 
    flex: 1, 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative'
  },
  editorWrapper: {
    flex: 1,
    overflow: 'hidden'
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
  rightPanel: { 
    width: '320px', 
    minWidth: '320px',
    backgroundColor: 'var(--bg-surface)', 
    display: 'flex', 
    flexDirection: 'column', 
    borderLeft: '1px solid var(--bg-border)',
    zIndex: 5
  },
  tabs: { 
    display: 'flex', 
    borderBottom: '1px solid var(--bg-border)',
    height: '40px'
  },
  tab: { 
    flex: 1, 
    padding: '0 12px', 
    backgroundColor: 'transparent', 
    color: 'var(--text-secondary)', 
    border: 'none', 
    borderBottom: '2px solid transparent',
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  activeTab: { 
    flex: 1, 
    padding: '0 12px', 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    color: 'var(--text-primary)', 
    border: 'none', 
    borderBottom: '2px solid var(--accent-primary)', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '600'
  },
  tabContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  blocked: { 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%', 
    color: 'var(--text-muted)', 
    fontSize: '14px',
    padding: '32px',
    textAlign: 'center'
  }
};

export default EditorRoom;