/**
 * API Service for Student Performance Prediction System
 * Communicates with Flask Backend via Vite proxy or direct URL.
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with standardized error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = (data && typeof data === 'object' && (data.error || data.message));
      if (!errorMessage) {
        if (typeof data === 'string' && (data.includes('ECONNREFUSED') || data.includes('http proxy error'))) {
          errorMessage = 'Backend is not running. Please start the Flask backend server on http://127.0.0.1:5000.';
        } else if (response.status === 500) {
          errorMessage = 'Flask Backend is offline or returned an error. Please verify the Flask backend terminal is running on http://127.0.0.1:5000.';
        } else {
          errorMessage = `HTTP Error ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to Flask backend. Please make sure the backend server is running on http://127.0.0.1:5000.');
    }
    throw error;
  }
}

export const api = {
  // 1. Health check
  checkHealth: () => request('/health'),

  // 2. Dashboard summary statistics
  getDashboard: () => request('/dashboard'),

  // 3. Make prediction
  predict: (studentData) =>
    request('/predict', {
      method: 'POST',
      body: JSON.stringify(studentData)
    }),

  // 4. Student records list
  getStudents: (search = '', category = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/students${query}`);
  },

  // 5. Single student record
  getStudentById: (id) => request(`/students/${id}`),

  // 6. Delete student record
  deleteStudent: (id) =>
    request(`/students/${id}`, {
      method: 'DELETE'
    }),

  // 7. Prediction history
  getHistory: (limit = 50) => request(`/history?limit=${limit}`),

  // 8. Real model evaluation metrics
  getModelMetrics: () => request('/model-metrics'),

  // 9. Export URL for direct CSV download
  getExportUrl: () => `${API_BASE}/export`
};

export default api;
