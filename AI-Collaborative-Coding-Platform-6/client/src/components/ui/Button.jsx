import { motion } from 'framer-motion';
import Spinner from './Spinner';

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  className = '', 
  disabled = false,
  ...props 
}) {
  const getStyles = () => {
    let base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderRadius: 'var(--radius-md)',
      fontWeight: '600',
      transition: 'all 0.2s',
      fontFamily: 'var(--font-body)',
      opacity: disabled || loading ? 0.7 : 1,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
    };

    if (size === 'sm') {
      base.padding = '6px 14px';
      base.fontSize = '13px';
    } else if (size === 'lg') {
      base.padding = '14px 28px';
      base.fontSize = '16px';
    } else {
      base.padding = '10px 20px';
      base.fontSize = '14px';
    }

    if (variant === 'ghost') {
      base.background = 'transparent';
      base.border = '1px solid var(--bg-border)';
      base.color = 'var(--text-primary)';
    } else if (variant === 'danger') {
      base.background = 'var(--accent-rose)';
      base.color = '#fff';
      base.border = 'none';
      base.boxShadow = '0 4px 15px rgba(244, 63, 94, 0.3)';
    } else {
      base.background = 'var(--gradient-brand)';
      base.color = '#fff';
      base.border = 'none';
      base.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
    }

    return base;
  };

  const hoverProps = (!disabled && !loading) ? {
    whileHover: { 
      scale: 1.03,
      boxShadow: variant === 'primary' ? '0 0 20px rgba(99, 102, 241, 0.5)' : undefined
    },
    whileTap: { scale: 0.97 }
  } : {};

  return (
    <motion.button
      style={getStyles()}
      className={className}
      disabled={disabled || loading}
      {...hoverProps}
      {...props}
    >
      {loading && <Spinner size={size === 'sm' ? 14 : 18} color="white" />}
      {children}
    </motion.button>
  );
}
