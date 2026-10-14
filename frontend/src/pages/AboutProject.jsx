import React from 'react';
import {
  GraduationCap,
  Brain,
  Code2,
  Database,
  Layers,
  ShieldAlert,
  CheckCircle,
  FileText,
  UserCheck
} from 'lucide-react';

export default function AboutProject() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Disclaimer Alert */}
      <div className="disclaimer-banner" style={{ borderLeftColor: '#f59e0b', marginBottom: '24px' }}>
        <ShieldAlert size={20} style={{ color: '#f59e0b' }} />
        <div>
          <strong>Academic Disclaimer:</strong> This application is intended strictly for educational analysis, academic research, and engineering project evaluation. It should not be utilized as the sole or definitive basis for official grading, academic promotions, or university administrative decisions.
        </div>
      </div>

      {/* Hero Overview */}
      <div className="chart-card" style={{ marginBottom: '24px', background: 'var(--accent-gradient)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Student Performance Prediction System</h2>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              B.Tech Information Technology — Final Year / Semester AIML Project
            </span>
          </div>
        </div>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.6, opacity: 0.95 }}>
          An end-to-end Machine Learning web application designed to forecast student academic outcomes, quantify the impact of behavioral and study habits, and provide actionable pedagogical explanations for early educational intervention.
        </p>
      </div>

      {/* Project Objectives & Core Modules */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Brain size={22} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Project Objectives</h3>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
            <li>Predict expected final examination scores (0–100%) using multi-factor academic inputs.</li>
            <li>Classify students into four distinct achievement tiers: <em>Excellent</em>, <em>Good</em>, <em>Average</em>, and <em>Needs Improvement</em>.</li>
            <li>Eliminate data leakage by strictly omitting outcome variables during inference.</li>
            <li>Generate transparent natural-language feedback detailing positive drivers and risk factors.</li>
            <li>Persist student records and prediction logs locally in a lightweight SQLite database.</li>
          </ul>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Layers size={22} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Technology Stack</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
              <strong>Frontend:</strong> React 18, Vite, Recharts, Lucide Icons, Responsive CSS
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
              <strong>Backend:</strong> Python 3.13, Flask REST API, Flask-CORS
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
              <strong>Machine Learning:</strong> Scikit-Learn (Random Forest), NumPy, Pandas, Joblib
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
              <strong>Database:</strong> SQLite with SQLAlchemy ORM
            </div>
          </div>
        </div>
      </div>

      {/* Machine Learning Pipeline Details */}
      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Code2 size={22} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Machine Learning Pipeline</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>1. Dataset</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              1,500 synthetic educational records with realistic statistical correlations (previous marks, attendance, study hours, backlogs, sleep, extracurriculars).
            </p>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>2. Data Split</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              80% Training set (1,200 samples) and 20% isolated Test set (300 samples) with fixed random seed (42) for scientific reproducibility.
            </p>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>3. Modeling</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Random Forest Regressor (120 trees, max depth 12) + Random Forest Classifier serialized with Joblib.
            </p>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>4. Evaluation</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Honest validation metrics: MAE = 3.5 marks, RMSE = 4.5 marks, R² = ~71.8%, Category Accuracy = 84.3%.
            </p>
          </div>
        </div>
      </div>

      {/* College Project Submission Metadata */}
      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <UserCheck size={22} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Submission Information</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.88rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Department:</span>
            <div style={{ fontWeight: 600 }}>Information Technology (B.Tech)</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Course Subject:</span>
            <div style={{ fontWeight: 600 }}>Artificial Intelligence & Machine Learning (AIML)</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Architecture:</span>
            <div style={{ fontWeight: 600 }}>Decoupled Client-Server REST Architecture</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Execution Environment:</span>
            <div style={{ fontWeight: 600 }}>Localhost (Windows PowerShell & VS Code)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
