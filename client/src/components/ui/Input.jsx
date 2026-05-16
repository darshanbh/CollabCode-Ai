import { motion } from 'framer-motion';

export default function Input({ icon, className = '', ...props }) {
  const containerStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: 'var(--space-4)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    paddingLeft: icon ? '42px' : '16px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all 0.2s',
    fontSize: '14px',
    fontFamily: 'var(--font-body)'
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '16px',
    pointerEvents: 'none'
  };

  return (
    <div style={containerStyle} className={className}>
      {icon && <span style={iconStyle}>{icon}</span>}
      <motion.input
        style={inputStyle}
        whileFocus={{ 
          borderColor: 'var(--accent-primary)',
          boxShadow: 'var(--shadow-glow-indigo)',
          background: 'rgba(255, 255, 255, 0.06)'
        }}
        {...props}
      />
    </div>
  );
}
