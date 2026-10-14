import React from 'react';

export default function MetricCard({ label, value, subtext, icon: Icon, color = '#4f46e5' }) {
  return (
    <div className="metric-card">
      <div className="metric-info">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
        {subtext && <span className="metric-sub">{subtext}</span>}
      </div>
      <div
        className="metric-icon-box"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          boxShadow: `0 4px 10px ${color}40`
        }}
      >
        {Icon && <Icon size={22} />}
      </div>
    </div>
  );
}
