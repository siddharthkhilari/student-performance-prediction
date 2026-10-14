import React, { useEffect, useState } from 'react';
import {
  History,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import StudentDetailModal from '../components/StudentDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Excellent': return 'badge-excellent';
    case 'Good': return 'badge-good';
    case 'Average': return 'badge-average';
    case 'Needs Improvement': return 'badge-needs-improvement';
    default: return 'badge-average';
  }
}

export default function PredictionHistory({ setActivePage }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory(100);
      setHistory(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteStudent(deleteTarget.id);
      setHistory((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Prediction History Audit Log</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Sequential log of all machine learning predictions run on the system
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchHistory}>
          <RefreshCw size={15} />
          <span>Refresh Log</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '10px' }}>Loading history entries...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : history.length > 0 ? (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Student ID</th>
                <th>Study & Attendance</th>
                <th>Predicted Marks</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>{record.created_at || 'Just now'}</span>
                    </div>
                  </td>
                  <td><strong>{record.student_id}</strong></td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {record.study_hours}h/d • {record.attendance}% att.
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>
                      {record.predicted_marks}%
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${getCategoryBadgeClass(record.performance_category)}`}>
                      {record.performance_category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedStudent(record)}
                        title="Inspect Prediction Details"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: '6px 8px' }}
                        onClick={() => setDeleteTarget(record)}
                        title="Delete from History"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <History size={40} />
            <h4>No Prediction History</h4>
            <p style={{ marginTop: '4px', fontSize: '0.88rem' }}>
              Your prediction sessions will automatically appear here once initiated.
            </p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActivePage('predict')}>
              Start First Prediction
            </button>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      <StudentDetailModal
        isOpen={Boolean(selectedStudent)}
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete History Entry"
        message={`Permanently remove prediction history entry for student ${deleteTarget?.student_id}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        confirmText={deleting ? 'Removing...' : 'Remove Entry'}
        isDanger={true}
      />
    </div>
  );
}
