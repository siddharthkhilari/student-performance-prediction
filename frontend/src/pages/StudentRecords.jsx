import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
  Users,
  AlertTriangle,
  Plus
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

export default function StudentRecords({ setActivePage }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStudents(search, categoryFilter);
      setRecords(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteStudent(deleteTarget.id);
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Top Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <form onSubmit={handleSearchSubmit} className="table-search-box" style={{ maxWidth: '360px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by Student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Needs Improvement">Needs Improvement</option>
            </select>
          </div>

          <button className="btn-secondary" onClick={fetchRecords} title="Refresh records">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <a href={api.getExportUrl()} className="btn-secondary" download title="Download CSV">
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </a>

          <button className="btn-primary" onClick={() => setActivePage('predict')}>
            <Plus size={16} />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Records Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Student Records Archive</h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing {records.length} record{records.length === 1 ? '' : 's'} stored in SQLite
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '10px' }}>Loading student records...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : records.length > 0 ? (
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student ID</th>
                <th>Previous Marks</th>
                <th>Attendance</th>
                <th>Study Hrs</th>
                <th>Assignments</th>
                <th>Backlogs</th>
                <th>Predicted</th>
                <th>Performance Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((student) => (
                <tr key={student.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>#{student.id}</td>
                  <td><strong>{student.student_id}</strong></td>
                  <td>{student.previous_marks}%</td>
                  <td>{student.attendance}%</td>
                  <td>{student.study_hours} hrs/d</td>
                  <td>{student.assignment_completion}%</td>
                  <td>
                    <span style={{ color: student.backlog_count > 0 ? '#ef4444' : 'inherit', fontWeight: student.backlog_count > 0 ? 700 : 400 }}>
                      {student.backlog_count}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                      {student.predicted_marks}%
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${getCategoryBadgeClass(student.performance_category)}`}>
                      {student.performance_category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedStudent(student)}
                        title="View Full Profile"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: '6px 8px' }}
                        onClick={() => setDeleteTarget(student)}
                        title="Delete Record"
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
            <Users size={40} />
            <h4>No Records Found</h4>
            <p style={{ marginTop: '4px', fontSize: '0.88rem' }}>
              {search || categoryFilter !== 'All'
                ? 'No student records match your active search or filter criteria.'
                : 'No student records exist in the database yet.'}
            </p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActivePage('predict')}>
              Run New Prediction
            </button>
          </div>
        )}
      </div>

      {/* Student Details View Modal */}
      <StudentDetailModal
        isOpen={Boolean(selectedStudent)}
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete the prediction record for student ${deleteTarget?.student_id} (ID #${deleteTarget?.id})? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        confirmText={deleting ? 'Deleting...' : 'Delete Record'}
        isDanger={true}
      />
    </div>
  );
}
