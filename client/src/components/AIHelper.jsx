import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import GlassCard from './ui/GlassCard';

function AIHelper({ onAsk, response, loading }) {
  const [description, setDescription] = useState('');

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Multi-Agent AI Assistant</h4>

      <p style={styles.label}>Specialized Agents</p>
      <div style={styles.buttons}>
        <Button variant="ghost" onClick={() => onAsk('bug')} loading={loading} style={styles.agentBtn}>
          <span style={styles.icon}>🐛</span> Find Bugs
        </Button>
        <Button variant="ghost" onClick={() => onAsk('review')} loading={loading} style={styles.agentBtn}>
          <span style={styles.icon}>⭐</span> Code Review
        </Button>
        <Button variant="ghost" onClick={() => onAsk('optimize')} loading={loading} style={styles.agentBtn}>
          <span style={styles.icon}>🚀</span> Optimize
        </Button>
        <Button variant="ghost" onClick={() => onAsk('document')} loading={loading} style={styles.agentBtn}>
          <span style={styles.icon}>📖</span> Document
        </Button>
      </div>

      <Button onClick={() => onAsk('all')} loading={loading} style={{ width: '100%', marginBottom: 'var(--space-4)' }}>
        ⚡ Run All Agents
      </Button>

      <p style={styles.label}>Generate Code</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <Input
          placeholder="Describe what to build..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: 0 }}
        />
        <Button variant="outline" onClick={() => onAsk('generate', description)} loading={loading}>
          ✨ Generate
        </Button>
      </div>

      <div style={styles.responseBox}>
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>AI is thinking...</p>
          </div>
        )}
        
        {!loading && response && (
          typeof response === 'object' ? (
            Object.entries(response).map(([key, value]) => (
              <GlassCard key={key} style={styles.agentResult}>
                <div style={styles.agentHeader}>
                  {key === 'bugs' && <><span style={styles.icon}>🐛</span> Bugs Found</>}
                  {key === 'review' && <><span style={styles.icon}>⭐</span> Code Review</>}
                  {key === 'optimization' && <><span style={styles.icon}>🚀</span> Optimization</>}
                  {key === 'documentation' && <><span style={styles.icon}>📖</span> Documentation</>}
                  {key === 'generated' && <><span style={styles.icon}>✨</span> Generated Code</>}
                </div>
                <p style={styles.agentText}>{value}</p>
              </GlassCard>
            ))
          ) : (
            <GlassCard style={styles.agentResult}>
              <p style={styles.response}>{response}</p>
            </GlassCard>
          )
        )}
        
        {!loading && !response && (
          <div style={styles.placeholderBox}>
            <span style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>🤖</span>
            <p style={styles.placeholder}>Select an agent above to analyze your code.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { 
    padding: '16px', 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%', 
    overflowY: 'auto',
    backgroundColor: 'var(--bg-surface)',
  },
  title: { 
    fontFamily: 'var(--font-display)',
    color: 'var(--text-primary)', 
    marginBottom: '16px', 
    fontSize: '18px',
    fontWeight: 'bold'
  },
  label: { 
    color: 'var(--text-secondary)', 
    fontSize: '13px', 
    fontWeight: '600',
    marginBottom: '8px', 
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  buttons: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '8px', 
    marginBottom: '16px' 
  },
  agentBtn: { 
    justifyContent: 'flex-start',
    padding: '8px 12px',
    fontSize: '13px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
  },
  icon: {
    marginRight: '6px'
  },
  responseBox: { 
    flex: 1, 
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 0',
    gap: '12px'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(99, 102, 241, 0.3)',
    borderTop: '3px solid var(--accent-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: { 
    color: 'var(--text-secondary)', 
    fontSize: '14px',
    fontFamily: 'var(--font-display)'
  },
  agentResult: { 
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  agentHeader: { 
    color: 'var(--text-primary)', 
    fontSize: '14px', 
    fontWeight: 'bold', 
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  },
  agentText: { 
    color: 'var(--text-secondary)', 
    fontSize: '13px', 
    lineHeight: '1.6', 
    whiteSpace: 'pre-wrap',
    fontFamily: 'var(--font-code)'
  },
  response: { 
    color: 'var(--text-primary)', 
    fontSize: '14px', 
    lineHeight: '1.6', 
    whiteSpace: 'pre-wrap' 
  },
  placeholderBox: { 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '32px',
    textAlign: 'center',
    border: '1px dashed var(--bg-border)',
    borderRadius: 'var(--radius-md)'
  },
  placeholder: {
    color: 'var(--text-muted)',
    fontSize: '14px'
  }
};

export default AIHelper;