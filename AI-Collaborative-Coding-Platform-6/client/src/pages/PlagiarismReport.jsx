import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

function PlagiarismReport() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await API.get(`/plagiarism/${roomId}`);
        setResults(data.results || []);
        setMessage(data.message || '');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to load report');
      }
      setLoading(false);
    };
    fetchReport();
  }, [roomId]);

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'Flagged': return { variant: 'rose', icon: '🚨' };
      case 'Suspicious': return { variant: 'amber', icon: '⚠️' };
      case 'Coincidental': return { variant: 'indigo', icon: '📚' };
      default: return { variant: 'emerald', icon: '✅' };
    }
  };

  const getSimilarityColor = (similarity) => {
    if (similarity > 70) return 'var(--accent-rose)';
    if (similarity > 40) return 'var(--accent-amber)';
    return 'var(--accent-green)';
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Analysing submissions with AI...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Plagiarism Analysis</h1>
          <p style={styles.subtitle}>AI-powered code similarity detection for Room <span style={styles.roomBadge}>{roomId}</span></p>
        </div>
        <div style={styles.actions}>
          <Button variant="outline" onClick={() => navigate(`/editor/${roomId}`)}>
            ← Back to Room
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>

      <div style={styles.content}>
        {message && (
          <GlassCard style={{ marginBottom: '24px', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderColor: 'var(--accent-indigo)' }}>
            <p style={{ color: 'var(--accent-indigo)', margin: 0, fontWeight: '500' }}>{message}</p>
          </GlassCard>
        )}

        {results.length === 0 && !message && (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📂</span>
            <h3 style={styles.emptyTitle}>No Submissions Yet</h3>
            <p style={styles.emptyText}>Wait for students to submit their exams before running the analysis.</p>
          </div>
        )}

        <div style={styles.grid}>
          {results.map((r, i) => {
            const verdictStyle = getVerdictStyle(r.verdict);
            const simColor = getSimilarityColor(r.similarity);
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard style={{
                  ...styles.card,
                  borderColor: r.flagged ? 'rgba(244, 63, 94, 0.3)' : 'var(--bg-border)',
                  boxShadow: r.flagged ? '0 0 20px rgba(244, 63, 94, 0.1)' : 'none'
                }}>
                  <div style={styles.cardHeader}>
                    <div style={styles.names}>
                      <span style={styles.studentName}>👤 {r.studentA}</span>
                      <span style={styles.vs}>vs</span>
                      <span style={styles.studentName}>👤 {r.studentB}</span>
                    </div>
                    <Badge variant={verdictStyle.variant}>
                      {verdictStyle.icon} {r.verdict}
                    </Badge>
                  </div>

                  <div style={styles.similaritySection}>
                    <div style={styles.simHeader}>
                      <span style={styles.simLabel}>Similarity Score</span>
                      <span style={{ ...styles.simValue, color: simColor }}>
                        {r.similarity}%
                      </span>
                    </div>
                    <div style={styles.barBg}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${r.similarity}%` }}
                        transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                        style={{ ...styles.barFill, backgroundColor: simColor }} 
                      />
                    </div>
                  </div>

                  {r.note && (
                    <div style={styles.noteBox}>
                      <span style={styles.noteIcon}>💡</span>
                      <p style={styles.noteText}>{r.note}</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {results.length > 0 && (
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: 'var(--accent-green)' }}></span>
              <span>0–40% (Original)</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: 'var(--accent-amber)' }}></span>
              <span>41–70% (Suspicious)</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: 'var(--accent-rose)' }}></span>
              <span>71–100% (Flagged)</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '15px'
  },
  roomBadge: {
    fontFamily: 'var(--font-code)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '2px 8px',
    borderRadius: '4px',
    color: 'var(--text-primary)'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  content: {
    maxWidth: '900px',
  },
  grid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  names: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  studentName: {
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '15px'
  },
  vs: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  similaritySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  simHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  simLabel: {
    color: 'var(--text-secondary)',
    fontSize: '13px'
  },
  simValue: {
    fontFamily: 'var(--font-code)',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  barBg: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 'var(--radius-full)',
    height: '8px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)'
  },
  noteBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginTop: 'auto'
  },
  noteIcon: {
    fontSize: '16px'
  },
  noteText: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: 1.5,
    margin: 0
  },
  legend: {
    display: 'flex',
    gap: '24px',
    marginTop: '48px',
    padding: '16px 24px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 'var(--radius-lg)',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)',
    fontSize: '13px'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(99, 102, 241, 0.2)',
    borderTop: '4px solid var(--accent-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-display)'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--bg-border)'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyTitle: {
    color: 'var(--text-primary)',
    fontSize: '20px',
    fontFamily: 'var(--font-display)',
    marginBottom: '8px'
  },
  emptyText: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    maxWidth: '300px'
  }
};

export default PlagiarismReport;