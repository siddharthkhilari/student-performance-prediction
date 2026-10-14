import React from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  GraduationCap,
  History,
  BarChart3,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'predict', label: 'Predict Performance', icon: BrainCircuit },
  { id: 'records', label: 'Student Records', icon: GraduationCap },
  { id: 'history', label: 'Prediction History', icon: History },
  { id: 'metrics', label: 'Model Evaluation', icon: BarChart3 },
  { id: 'about', label: 'About Project', icon: Info },
];

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon-wrapper">
          <GraduationCap size={22} />
        </div>
        {!collapsed && (
          <div className="brand-title-group">
            <h1 className="brand-title">EduPredict ML</h1>
            <span className="brand-subtitle">Student Performance AI</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!collapsed ? (
          <div>
            <div><strong>B.Tech IT Project</strong></div>
            <div style={{ marginTop: '2px', opacity: 0.8 }}>Localhost AIML Demo</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>🎓</div>
        )}
      </div>
    </aside>
  );
}
