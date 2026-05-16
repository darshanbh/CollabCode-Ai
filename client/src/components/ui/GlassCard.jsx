import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hoverEffect = false, ...props }) {
  const baseStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    padding: 'var(--space-6)',
    overflow: 'hidden',
    position: 'relative'
  };

  const hoverProps = hoverEffect ? {
    whileHover: { 
      y: -2, 
      borderColor: 'rgba(99, 102, 241, 0.4)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    },
    transition: { duration: 0.2, ease: 'easeOut' }
  } : {};

  return (
    <motion.div
      style={baseStyle}
      className={className}
      {...hoverProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}
