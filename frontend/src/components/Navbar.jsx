import React from 'react';
import { Menu, Moon, Sun, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Executive Dashboard',
  predict: 'Student Performance Prediction',
  records: 'Saved Student Records',
  history: 'Prediction History Log',
  metrics: 'Machine Learning Model Evaluation',
  about: 'About Project & Architecture'
};

export default function Navbar({ activePage, collapsed, setCollapsed, theme, toggleTheme, backendOnline }) {
  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>
        <h2 className="page-title">{PAGE_TITLES[activePage] || 'Student Analytics'}</h2>
      </div>

      <div className="navbar-right">
        {/* Backend status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            padding: '5px 10px',
            borderRadius: '20px',
            backgroundColor: backendOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: backendOnline ? 'var(--cat-excellent)' : 'var(--cat-needs-imp)',
            border: `1px solid ${backendOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}
          title={backendOnline ? 'Backend API connected on http://127.0.0.1:5000' : 'Backend connection unavailable'}
        >
          {backendOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{backendOnline ? 'API Connected' : 'Offline'}</span>
        </div>

        {/* Theme toggle */}
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User / Demo Role */}
        <div className="user-badge">
          <div className="user-avatar">IT</div>
          <span>B.Tech Student</span>
        </div>
      </div>
    </header>
  );
}
