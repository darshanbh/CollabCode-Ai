import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

function SubmissionsList() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [plagiarismResults, setPlagiarismResults] = useState([]);
  const [showPlagiarism, setShowPlagiarism] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingPlag, setCheckingPlag] = useState(false);
  const [combinedResults, setCombinedResults] = useState([]);
  const [showCombined, setShowCombined] = useState(false);
  const [checkingCombined, setCheckingCombined] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await API.get(`/submissions/${roomId}`);
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      }
      setLoading(false);
    };
    fetchSubmissions();
  }, [roomId]);

  const handlePlagiarismCheck = async () => {
    setCheckingPlag(true);
    try {
      const { data } = await API.get(`/submissions/${roomId}/plagiarism`);
      setPlagiarismResults(data.results || []);
      setShowPlagiarism(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check plagiarism');
    }
    setCheckingPlag(false);
  };

  const handleCombinedAnalysis = async () => {
    setCheckingCombined(true);
    try {
      const { data } = await API.get(`/submissions/${roomId}/combined`);
      setCombinedResults(data.results || []);
      setShowCombined(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to run analysis');
    }
    setCheckingCombined(false);
  };

  const getRiskStyle = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return { variant: 'rose', color: 'var(--accent-rose)' };
      case 'HIGH': return { variant: 'amber', color: 'var(--accent-amber)' };
      case 'MEDIUM': return { variant: 'indigo', color: 'var(--accent-indigo)' };
      default: return { variant: 'emerald', color: 'var(--accent-green)' };
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading submissions...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Submissions</h1>
            <p style={styles.subtitle}>
              Room <span style={styles.roomBadge}>{roomId}</span>
              <span style={styles.countBadge}>{submissions.length} total</span>
            </p>
          </div>
          <div style={styles.actions}>
            <Button 
              variant="outline" 
              onClick={handlePlagiarismCheck}
              loading={checkingPlag}
              disabled={submissions.length < 2}
            >
              🔍 Plagiarism Report
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCombinedAnalysis}
              loading={checkingCombined}
              disabled={submissions.length < 2}
            >
              🔬 Full AI Analysis
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate(`/keystroke/${roomId}`)}
            >
              ⌨️ Keystroke Analysis
            </Button>
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div style={styles.workspace}>
          {/* LEFT: STUDENT LIST */}
          <div style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Students</h3>
            {submissions.length === 0 ? (
              <div style={styles.emptySidebar}>
                <span style={{ fontSize: '24px', opacity: 0.5 }}>📂</span>
                <p>No submissions yet</p>
              </div>
            ) : (
              <div style={styles.studentList}>
                {submissions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.studentCard,
                      ...(selected?.studentId === s.studentId ? styles.studentCardActive : {})
                    }}
                    onClick={() => setSelected(s)}
                  >
                    <div style={styles.studentHeader}>
                      <span style={styles.studentName}>👤 {s.studentName}</span>
                    </div>
                    <div style={styles.studentMeta}>
                      <Badge variant={s.isAutoSubmitted ? 'amber' : 'emerald'}>
                        {s.isAutoSubmitted ? 'Auto-submitted' : 'Manual'}
                      </Badge>
                      <span style={styles.timeText}>
                        {new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: CODE VIEWER */}
          <div style={styles.codePanel}>
            {selected ? (
              <div style={styles.codeContainer}>
                <div style={styles.codeHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={styles.codeTitle}>{selected.studentName}'s Code</span>
                    <Badge variant="indigo">{selected.language}</Badge>
                  </div>
                  <Button variant="ghost" style={{ padding: '4px 8px' }}>
                    📋 Copy
                  </Button>
                </div>
                <div style={styles.codeScroll}>
                  <pre style={styles.codeView}>{selected.code}</pre>
                </div>
              </div>
            ) : (
              <div style={styles.emptyViewer}>
                <span style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}>👁️</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  Select a student from the list to view their submission
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLAGIARISM OVERLAY */}
      <AnimatePresence>
        {showPlagiarism && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={styles.modal}
            >
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>🔍 Basic Plagiarism Report</h2>
                <button style={styles.closeBtn} onClick={() => setShowPlagiarism(false)}>✕</button>
              </div>

              <div style={styles.modalBody}>
                {plagiarismResults.length === 0 ? (
                  <p style={styles.emptyText}>Not enough submissions to compare.</p>
                ) : (
                  <div style={styles.resultsList}>
                    {plagiarismResults.map((r, i) => (
                      <GlassCard key={i} style={{
                        ...styles.resultCard,
                        borderColor: r.flagged ? 'rgba(244, 63, 94, 0.4)' : 'var(--bg-border)'
                      }}>
                        <div style={styles.resultHeader}>
                          <span style={styles.compareNames}>
                            👤 {r.studentA} <span style={styles.vs}>vs</span> 👤 {r.studentB}
                          </span>
                          {r.flagged && <Badge variant="rose">🚨 FLAGGED</Badge>}
                        </div>
                        
                        <div style={styles.simBarContainer}>
                          <div style={styles.barBg}>
                            <div style={{
                              ...styles.barFill,
                              width: `${r.similarity}%`,
                              backgroundColor: r.similarity > 70 ? 'var(--accent-rose)' : r.similarity > 40 ? 'var(--accent-amber)' : 'var(--accent-green)'
                            }} />
                          </div>
                          <span style={{
                            ...styles.simText,
                            color: r.similarity > 70 ? 'var(--accent-rose)' : r.similarity > 40 ? 'var(--accent-amber)' : 'var(--accent-green)'
                          }}>{r.similarity}% Match</span>
                        </div>
                        
                        {r.reason && <p style={styles.reasonText}>💡 {r.reason}</p>}
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMBINED ANALYSIS OVERLAY */}
      <AnimatePresence>
        {showCombined && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={styles.modalLarge}
            >
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>🔬 Full AI Analysis Report</h2>
                <button style={styles.closeBtn} onClick={() => setShowCombined(false)}>✕</button>
              </div>

              <div style={styles.modalBody}>
                {combinedResults.length === 0 ? (
                  <p style={styles.emptyText}>Not enough submissions to compare.</p>
                ) : (
                  <div style={styles.resultsList}>
                    {combinedResults.map((r, i) => {
                      const riskStyle = getRiskStyle(r.riskLevel);
                      return (
                        <GlassCard key={i} style={{
                          ...styles.resultCardLarge,
                          borderColor: riskStyle.color,
                          boxShadow: r.riskLevel === 'CRITICAL' ? '0 0 20px rgba(244, 63, 94, 0.1)' : 'none'
                        }}>
                          <div style={styles.resultHeader}>
                            <span style={styles.compareNames}>
                              👤 {r.studentA} <span style={styles.vs}>vs</span> 👤 {r.studentB}
                            </span>
                            <Badge variant={riskStyle.variant}>{r.riskLevel} RISK</Badge>
                          </div>

                          <div style={styles.signalGrid}>
                            <div style={styles.signalBox}>
                              <span style={styles.signalLabel}>Code Similarity</span>
                              <div style={styles.simBarContainer}>
                                <div style={styles.barBg}>
                                  <div style={{
                                    ...styles.barFill,
                                    width: `${r.plagiarismScore}%`,
                                    backgroundColor: r.plagiarismScore > 70 ? 'var(--accent-rose)' : r.plagiarismScore > 40 ? 'var(--accent-amber)' : 'var(--accent-green)'
                                  }} />
                                </div>
                                <span style={{
                                  ...styles.simText,
                                  color: r.plagiarismScore > 70 ? 'var(--accent-rose)' : r.plagiarismScore > 40 ? 'var(--accent-amber)' : 'var(--accent-green)'
                                }}>{r.plagiarismScore}%</span>
                              </div>
                            </div>

                            <div style={styles.signalBox}>
                              <span style={styles.signalLabel}>Keystroke Pattern</span>
                              <div style={styles.keystrokeStatus}>
                                {r.pasteDetected ? (
                                  <span style={{ color: 'var(--accent-rose)', fontWeight: 'bold' }}>
                                    🚨 Paste detected at {r.pasteTime}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>
                                    ✅ Normal typing
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={styles.verdictBox}>
                            <span style={styles.verdictIcon}>💡</span>
                            <p style={styles.verdictText}>{r.combinedVerdict}</p>
                          </div>

                          {r.plagiarismFlagged && (
                            <div style={styles.normalizedPreview}>
                              <p style={styles.normHeader}>Structural Comparison (Normalized):</p>
                              <div style={styles.normGrid}>
                                <div style={styles.normCodeBox}>
                                  <div style={styles.normCodeHeader}>{r.studentA}</div>
                                  <pre style={styles.normCodeText}>{r.normalizedA}</pre>
                                </div>
                                <div style={styles.normCodeBox}>
                                  <div style={styles.normCodeHeader}>{r.studentB}</div>
                                  <pre style={styles.normCodeText}>{r.normalizedB}</pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '0 24px',
    marginTop: '24px'
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subtitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  countBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: 'var(--accent-indigo)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  workspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'var(--bg-main)',
    borderTop: '1px solid var(--bg-border)'
  },
  sidebar: {
    width: '320px',
    backgroundColor: 'var(--bg-surface)',
    borderRight: '1px solid var(--bg-border)',
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarTitle: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--bg-border)',
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'var(--text-primary)'
  },
  studentList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  studentCard: {
    padding: '16px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  studentCardActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid var(--accent-indigo)',
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.1)'
  },
  studentHeader: {
    marginBottom: '12px'
  },
  studentName: {
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '14px'
  },
  studentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timeText: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontFamily: 'var(--font-code)'
  },
  emptySidebar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: 'var(--text-muted)',
    fontSize: '14px',
    gap: '8px'
  },
  codePanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-main)'
  },
  emptyViewer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-main)'
  },
  codeContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--bg-border)'
  },
  codeTitle: {
    color: 'var(--text-primary)',
    fontWeight: '500',
    fontSize: '15px'
  },
  codeScroll: {
    flex: 1,
    overflow: 'auto',
    padding: '24px'
  },
  codeView: {
    fontFamily: 'var(--font-code)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.6
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
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px'
  },
  modal: {
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--bg-border)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  modalLarge: {
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--bg-border)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--bg-border)',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
  },
  modalTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
    ':hover': {
      color: 'var(--text-primary)'
    }
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  emptyText: {
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '40px 0',
    fontSize: '15px'
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  resultCard: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  resultCardLarge: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  compareNames: {
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  vs: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  simBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  barBg: {
    flex: 1,
    height: '8px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)'
  },
  simText: {
    fontFamily: 'var(--font-code)',
    fontWeight: 'bold',
    fontSize: '13px',
    minWidth: '70px',
    textAlign: 'right'
  },
  reasonText: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    margin: 0,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)'
  },
  signalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '16px',
    borderRadius: 'var(--radius-md)'
  },
  signalBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  signalLabel: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  keystrokeStatus: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '8px',
    borderRadius: 'var(--radius-sm)'
  },
  verdictBox: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    border: '1px solid var(--accent-indigo)',
    padding: '16px',
    borderRadius: 'var(--radius-md)'
  },
  verdictIcon: {
    fontSize: '20px'
  },
  verdictText: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: 1.5,
    margin: 0
  },
  normalizedPreview: {
    marginTop: '8px'
  },
  normHeader: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px'
  },
  normGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  normCodeBox: {
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden'
  },
  normCodeHeader: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--bg-border)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontFamily: 'var(--font-code)'
  },
  normCodeText: {
    padding: '12px',
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontFamily: 'var(--font-code)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '150px',
    overflowY: 'auto'
  }
};

export default SubmissionsList;