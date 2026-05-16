import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

export default function TopNav({ title, onMenuClick }) {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button className="mobile-menu-btn" onClick={onMenuClick} style={styles.menuBtn}>
          ☰
        </button>
        <h1 style={styles.title}>{title}</h1>
      </div>

      <div style={styles.right}>
        <div style={styles.notification}>
          <span>🔔</span>
          <span style={styles.badge}>3</span>
        </div>
        <div style={styles.profile}>
          <span style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'User'}</span>
          <Avatar name={user?.name || 'User'} size={36} />
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: '72px',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5, 8, 20, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--bg-border)',
    position: 'sticky',
    top: 0,
    zIndex: 80
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  menuBtn: {
    fontSize: '24px',
    color: 'var(--text-primary)',
    display: 'none', // handled by media query in index.css
  },
  title: {
    fontSize: '20px',
    fontFamily: 'var(--font-display)',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    margin: 0
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  notification: {
    position: 'relative',
    fontSize: '20px',
    cursor: 'pointer'
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'var(--accent-rose)',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  greeting: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500'
  }
};
