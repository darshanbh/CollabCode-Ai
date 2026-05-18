import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useToast } from '../components/ui/Toast';
import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function JoinRoom() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await API.get(`/rooms/join/${roomId.trim().toUpperCase()}`);
      const room = data.room;
      const isOwner = String(room.createdBy) === String(user?.id);

      addToast('Room joined successfully', 'success');

      if (room.roomType === 'teacher' && !isOwner) {
        navigate(`/exam/${room.roomId}`);
      } else {
        navigate(`/editor/${room.roomId}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Room not found', 'error');
    }
    setLoading(false);
  };

  return (
    <AppLayout title="Join Room">
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: '450px' }}>
          <GlassCard style={styles.card}>
            <div style={styles.header}>
              <div style={styles.iconContainer}>🚪</div>
              <h2 style={styles.title}>Join a Room</h2>
              <p style={styles.subtitle}>Enter the room ID to collaborate</p>
            </div>

            <form onSubmit={handleJoin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Room ID</label>
                <Input
                  icon="🔑"
                  type="text"
                  placeholder="e.g. A1B2C3D4"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  required
                  style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}
                />
              </div>

              <div style={styles.actions}>
                <Button type="submit" loading={loading} style={{ width: '100%' }}>
                  Enter Room →
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard')} type="button" style={{ width: '100%' }}>
                  Back to Dashboard
                </Button>
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
    alignItems: 'center',
    minHeight: '60vh'
  },
  card: {
    padding: 'var(--space-8)'
  },
  header: {
    marginBottom: 'var(--space-8)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconContainer: {
    fontSize: '48px',
    marginBottom: '16px',
    background: 'rgba(255,255,255,0.05)',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    boxShadow: '0 0 20px rgba(0,0,0,0.2)'
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
    fontWeight: '500',
    textAlign: 'center'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px'
  }
};

export default JoinRoom;