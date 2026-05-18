import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useToast } from '../components/ui/Toast';
import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

function Dashboard() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [rooms, setRooms] = useState([]);
  const [joinId, setJoinId] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    API.get('/rooms/my-rooms')
      .then(({ data }) => setRooms(data))
      .catch(() => addToast('Failed to load rooms', 'error'));
  }, [addToast]);

  const handleEnterRoom = async (roomId) => {
    try {
      const { data } = await API.get(`/rooms/join/${roomId}`);
      const room = data.room;
      const isOwner = String(room.createdBy) === String(user?.id);

      if (room.roomType === 'teacher' && !isOwner) {
        navigate(`/exam/${room.roomId}`);
      } else {
        navigate(`/editor/${room.roomId}`);
      }
    } catch (err) {
      addToast('Room not found or unauthorized', 'error');
    }
  };

  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    addToast('Room ID copied to clipboard!', 'success');
  };

  const handleDeleteRoom = async (e, roomId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    try {
      await API.delete(`/rooms/${roomId}`);
      setRooms(rooms.filter(room => room.roomId !== roomId));
      addToast('Room deleted successfully', 'success');
    } catch (err) {
      addToast('Failed to delete room', 'error');
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <AppLayout title="Dashboard">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        
        {/* SECTION A: Welcome Banner */}
        <div style={styles.welcomeBanner}>
          <h2 style={styles.welcomeTitle}>Good morning, {user.name?.split(' ')[0] || 'Developer'} 👋</h2>
          <p style={styles.welcomeSubtitle}>You have {rooms.length} active rooms. Ready to write some code?</p>
        </div>

        {/* SECTION B: Quick Action Cards */}
        <div style={styles.quickActions}>
          <GlassCard style={styles.actionCardPrimary}>
            <div style={styles.actionIcon}>✨</div>
            <div>
              <h3 style={styles.actionTitle}>Create a New Room</h3>
              <p style={styles.actionDesc}>Start a collaborative coding or exam session</p>
            </div>
            <Button onClick={() => navigate('/create-room')} style={{ alignSelf: 'flex-start' }}>Create Room →</Button>
          </GlassCard>

          <GlassCard style={styles.actionCardSecondary}>
            <div style={styles.actionIcon}>🚪</div>
            <div style={{ flex: 1 }}>
              <h3 style={styles.actionTitle}>Join a Room</h3>
              <p style={styles.actionDesc}>Enter a room ID to collaborate</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <Input 
                  placeholder="e.g. A1B2C3D4" 
                  value={joinId} 
                  onChange={(e) => setJoinId(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
                <Button variant="ghost" onClick={() => joinId && handleEnterRoom(joinId)}>Join</Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* SECTION C: Your Rooms Grid */}
        <div style={styles.sectionHeader}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px' }}>Your Rooms</h3>
          <Badge variant="indigo">{rooms.length} Rooms</Badge>
        </div>

        {rooms.length === 0 ? (
          <GlassCard style={styles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '8px' }}>No rooms yet</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create your first room to get started collaborating.</p>
            <Button onClick={() => navigate('/create-room')}>Create your first room</Button>
          </GlassCard>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" style={styles.roomGrid}>
            {rooms.map(room => (
              <motion.div key={room._id} variants={cardVariant}>
                <GlassCard hoverEffect={true} style={styles.roomCard}>
                  <div style={styles.cardHeader}>
                    <h4 style={styles.roomName}>{room.roomName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge variant={room.roomType === 'teacher' ? 'amber' : 'cyan'}>
                        {room.roomType === 'teacher' ? '🎓 Exam Room' : '👨‍💻 Dev Room'}
                      </Badge>
                      <button 
                        onClick={(e) => handleDeleteRoom(e, room.roomId)} 
                        style={styles.deleteBtn} 
                        title="Delete Room"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.roomMeta}>
                    <span style={styles.langBadge}>
                      <span style={{ color: getLangColor(room.language) }}>●</span> {room.language}
                    </span>
                    {room.roomType === 'teacher' && (
                      <span style={{ color: 'var(--accent-amber)', fontSize: '13px', fontWeight: '500' }}>
                        ⏱ {room.examDuration}m
                      </span>
                    )}
                  </div>

                  <div style={styles.idBox}>
                    <code style={{ fontFamily: 'var(--font-code)' }}>{room.roomId}</code>
                    <button onClick={(e) => copyToClipboard(e, room.roomId)} style={styles.copyBtn} title="Copy ID">
                      📋
                    </button>
                  </div>

                  <Button 
                    variant={room.roomType === 'teacher' ? 'ghost' : 'primary'} 
                    style={{ width: '100%', marginTop: 'auto' }}
                    onClick={() => handleEnterRoom(room.roomId)}
                  >
                    Enter Room →
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}

// Helpers
function getLangColor(lang) {
  const colors = { javascript: '#f7df1e', python: '#3776ab', java: '#b07219', c: '#555555', cpp: '#f34b7d' };
  return colors[lang?.toLowerCase()] || 'var(--accent-primary)';
}

// Styles
const styles = {
  welcomeBanner: {
    marginBottom: 'var(--space-8)'
  },
  welcomeTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  welcomeSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '16px'
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--space-6)',
    marginBottom: 'var(--space-12)'
  },
  actionCardPrimary: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  actionCardSecondary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  actionIcon: {
    fontSize: '32px'
  },
  actionTitle: {
    color: 'var(--text-primary)',
    fontSize: '18px',
    marginBottom: '4px'
  },
  actionDesc: {
    color: 'var(--text-secondary)',
    fontSize: '14px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: 'var(--space-6)'
  },
  roomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 'var(--space-6)'
  },
  roomCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '16px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  roomName: {
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontFamily: 'var(--font-display)',
    wordBreak: 'break-word',
    flex: 1,
    marginRight: '8px'
  },
  roomMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  langBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    background: 'rgba(255,255,255,0.05)',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'capitalize'
  },
  idBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(0,0,0,0.3)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px dashed var(--bg-border)',
    color: 'var(--text-primary)'
  },
  copyBtn: {
    fontSize: '16px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  deleteBtn: {
    fontSize: '16px',
    opacity: 0.7,
    transition: 'all 0.2s',
    background: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '4px',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      background: 'rgba(220, 38, 38, 0.2)',
      opacity: 1
    }
  },
  emptyState: {
    textAlign: 'center',
    padding: 'var(--space-12)',
    borderStyle: 'dashed'
  }
};

export default Dashboard;