import React from 'react';
import { X, GraduationCap, Award, BookOpen, Clock, Activity, AlertCircle, CheckCircle } from 'lucide-react';

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Excellent': return 'badge-excellent';
    case 'Good': return 'badge-good';
    case 'Average': return 'badge-average';
    case 'Needs Improvement': return 'badge-needs-improvement';
    default: return 'badge-average';
  }
}

export default function StudentDetailModal({ isOpen, student, onClose }) {
  if (!isOpen || !student) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="modal-title">{student.student_id}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Recorded on: {student.created_at || 'Recent'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Prediction Outcome Header */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PREDICTED SCORE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {student.predicted_marks}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>PERFORMANCE TIER</div>
            <span className={`badge ${getCategoryBadgeClass(student.performance_category)}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              {student.performance_category}
            </span>
          </div>
        </div>

        {/* Input Parameters Grid */}
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
          Academic Parameters
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Previous Marks</div>
            <div style={{ fontWeight: 600 }}>{student.previous_marks}%</div>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Attendance Rate</div>
            <div style={{ fontWeight: 600 }}>{student.attendance}%</div>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Daily Study Hours</div>
            <div style={{ fontWeight: 600 }}>{student.study_hours} hrs/day</div>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assignments Completed</div>
            <div style={{ fontWeight: 600 }}>{student.assignment_completion}%</div>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Backlogs</div>
            <div style={{ fontWeight: 600, color: student.backlog_count > 0 ? '#ef4444' : 'inherit' }}>
              {student.backlog_count}
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Daily Sleep</div>
            <div style={{ fontWeight: 600 }}>{student.sleep_hours} hrs/day</div>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Extracurricular Participation</div>
            <div style={{ fontWeight: 600 }}>{student.extracurricular_participation ? 'Yes (Active)' : 'No (None)'}</div>
          </div>
        </div>

        {/* Contributing Factors Explanation */}
        {student.explanation && (
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              Analytical Explanation
            </h4>
            <div className="explanation-box" style={{ marginTop: 0 }}>
              {student.explanation}
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
