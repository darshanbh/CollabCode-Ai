import Avatar from './ui/Avatar';

function ActiveUsers({ users }) {
  return (
    <div style={styles.container}>
      <h4 style={styles.title}>
        Active Users <span style={styles.countBadge}>{users.length}</span>
      </h4>
      {users.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>👻</span>
          <p style={styles.empty}>It's quiet in here</p>
        </div>
      ) : (
        <div style={styles.userList}>
          {users.map((user, i) => {
            const userName = typeof user === 'object' ? user.name : user;
            const isHost = typeof user === 'object' ? user.isHost : false;
            return (
              <div key={i} style={styles.user}>
                <Avatar name={userName} size="32px" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.name}>{userName}</span>
                  {isHost && <span style={styles.hostBadge}>Host</span>}
                </div>
                <span style={styles.dotContainer}>
                  <span style={styles.dotPulse}></span>
                  <span style={styles.dot}></span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    padding: '16px',
    backgroundColor: 'var(--bg-surface)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  title: { 
    fontFamily: 'var(--font-display)',
    color: 'var(--text-primary)', 
    marginBottom: '16px', 
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  countBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: 'var(--accent-primary)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  user: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '10px 12px', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-md)', 
    transition: 'background-color 0.2s',
    cursor: 'default'
  },
  name: { 
    color: 'var(--text-primary)', 
    fontSize: '14px',
    fontWeight: '500'
  },
  hostBadge: {
    backgroundColor: 'var(--accent-amber)',
    color: '#000',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  dotContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '12px',
    height: '12px'
  },
  dot: { 
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--accent-green)',
    borderRadius: '50%',
    position: 'relative',
    zIndex: 2
  },
  dotPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--accent-green)',
    borderRadius: '50%',
    opacity: 0.4,
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    zIndex: 1
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 0',
    opacity: 0.6
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  empty: { 
    color: 'var(--text-secondary)', 
    fontSize: '14px' 
  },
};

export default ActiveUsers;