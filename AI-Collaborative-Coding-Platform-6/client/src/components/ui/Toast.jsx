import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={containerStyle}>
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast 
              key={toast.id} 
              toast={toast} 
              onClose={() => removeToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const getStyles = () => {
    switch(toast.type) {
      case 'success':
        return { borderLeft: '4px solid var(--accent-emerald)', icon: '✅' };
      case 'error':
        return { borderLeft: '4px solid var(--accent-rose)', icon: '❌' };
      case 'warning':
        return { borderLeft: '4px solid var(--accent-amber)', icon: '⚠️' };
      case 'info':
      default:
        return { borderLeft: '4px solid var(--accent-primary)', icon: 'ℹ️' };
    }
  };

  const styles = getStyles();

  const toastStyle = {
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid var(--bg-border)',
    borderLeft: styles.borderLeft,
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-card)',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    pointerEvents: 'auto',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    minWidth: '250px'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={toastStyle}
    >
      <span>{styles.icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button 
        onClick={onClose}
        style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '4px' }}
      >
        ✕
      </button>
    </motion.div>
  );
}

const containerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end'
};
