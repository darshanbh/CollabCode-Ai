import { motion } from 'framer-motion';

export default function Spinner({ size = 20, color = 'var(--accent-primary)', className = '' }) {
  const style = {
    display: 'inline-block',
    width: size,
    height: size,
    border: `2px solid rgba(255,255,255,0.1)`,
    borderTopColor: color,
    borderRadius: '50%',
  };

  return (
    <motion.div
      style={style}
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
    />
  );
}
