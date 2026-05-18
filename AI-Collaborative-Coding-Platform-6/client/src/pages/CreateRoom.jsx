import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { useToast } from '../components/ui/Toast';
import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function CreateRoom() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [form, setForm] = useState({
    roomName: '',
    language: 'javascript',
    roomType: 'student',
    examDuration: 30,
    disableAI: true,
    disableChat: true
  });
  const [loading, setLoading] = useState(false);

  const languages = ['javascript', 'python', 'java', 'c'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        roomName: form.roomName,
        language: form.language,
        roomType: form.roomType,
        mode: form.roomType === 'teacher' ? 'exam' : 'collab',
        examDuration: form.examDuration,
        disableAI: form.roomType === 'teacher' ? form.disableAI : false,
        disableChat: form.roomType === 'teacher' ? form.disableChat : false
      };
      const { data } = await API.post('/rooms/create', payload);
      addToast('Room created successfully', 'success');
      navigate(`/editor/${data.room.roomId}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create room', 'error');
    }
    setLoading(false);
  };

  return (
    <AppLayout title="Create Room">
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '600px' }}>
          <GlassCard style={styles.card}>
            <div style={styles.header}>
              <h2 style={styles.title}>Configure New Room</h2>
              <p style={styles.subtitle}>Set up a collaborative space or a proctored exam environment</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Room Name</label>
                <Input
                  icon="📝"
                  placeholder="e.g. Final Project Session"
                  value={form.roomName}
                  onChange={(e) => setForm({ ...form, roomName: e.target.value })}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Programming Language</label>
                <div style={styles.selectWrapper}>
                  <span style={styles.selectIcon}>⚙️</span>
                  <select
                    style={styles.select}
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Room Type</label>
                <div style={styles.modeToggle}>
                  <button
                    type="button"
                    style={form.roomType === 'student' ? styles.modeActive : styles.modeBtn}
                    onClick={() => setForm({ ...form, roomType: 'student' })}
                  >
                    👨‍🎓 Student / Developer
                  </button>
                  <button
                    type="button"
                    style={form.roomType === 'teacher' ? styles.modeActiveTeacher : styles.modeBtn}
                    onClick={() => setForm({ ...form, roomType: 'teacher' })}
                  >
                    👨‍🏫 Teacher / Exam
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {form.roomType === 'teacher' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={styles.teacherOptions}>
                      <div style={styles.teacherOptionsHeader}>
                        <span style={{ fontSize: '18px' }}>🎓</span>
                        <div>
                          <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '14px' }}>Exam Settings</h4>
                          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '12px' }}>Configure student restrictions</p>
                        </div>
                      </div>

                      <div style={styles.toggleRow}>
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>🤖 Disable AI Assistance</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Prevent students from using AI agents</div>
                        </div>
                        <button
                          type="button"
                          style={form.disableAI ? styles.toggleOn : styles.toggleOff}
                          onClick={() => setForm({ ...form, disableAI: !form.disableAI })}
                        >
                          {form.disableAI ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div style={styles.toggleRow}>
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>💬 Disable Live Chat</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Prevent communication during exam</div>
                        </div>
                        <button
                          type="button"
                          style={form.disableChat ? styles.toggleOn : styles.toggleOff}
                          onClick={() => setForm({ ...form, disableChat: !form.disableChat })}
                        >
                          {form.disableChat ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div style={{ marginTop: '16px' }}>
                        <label style={{ ...styles.label, fontSize: '13px' }}>Exam Duration (minutes)</label>
                        <Input
                          icon="⏱️"
                          type="number"
                          min="5"
                          max="180"
                          value={form.examDuration}
                          onChange={(e) => setForm({ ...form, examDuration: Number(e.target.value) })}
                        />
                      </div>
                      
                      <div style={styles.examNote}>
                        <strong>Note:</strong> Exam starts when you click 'Start Exam' inside the room. Editor auto-locks when time runs out.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={styles.actions}>
                <Button variant="ghost" onClick={() => navigate('/dashboard')} type="button">Cancel</Button>
                <Button type="submit" loading={loading} style={{ flex: 1 }}>Create Room</Button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-8) 0',
  },
  card: {
    padding: 'var(--space-8)'
  },
  header: {
    marginBottom: 'var(--space-8)',
    textAlign: 'center'
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '15px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500'
  },
  selectWrapper: {
    position: 'relative',
    width: '100%'
  },
  selectIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '16px',
    pointerEvents: 'none',
    zIndex: 1
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    paddingLeft: '42px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    appearance: 'none',
    cursor: 'pointer'
  },
  modeToggle: {
    display: 'flex',
    gap: '12px'
  },
  modeBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  modeActive: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    color: 'var(--accent-cyan)',
    border: '1px solid var(--accent-cyan)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: 'var(--shadow-glow-cyan)'
  },
  modeActiveTeacher: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: 'var(--accent-amber)',
    border: '1px solid var(--accent-amber)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: 'var(--shadow-glow-amber)'
  },
  teacherOptions: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    border: '1px solid var(--bg-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  teacherOptionsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--bg-border)',
    paddingBottom: '12px'
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  },
  toggleOn: {
    padding: '6px 16px',
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    color: 'var(--accent-rose)',
    border: '1px solid var(--accent-rose)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: '60px'
  },
  toggleOff: {
    padding: '6px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-muted)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: '12px',
    minWidth: '60px'
  },
  examNote: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: 'var(--accent-amber)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    marginTop: '8px'
  },
  actions: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px'
  }
};

export default CreateRoom;