export default function Badge({ variant = 'indigo', children, className = '' }) {
  const getColors = () => {
    switch (variant) {
      case 'violet':
        return { bg: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-secondary)', border: 'rgba(139, 92, 246, 0.3)' };
      case 'cyan':
        return { bg: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', border: 'rgba(6, 182, 212, 0.3)' };
      case 'emerald':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'amber':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'rose':
        return { bg: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', border: 'rgba(244, 63, 94, 0.3)' };
      case 'indigo':
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', border: 'rgba(99, 102, 241, 0.3)' };
    }
  };

  const colors = getColors();

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 12px',
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
}
