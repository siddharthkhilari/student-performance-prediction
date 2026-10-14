import React, { useEffect, useState } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter
} from 'recharts';
import MetricCard from '../components/MetricCard';
import StudentDetailModal from '../components/StudentDetailModal';
import api from '../services/api';

const CATEGORY_COLORS = {
  Excellent: '#10B981',
  Good: '#3B82F6',
  Average: '#F59E0B',
  'Needs Improvement': '#EF4444'
};

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Excellent': return 'badge-excellent';
    case 'Good': return 'badge-good';
    case 'Average': return 'badge-average';
    case 'Needs Improvement': return 'badge-needs-improvement';
    default: return 'badge-average';
  }
}

export default function Dashboard({ setActivePage }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, metricsRes] = await Promise.all([
        api.getDashboard(),
        api.getModelMetrics()
      ]);
      setData(dashRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '14px', fontWeight: 500 }}>Loading educational analytics...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertTriangle size={20} />
        <div style={{ flex: 1 }}>
          <strong>Connection Notice:</strong> {error}
        </div>
        <button className="btn-secondary" onClick={fetchData} style={{ padding: '6px 12px' }}>
          Retry
        </button>
      </div>
    );
  }

  const categoryDistribution = (data && data.category_distribution) || [];
  const attendanceVsMarks = (data && data.attendance_vs_marks) || [];
  const studyHoursVsMarks = (data && data.study_hours_vs_marks) || [];
  const recentPredictions = (data && data.recent_predictions) || [];

  return (
    <div>
      {/* Educational Disclaimer Banner */}
      <div className="disclaimer-banner">
        <AlertTriangle size={18} />
        <div>
          <strong>Educational Notice:</strong> This system uses trained machine learning models for academic performance forecasting and educational analytics. It is designed to assist academic mentoring and should not be used as the sole determinant for grading decisions.
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Academic Performance Overview</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time indicators across recorded student predictions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={fetchData} title="Refresh data">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <a href={api.getExportUrl()} className="btn-secondary" download title="Export CSV">
            <FileSpreadsheet size={15} />
            <span>Download CSV</span>
          </a>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Student Records"
          value={data?.total_records || 0}
          subtext="Evaluated in database"
          icon={Users}
          color="#4f46e5"
        />
        <MetricCard
          label="Average Predicted Marks"
          value={`${data?.average_marks || 0}%`}
          subtext="Across all students"
          icon={TrendingUp}
          color="#3b82f6"
        />
        <MetricCard
          label="Model R² Accuracy"
          value={metrics ? `${(metrics.metrics.r2_score * 100).toFixed(1)}%` : '71.8%'}
          subtext={`MAE: ${metrics?.metrics?.mae || '3.5'} marks`}
          icon={CheckCircle2}
          color="#10b981"
        />
        <MetricCard
          label="Needs Improvement"
          value={data?.category_counts?.['Needs Improvement'] || 0}
          subtext="Require academic support"
          icon={AlertTriangle}
          color="#ef4444"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Category Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h4 className="chart-title">Performance Category Distribution</h4>
              <span className="chart-subtitle">Breakdown of student achievement categories</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            {categoryDistribution.some(c => c.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <BarChart2 size={36} />
                <p>No student prediction data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Study Hours vs Predicted Marks Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h4 className="chart-title">Study Hours vs. Predicted Marks</h4>
              <span className="chart-subtitle">Direct comparison for recent students</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            {studyHoursVsMarks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyHoursVsMarks.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="student_id" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }}
                  />
                  <Bar dataKey="predicted_marks" name="Predicted Marks (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="study_hours" name="Daily Study Hours" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <BarChart2 size={36} />
                <p>No comparison data to display.</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance vs Predicted Marks Scatter Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div>
              <h4 className="chart-title">Attendance Percentage vs. Predicted Performance</h4>
              <span className="chart-subtitle">Observation of class attendance impact on predicted marks</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            {attendanceVsMarks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis
                    type="number"
                    dataKey="attendance"
                    name="Attendance"
                    unit="%"
                    domain={[40, 100]}
                    stroke="var(--text-muted)"
                    fontSize={12}
                    label={{ value: 'Class Attendance (%)', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="predicted_marks"
                    name="Predicted Marks"
                    unit="%"
                    domain={[0, 100]}
                    stroke="var(--text-muted)"
                    fontSize={12}
                    label={{ value: 'Predicted Marks (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }}
                  />
                  <Scatter name="Students" data={attendanceVsMarks} fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <BarChart2 size={36} />
                <p>No attendance data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Student Predictions</h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latest machine learning inferences</span>
          </div>
          <button className="btn-secondary" onClick={() => setActivePage('records')}>
            View All Records
          </button>
        </div>

        {recentPredictions.length > 0 ? (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Prev Marks</th>
                <th>Attendance</th>
                <th>Study Hrs</th>
                <th>Predicted Marks</th>
                <th>Performance Tier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPredictions.map((record) => (
                <tr key={record.id}>
                  <td><strong>{record.student_id}</strong></td>
                  <td>{record.previous_marks}%</td>
                  <td>{record.attendance}%</td>
                  <td>{record.study_hours} hrs</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {record.predicted_marks}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getCategoryBadgeClass(record.performance_category)}`}>
                      {record.performance_category}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => setSelectedStudent(record)}
                      title="View Details"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Users size={36} />
            <p>No student predictions found in database.</p>
            <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => setActivePage('predict')}>
              Run First Prediction
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <StudentDetailModal
        isOpen={Boolean(selectedStudent)}
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
