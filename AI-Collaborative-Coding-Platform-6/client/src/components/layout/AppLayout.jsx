import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function AppLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <TopNav title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ padding: 'var(--space-6)', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
