import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useToast } from '../components/ui/Toast';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function Register() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      addToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.container}
    >
      <div style={styles.leftPanel} className="auth-left-panel">
        <div style={styles.orbsContainer}>
          <div style={styles.orb1} />
          <div style={styles.orb2} />
        </div>
        <div style={styles.leftContent}>
          <h1 style={styles.leftQuote}>Join the future of collaborative coding</h1>
          <GlassCard style={{ marginTop: 'var(--space-8)', maxWidth: '300px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Why Join?</h3>
            <div style={{ color: 'var(--text-secondary)' }}>
              <p>✨ AI-Powered Assistance</p>
              <p>⏱️ Real-time Sync & Chat</p>
              <p>🎓 Integrated Exam Modes</p>
            </div>
          </GlassCard>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          style={styles.formWrapper}
        >
          <div style={styles.logo}>⬡ CollabCode AI</div>
          <h2 style={styles.title}>Create Account</h2>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <Input 
              icon="👤"
              type="text" 
              name="name" 
              placeholder="Full Name" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
            <Input 
              icon="📧"
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
            <Input 
              icon="🔒"
              type="password" 
              name="password" 
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
            <Button 
              type="submit" 
              loading={loading} 
              size="lg" 
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
            >
              Sign Up
            </Button>
          </form>

          <p style={styles.footerText}>
            Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-base)',
    overflow: 'hidden'
  },
  leftPanel: {
    flex: 1,
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.05))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-12)',
    overflow: 'hidden',
    borderRight: '1px solid var(--bg-border)'
  },
  leftContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '500px'
  },
  leftQuote: {
    fontFamily: 'var(--font-display)',
    fontSize: '48px',
    lineHeight: 1.1,
    background: 'var(--gradient-hero)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: 'var(--shadow-glow-cyan)'
  },
  orbsContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    zIndex: 0
  },
  orb1: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    width: '300px',
    height: '300px',
    background: 'rgba(6, 182, 212, 0.2)',
    borderRadius: '50%',
    filter: 'blur(80px)'
  },
  orb2: {
    position: 'absolute',
    bottom: '20%',
    right: '10%',
    width: '250px',
    height: '250px',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '50%',
    filter: 'blur(60px)'
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-8)',
    backgroundColor: 'var(--bg-surface)'
  },
  formWrapper: {
    width: '100%',
    maxWidth: '400px'
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--accent-primary)',
    marginBottom: 'var(--space-8)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    fontSize: '32px',
    marginBottom: 'var(--space-8)',
    color: 'var(--text-primary)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)'
  },
  footerText: {
    marginTop: 'var(--space-6)',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    fontSize: '14px'
  },
  link: {
    color: 'var(--accent-primary)',
    fontWeight: '600'
  }
};

export default Register;