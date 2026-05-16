import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Create Room', path: '/create-room', icon: '➕' },
    { name: 'Join Room', path: '/join-room', icon: '🚪' },
    // { name: 'My Submissions', path: '/submissions', icon: '📋' }, // requires room id usually
    // { name: 'Settings', path: '/settings', icon: '⚙️' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div style={styles.mobileBackdrop} onClick={onClose} />
      )}

      <motion.aside 
        style={{...styles.sidebar, left: isOpen ? 0 : undefined}}
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        <div style={styles.logoContainer}>
          <span style={{ fontSize: '24px' }}>⬡</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold', fontSize: '18px', color: 'var(--text-primary)' }}>
            CollabCode AI
          </span>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link to={item.path} key={item.path} onClick={onClose} style={{ textDecoration: 'none' }}>
                <div style={{...styles.navItem, ...(isActive ? styles.navItemActive : {})}}>
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span>{item.name}</span>
                  {isActive && <motion.div layoutId="activeNav" style={styles.activeIndicator} />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={styles.footer}>
          <div style={styles.userInfo}>
            <Avatar name={user?.name || 'User'} size={36} />
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user?.name || 'User'}</div>
              <div style={styles.userEmail}>{user?.email || 'user@example.com'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    backgroundColor: 'var(--bg-surface)',
    borderRight: '1px solid var(--bg-border)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    top: 0,
    zIndex: 100,
    transition: 'left 0.3s ease',
  },
  mobileBackdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 90,
  },
  logoContainer: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--accent-primary)',
    borderBottom: '1px solid var(--bg-border)'
  },
  nav: {
    flex: 1,
    padding: '24px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  navItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  navItemActive: {
    color: 'var(--text-primary)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    fontWeight: '500'
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '10%',
    bottom: '10%',
    width: '3px',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: '0 4px 4px 0'
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid var(--bg-border)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  userDetails: {
    overflow: 'hidden'
  },
  userName: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  userEmail: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  logoutBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    color: 'var(--accent-rose)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};
