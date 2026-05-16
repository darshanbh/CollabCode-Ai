import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

function KeystrokeAnalysis() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [studentReports, setStudentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: subData } = await API.get(`/submissions/${roomId}`);
        const submissions = subData.submissions || [];

        if (submissions.length === 0) {
          setStudentReports([]);
          setLoading(false);
          return;
        }

        const reports = await Promise.all(
          submissions.map(async (s) => {
            try {
              const { data } = await API.get(
                `/submissions/${roomId}/keystroke/${s.studentId}`
              );
              return {
                studentName: s.studentName,
                studentId: s.studentId,
                ...data
              };
            } catch {
              return {
                studentName: s.studentName,
                studentId: s.studentId,
                error: true,
                verdict: '⚠ No keystroke data available',
                pasteDetected: false,
                totalTimeMinutes: 0,
                totalCharacters: 0,
                avgCharsPerMinute: 0,
                totalSnapshots: 0,
                suspiciousEvents: [],
                events: []
              };
            }
          })
        );

        setStudentReports(reports);
      } catch (err) {
        console.error('Failed to load keystroke analysis:', err);
      }
      setLoading(false);
    };

    fetchAll();
  }, [roomId]);

  if (loading) {
    return (
      <AppLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Analysing typing patterns...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Keystroke Analysis</h1>
          <p style={styles.subtitle}>AI monitoring of typing patterns for Room <span style={styles.roomBadge}>{roomId}</span></p>
        </div>
        <div style={styles.actions}>
          <Button variant="outline" onClick={() => navigate(`/submissions/${roomId}`)}>
            ← Back to Submissions
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>

      <div style={styles.content}>
        {studentReports.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>⌨️</span>
            <h3 style={styles.emptyTitle}>No Data Available</h3>
            <p style={styles.emptyText}>Wait for students to submit their exams before reviewing keystroke analysis.</p>
          </div>
        ) : (
          <>
            <div style={styles.summaryGrid}>
              {studentReports.map((r, i) => (
                <GlassCard
                  key={i}
                  style={{
                    ...styles.summaryCard,
                    borderColor: r.pasteDetected ? 'rgba(244, 63, 94, 0.4)' : 'rgba(34, 197, 94, 0.4)',
                    boxShadow: r.pasteDetected ? '0 0 20px rgba(244, 63, 94, 0.1)' : 'none'
                  }}
                  onClick={() => setExpandedStudent(expandedStudent === i ? null : i)}
                >
                  <div style={styles.studentHeader}>
                    <div style={styles.studentInfo}>
                      <span style={styles.studentIcon}>👤</span>
                      <span style={styles.studentName}>{r.studentName}</span>
                    </div>
                    <Badge variant={r.pasteDetected ? 'rose' : 'emerald'}>
                      {r.pasteDetected ? '🚨 SUSPICIOUS' : '✅ NORMAL'}
                    </Badge>
                  </div>
                  
                  <div style={styles.miniStats}>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Time</span>
                      <span style={styles.statValue}>{r.totalTimeMinutes}m</span>
                    </div>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Chars</span>
                      <span style={styles.statValue}>{r.totalCharacters}</span>
                    </div>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Speed</span>
                      <span style={styles.statValue}>{r.avgCharsPerMinute}c/m</span>
                    </div>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Snaps</span>
                      <span style={styles.statValue}>{r.totalSnapshots}</span>
                    </div>
                  </div>
                  
                  {r.pasteDetected && r.suspiciousEvents?.length > 0 && (
                    <div style={styles.pasteAlert}>
                      <span style={{ marginBottom: '4px', display: 'block', fontWeight: 'bold' }}>Flags:</span>
                      {r.suspiciousEvents.map((e, j) => (
                        <p key={j} style={styles.pasteText}>• {e.verdict}</p>
                      ))}
                    </div>
                  )}
                  
                  <p style={styles.clickHint}>
                    {expandedStudent === i ? '▲ Hide timeline' : '▼ View timeline'}
                  </p>
                </GlassCard>
              ))}
            </div>

            <AnimatePresence>
              {expandedStudent !== null && studentReports[expandedStudent] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={styles.timelineSection}>
                    <div style={styles.timelineHeader}>
                      <h3 style={styles.sectionTitle}>
                        Timeline: {studentReports[expandedStudent].studentName}
                      </h3>
                      <Badge variant="indigo">
                        {studentReports[expandedStudent].events?.length || 0} Events
                      </Badge>
                    </div>

                    {studentReports[expandedStudent].events?.length === 0 ? (
                      <GlassCard style={styles.emptyTimeline}>
                        <p>No timeline data available for this student.</p>
                      </GlassCard>
                    ) : (
                      <div style={styles.timeline}>
                        <div style={styles.timelineRowHeader}>
                          <span style={styles.colHeader}>Time</span>
                          <span style={styles.colHeader}>Delta</span>
                          <span style={styles.colHeader}>In (sec)</span>
                          <span style={styles.colHeader}>Total</span>
                          <span style={styles.colHeader}>Status</span>
                        </div>

                        {studentReports[expandedStudent].events.map((e, i) => (
                          <div
                            key={i}
                            style={e.suspicious ? styles.timelineRowSusp : styles.timelineRowNormal}
                          >
                            <span style={styles.colTime}>{e.time}</span>
                            <span style={{
                              ...styles.colDelta,
                              color: e.charsDiff > 100 ? 'var(--accent-rose)' : e.charsDiff > 0 ? 'var(--accent-green)' : 'var(--text-muted)'
                            }}>
                              {e.charsDiff > 0 ? `+${e.charsDiff}` : e.charsDiff}
                            </span>
                            <span style={styles.col}>{e.timeDiffSeconds}s</span>
                            <span style={styles.col}>{e.totalChars}</span>
                            <span style={styles.col}>
                              {e.suspicious ? (
                                <Badge variant="rose">PASTE</Badge>
                              ) : (
                                <span style={{ color: 'var(--text-secondary)' }}>Normal</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={styles.explainer}>
              <div style={styles.explainerIcon}>ℹ️</div>
              <div style={styles.explainerContent}>
                <h3 style={styles.explainerTitle}>How This Works</h3>
                <p style={styles.explainText}>
                  Every 5 seconds during the exam, each student's code is saved with a timestamp.
                  If more than <strong style={{ color: 'var(--accent-amber)' }}>100 characters appear within 2 seconds</strong>,
                  it indicates a potential copy-paste event.
                  Normal human typing speed is 40–80 characters per minute.
                  A paste event adds hundreds of characters almost instantly.
                </p>
              </div>
            </div>
          </>
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
    maxWidth: '1000px',
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
    maxWidth: '400px'
  },
  summaryGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px', 
    marginBottom: '32px' 
  },
  summaryCard: { 
    padding: '20px', 
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  studentHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  studentIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontSize: '14px'
  },
  studentName: { 
    color: 'var(--text-primary)', 
    fontSize: '16px', 
    fontWeight: 'bold',
    fontFamily: 'var(--font-display)'
  },
  miniStats: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr',
    gap: '12px', 
  },
  statBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statLabel: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-code)',
    fontWeight: 'bold'
  },
  pasteAlert: { 
    backgroundColor: 'rgba(244, 63, 94, 0.1)', 
    borderRadius: 'var(--radius-sm)', 
    padding: '12px',
    border: '1px solid rgba(244, 63, 94, 0.2)'
  },
  pasteText: { 
    color: 'var(--accent-rose)', 
    fontSize: '13px', 
    margin: '2px 0 0 0',
    fontFamily: 'var(--font-code)'
  },
  clickHint: { 
    color: 'var(--text-muted)', 
    fontSize: '12px', 
    margin: 'auto 0 0 0',
    textAlign: 'center',
    paddingTop: '8px',
    borderTop: '1px dashed rgba(255,255,255,0.1)'
  },
  timelineSection: { 
    marginBottom: '32px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--bg-border)'
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: { 
    color: 'var(--text-primary)', 
    fontSize: '18px', 
    fontFamily: 'var(--font-display)',
    fontWeight: 'bold'
  },
  emptyTimeline: { 
    color: 'var(--text-secondary)', 
    fontSize: '14px',
    padding: '24px',
    textAlign: 'center'
  },
  timeline: { 
    backgroundColor: 'var(--bg-surface)', 
    borderRadius: 'var(--radius-md)', 
    overflow: 'hidden', 
    border: '1px solid var(--bg-border)' 
  },
  timelineRowHeader: { 
    display: 'grid', 
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', 
    padding: '12px 16px', 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    borderBottom: '1px solid var(--bg-border)' 
  },
  timelineRowNormal: { 
    display: 'grid', 
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', 
    padding: '12px 16px', 
    borderBottom: '1px solid var(--bg-border)',
    alignItems: 'center'
  },
  timelineRowSusp: { 
    display: 'grid', 
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', 
    padding: '12px 16px', 
    borderBottom: '1px solid var(--bg-border)', 
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    alignItems: 'center'
  },
  colHeader: { 
    color: 'var(--text-muted)', 
    fontSize: '12px', 
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  colTime: { 
    color: 'var(--text-primary)', 
    fontSize: '13px',
    fontFamily: 'var(--font-code)'
  },
  colDelta: {
    fontSize: '13px',
    fontFamily: 'var(--font-code)',
    fontWeight: 'bold'
  },
  col: { 
    color: 'var(--text-secondary)', 
    fontSize: '13px' 
  },
  explainer: { 
    backgroundColor: 'rgba(99, 102, 241, 0.05)', 
    borderRadius: 'var(--radius-lg)', 
    padding: '24px', 
    border: '1px solid var(--accent-indigo)',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
  },
  explainerIcon: {
    fontSize: '24px'
  },
  explainerContent: {
    flex: 1
  },
  explainerTitle: { 
    color: 'var(--accent-indigo)', 
    fontSize: '16px', 
    marginBottom: '8px',
    fontWeight: 'bold',
    fontFamily: 'var(--font-display)'
  },
  explainText: { 
    color: 'var(--text-secondary)', 
    fontSize: '14px', 
    lineHeight: '1.6', 
    margin: 0 
  },
};

export default KeystrokeAnalysis;