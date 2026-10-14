import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Calendar,
  Clock,
  FileCheck,
  AlertOctagon,
  Moon,
  Trophy,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

const INITIAL_FORM = {
  student_id: '',
  previous_marks: '',
  attendance: '',
  study_hours: '',
  assignment_completion: '',
  backlog_count: '0',
  sleep_hours: '7.0',
  extracurricular_participation: '1'
};

const PRESETS = [
  {
    name: '🌟 High Performer',
    data: {
      student_id: 'STU_HIGH_99',
      previous_marks: '88.5',
      attendance: '95.0',
      study_hours: '5.5',
      assignment_completion: '96.0',
      backlog_count: '0',
      sleep_hours: '7.5',
      extracurricular_participation: '1'
    }
  },
  {
    name: '📘 Average Student',
    data: {
      student_id: 'STU_AVG_42',
      previous_marks: '65.0',
      attendance: '82.0',
      study_hours: '3.0',
      assignment_completion: '75.0',
      backlog_count: '1',
      sleep_hours: '6.5',
      extracurricular_participation: '0'
    }
  },
  {
    name: '⚠️ At-Risk Student',
    data: {
      student_id: 'STU_RISK_13',
      previous_marks: '42.0',
      attendance: '62.0',
      study_hours: '1.2',
      assignment_completion: '45.0',
      backlog_count: '3',
      sleep_hours: '5.0',
      extracurricular_participation: '0'
    }
  }
];

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Excellent': return 'badge-excellent';
    case 'Good': return 'badge-good';
    case 'Average': return 'badge-average';
    case 'Needs Improvement': return 'badge-needs-improvement';
    default: return 'badge-average';
  }
}

