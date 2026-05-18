import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Hide navbar on exam room and editor room
  const hideOn = ['/exam/', '/editor/'];
  const shouldHide = hideOn.some(path => location.pathname.includes(path));
  if (shouldHide) return null;

  const handleNavClick = (id) => {
    if (location.pathname !== '/') {
      navigate(`/${id ? '#' + id : ''}`);
    } else {
      if (id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };


  return (
    <nav style={styles.navbar}>

      {/* Logo */}
      <div style={styles.logo} onClick={() => navigate('/')}>
        <span style={styles.logoIcon}>⚡</span>
        <span style={styles.logoText}>CollabCode <span style={styles.logoAI}>AI</span></span>
      </div>

      {/* Center Links */}
      <div style={styles.links}>
        <span style={styles.link} onClick={() => handleNavClick('')}>Home</span>
        <span style={styles.link} onClick={() => handleNavClick('features')}>Features</span>
        <span style={styles.link} onClick={() => handleNavClick('about')}>About</span>
        {token && (
          <span style={styles.link} onClick={() => navigate('/dashboard')}>Dashboard</span>
        )}
      </div>

      {/* Right Actions */}
      <div style={styles.actions}>
        {token ? (
          <>
            <span style={styles.userName}>👤 {user?.name || 'User'}</span>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button style={styles.loginBtn} onClick={() => navigate('/login')}>
              Login
            </button>
            <button style={styles.registerBtn} onClick={() => navigate('/register')}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 50px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: 'white',
  },
  logoAI: {
    color: '#60a5fa',
  },
  links: {
    display: 'flex',
    gap: '32px',
  },
  link: {
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'color 0.3s',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  loginBtn: {
    background: 'transparent',
    color: 'white',
    border: '1px solid rgba(148,163,184,0.3)',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  registerBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  logoutBtn: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

export default Navbar;