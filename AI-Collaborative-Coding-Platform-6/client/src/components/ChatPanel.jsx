import { useState, useEffect, useRef } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

function ChatPanel({ messages, onSend, currentUser }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.map((msg, i) => {
          const isSystem = msg.userName === 'System';
          const isMe = msg.userName === currentUser;
          
          return (
            <div key={i} style={isSystem ? styles.system : isMe ? styles.myMsg : styles.otherMsg}>
              {!isSystem && <span style={styles.name}>{msg.userName}</span>}
              <p style={styles.text}>{msg.message}</p>
              {msg.time && <span style={styles.time}>{msg.time}</span>}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={styles.inputArea}>
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ marginBottom: 0 }}
        />
        <Button onClick={handleSend} style={{ padding: '0 16px' }}>Send</Button>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    flex: 1, 
    overflow: 'hidden',
    backgroundColor: 'var(--bg-surface)',
  },
  messages: { 
    flex: 1, 
    overflowY: 'auto', 
    padding: '16px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px',
    scrollbarWidth: 'thin'
  },
  myMsg: { 
    alignSelf: 'flex-end', 
    backgroundColor: 'var(--accent-primary)', 
    padding: '10px 14px', 
    borderRadius: '16px 16px 2px 16px', 
    maxWidth: '85%',
    boxShadow: 'var(--shadow-glow-indigo)'
  },
  otherMsg: { 
    alignSelf: 'flex-start', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    border: '1px solid var(--bg-border)',
    padding: '10px 14px', 
    borderRadius: '16px 16px 16px 2px', 
    maxWidth: '85%' 
  },
  system: { 
    alignSelf: 'center', 
    color: 'var(--text-muted)', 
    fontSize: '12px', 
    fontStyle: 'italic',
    padding: '4px 12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 'var(--radius-full)'
  },
  name: { 
    fontSize: '11px', 
    color: 'var(--text-secondary)', 
    display: 'block', 
    marginBottom: '4px',
    fontWeight: '500'
  },
  text: { 
    color: 'var(--text-primary)', 
    fontSize: '14px', 
    margin: 0,
    lineHeight: 1.4
  },
  time: { 
    fontSize: '10px', 
    color: 'var(--text-muted)', 
    display: 'block', 
    textAlign: 'right', 
    marginTop: '4px' 
  },
  inputArea: { 
    display: 'flex', 
    padding: '16px', 
    gap: '8px', 
    borderTop: '1px solid var(--bg-border)',
    backgroundColor: 'var(--bg-surface)'
  }
};

export default ChatPanel;