export default function PredictPerformance({ setActivePage }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.student_id.trim()) {
      errs.student_id = 'Student ID is required.';
    }

    const prevMarks = parseFloat(formData.previous_marks);
    if (isNaN(prevMarks) || prevMarks < 0 || prevMarks > 100) {
      errs.previous_marks = 'Previous Marks must be between 0 and 100.';
    }

    const att = parseFloat(formData.attendance);
    if (isNaN(att) || att < 0 || att > 100) {
      errs.attendance = 'Attendance must be between 0 and 100%.';
    }

    const study = parseFloat(formData.study_hours);
    if (isNaN(study) || study < 0 || study > 16) {
      errs.study_hours = 'Study hours must be between 0 and 16 hours.';
    }

    const assign = parseFloat(formData.assignment_completion);
    if (isNaN(assign) || assign < 0 || assign > 100) {
      errs.assignment_completion = 'Assignment completion must be between 0 and 100%.';
    }

    const backlogs = parseInt(formData.backlog_count, 10);
    if (isNaN(backlogs) || backlogs < 0 || backlogs > 20) {
      errs.backlog_count = 'Backlogs must be an integer between 0 and 20.';
    }

    const sleep = parseFloat(formData.sleep_hours);
    if (isNaN(sleep) || sleep < 0 || sleep > 24) {
      errs.sleep_hours = 'Sleep hours must be between 0 and 24 hours.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleApplyPreset = (presetData) => {
    setFormData(presetData);
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        student_id: formData.student_id.trim(),
        previous_marks: parseFloat(formData.previous_marks),
        attendance: parseFloat(formData.attendance),
        study_hours: parseFloat(formData.study_hours),
        assignment_completion: parseFloat(formData.assignment_completion),
        backlog_count: parseInt(formData.backlog_count, 10),
        sleep_hours: parseFloat(formData.sleep_hours),
        extracurricular_participation: parseInt(formData.extracurricular_participation, 10)
      };

      const res = await api.predict(payload);
      setPredictionResult(res.data);
      // scroll smoothly to result
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err) {
      setApiError(err.message || 'Failed to generate prediction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setPredictionResult(null);
    setApiError(null);
  };

  return (
    <div>
      {/* Educational Notice Banner */}
      <div className="disclaimer-banner">
        <Sparkles size={18} />
        <div>
          Enter the student's academic and behavioral indicators below. The Random Forest machine learning model will predict estimated final marks and categorize the expected performance tier.
        </div>
      </div>

      <div className="form-card">
        {/* Presets Bar */}
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            QUICK DEMO PRESETS:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => handleApplyPreset(p.data)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {apiError && (
          <div className="alert alert-error">
            <AlertOctagon size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Student ID */}
            <div className="form-group full-width">
              <label className="form-label">Student ID / Roll Number *</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                placeholder="e.g. STU1042 or 21IT045"
                className="form-input"
              />
              {errors.student_id && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.student_id}</span>}
              <span className="form-hint">Unique academic identifier for record tracking</span>
            </div>

            {/* Previous Marks */}
            <div className="form-group">
              <label className="form-label">Previous Examination Marks (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="previous_marks"
                value={formData.previous_marks}
                onChange={handleChange}
                placeholder="0 - 100"
                className="form-input"
              />
              {errors.previous_marks && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.previous_marks}</span>}
              <span className="form-hint">Score achieved in prior semester exams</span>
            </div>

            {/* Attendance */}
            <div className="form-group">
              <label className="form-label">Class Attendance (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="attendance"
                value={formData.attendance}
                onChange={handleChange}
                placeholder="0 - 100"
                className="form-input"
              />
              {errors.attendance && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.attendance}</span>}
              <span className="form-hint">Lecture and lab attendance percentage</span>
            </div>

            {/* Study Hours */}
            <div className="form-group">
              <label className="form-label">Daily Self-Study Hours (0 - 16 hrs) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="16"
                name="study_hours"
                value={formData.study_hours}
                onChange={handleChange}
                placeholder="e.g. 4.0"
                className="form-input"
              />
              {errors.study_hours && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.study_hours}</span>}
              <span className="form-hint">Independent study outside college hours</span>
            </div>

            {/* Assignment Completion */}
            <div className="form-group">
              <label className="form-label">Assignment Completion (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="assignment_completion"
                value={formData.assignment_completion}
                onChange={handleChange}
                placeholder="0 - 100"
                className="form-input"
              />
              {errors.assignment_completion && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.assignment_completion}</span>}
              <span className="form-hint">Timely coursework and lab submissions</span>
            </div>

            {/* Backlog Count */}
            <div className="form-group">
              <label className="form-label">Active Backlogs / Arrears (0 - 20) *</label>
              <input
                type="number"
                step="1"
                min="0"
                max="20"
                name="backlog_count"
                value={formData.backlog_count}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
              {errors.backlog_count && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.backlog_count}</span>}
              <span className="form-hint">Pending uncleared subjects</span>
            </div>

            {/* Sleep Hours */}
            <div className="form-group">
              <label className="form-label">Daily Sleep Hours (0 - 24 hrs) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleChange}
                placeholder="e.g. 7.5"
                className="form-input"
              />
              {errors.sleep_hours && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.sleep_hours}</span>}
              <span className="form-hint">Average restful sleep duration</span>
            </div>

            {/* Extracurricular */}
            <div className="form-group full-width">
              <label className="form-label">Extracurricular Activity Participation *</label>
              <select
                name="extracurricular_participation"
                value={formData.extracurricular_participation}
                onChange={handleChange}
                className="form-select"
              >
                <option value="1">Yes (Active in Sports, Technical Clubs, or Cultural Activities)</option>
                <option value="0">No (Not currently participating)</option>
              </select>
              <span className="form-hint">Involvement in university clubs or sports</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <BrainCircuit size={18} />
              <span>{submitting ? 'Running ML Inference...' : 'Predict Performance'}</span>
            </button>
          </div>
        </form>

        {/* Prediction Results Display Card */}
        {predictionResult && (
          <div className="result-card">
            <div className="result-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={22} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Prediction Result Generated</h3>
              </div>
              <span className="badge badge-good">Saved to SQLite Database</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED FINAL SCORE</div>
                <div className="score-display">
                  <span className="score-number">{predictionResult.predicted_marks}%</span>
                  <span className="score-label">/ 100</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>PERFORMANCE TIER</div>
                <span className={`badge ${getCategoryBadgeClass(predictionResult.performance_category)}`} style={{ fontSize: '1rem', padding: '8px 16px' }}>
                  {predictionResult.performance_category}
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              Analytical Factor Breakdown:
            </h4>
            <div className="explanation-box">
              {predictionResult.explanation}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setActivePage('records')}>
                <span>View in Student Records</span>
                <ArrowRight size={16} />
              </button>
              <button className="btn-primary" onClick={handleReset}>
                <span>Predict Another Student</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
