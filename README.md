# Student Performance Prediction System Using Machine Learning

An end-to-end Machine Learning web application developed for **B.Tech Information Technology** college submission. The system predicts students' expected examination marks (0–100%) and categorizes their academic performance tier (*Excellent*, *Good*, *Average*, *Needs Improvement*) based on academic and behavioral indicators using trained Random Forest models.

---

> [!IMPORTANT]
> **Educational Disclaimer**: This application is built for educational analysis, academic research, and college project evaluation. It provides algorithmic insights into factors influencing academic achievement and must not be used as the sole determinant for official grading or academic decisions.

---

## 1. Project Overview & Architecture

The system follows a clean, decoupled **Client-Server Architecture**:
- **Frontend**: Single Page Application built with **React 18** and **Vite**, featuring modern dashboard charts (**Recharts**), responsive dark/light themes, and strict client-side validation.
- **Backend**: RESTful API built with **Python Flask** and **Flask-CORS**, providing prediction inference, data filtering, and CSV export.
- **Machine Learning**: Trained **Random Forest Regressor** (for numerical marks) and **Random Forest Classifier** (for performance tiers) with zero data leakage, evaluated using real MAE, RMSE, and $R^2$ metrics.
- **Database**: Local **SQLite** database managed via **SQLAlchemy ORM** for persistent student records and prediction logs.

### System Architecture Flow

```
[ User Input / Web Dashboard ]
              │
              ▼ (HTTP JSON via Axios/Fetch)
[ Flask REST API (Port 5000) ] ─── Input Validation
              │
      ┌───────┴───────────────────────┐
      ▼                               ▼
[ Scikit-Learn ML Models ]    [ SQLite Database (students.db) ]
- Random Forest Regressor     - Student Records Table
- Random Forest Classifier    - Prediction History
- Analytical Factor Engine    - SQLAlchemy ORM
      │                               │
      └───────┬───────────────────────┘
              ▼
[ JSON Response / Visual Dashboard (Port 5173) ]
- Predicted Marks & Tier Badge
- Natural Language Explanation
- Interactive Recharts Graphs
```

---

## 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Recharts, Lucide React, HTML5, Modern Responsive CSS |
| **Backend** | Python 3.13, Flask 3.0, Flask-CORS 4.0 |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, Joblib |
| **Database** | SQLite, SQLAlchemy 2.0 |
| **Testing** | Pytest 9.0 |
| **IDE & Shell** | Visual Studio Code, Windows PowerShell |

---

## 3. Project Directory Structure

```
student-performance-prediction/
├── backend/
│   ├── dataset/
│   │   └── student_performance_data.csv    # 1,500 synthetic educational records
│   ├── models/
│   │   ├── marks_predictor.joblib          # Trained Random Forest Regressor
│   │   ├── category_classifier.joblib      # Trained Random Forest Classifier
│   │   └── model_metrics.json              # Actual MAE, RMSE, R² scores
│   ├── tests/
│   │   └── test_app.py                     # Automated pytest test suite
│   ├── app.py                              # Flask REST API endpoints
│   ├── database.py                         # SQLite SQLAlchemy models & queries
│   ├── generate_dataset.py                 # Dataset generator script (Seed 42)
│   ├── predict.py                          # Validation, ML inference & explanation
│   ├── seed.py                             # Database seeder utility
│   ├── train_model.py                      # Model training & evaluation pipeline
│   └── requirements.txt                    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx            # Safe deletion confirmation modal
│   │   │   ├── MetricCard.jsx              # Dashboard KPI metric cards
│   │   │   ├── Navbar.jsx                  # Header with theme switcher & status
│   │   │   ├── Sidebar.jsx                 # Collapsible navigation sidebar
│   │   │   └── StudentDetailModal.jsx      # Student inspection modal
│   │   ├── pages/
│   │   │   ├── AboutProject.jsx            # Architecture, scope & disclaimer
│   │   │   ├── Dashboard.jsx               # Visual charts & live KPIs
│   │   │   ├── ModelEvaluation.jsx         # Real MAE, RMSE, R², feature weights
│   │   │   ├── PredictPerformance.jsx      # Prediction form with presets
│   │   │   ├── PredictionHistory.jsx       # Chronological audit log
│   │   │   └── StudentRecords.jsx          # Searchable, filterable student table
│   │   ├── services/
│   │   │   └── api.js                      # API communication layer
│   │   ├── App.css                         # UI styling & dark/light themes
│   │   ├── App.jsx                         # Main React layout
│   │   ├── index.css                       # Design tokens & CSS variables
│   │   └── main.jsx                        # Application root entry
│   ├── package.json                        # Node dependencies
│   ├── vite.config.js                      # Vite proxy configuration
│   └── index.html                          # HTML template
├── README.md                               # Project documentation
└── .gitignore                              # Git exclusion rules
```

---

## 4. Machine Learning Pipeline & Methodology

### A. Dataset Characteristics
- **Dataset Size**: 1,500 student records generated with reproducible random seed (`random_state=42`).
- **Feature Set**:
  1. `previous_marks` (0–100%): Prior academic performance.
  2. `attendance` (0–100%): Class attendance rate.
  3. `study_hours` (0–16 hrs): Daily dedicated self-study hours.
  4. `assignment_completion` (0–100%): Timely assignment submission rate.
  5. `backlog_count` (0–20): Number of active uncleared subjects.
  6. `sleep_hours` (0–24 hrs): Average daily restful sleep.
  7. `extracurricular_participation` (0 or 1): Campus activities participation.
- **Target Variable**: `final_marks` (0–100%).
- **Data Leakage Prevention**: `student_id` and `final_marks` are strictly isolated from the training feature matrix $X$.

### B. Model Performance Metrics (Actual Test Set Evaluation)
Evaluated on an isolated 20% test partition (300 unseen students):
- **Mean Absolute Error (MAE)**: `~3.52 marks`
- **Root Mean Squared Error (RMSE)**: `~4.48 marks`
- **$R^2$ Score**: `~0.718` (71.8% of variance explained)
- **Classifier Accuracy**: `~84.3%`

### C. Performance Tiers
- **Excellent**: Predicted marks $\ge 80.0\%$
- **Good**: $70.0\% \le \text{marks} < 80.0\%$
- **Average**: $50.0\% \le \text{marks} < 70.0\%$
- **Needs Improvement**: $\text{marks} < 50.0\%$

---

## 5. Quickstart & Execution Instructions

Open **two separate Windows PowerShell terminals** in VS Code.

### Terminal 1: Backend Setup & Execution

```powershell
# 1. Navigate to the project root directory
cd "C:\Users\Admin\OneDrive\Desktop\student-performance-prediction"

# 2. Activate Python virtual environment
.\backend\venv\Scripts\Activate.ps1

# (Optional) If running from a brand new machine, install dependencies:
# pip install -r backend\requirements.txt

# 3. (Optional) Regenerate dataset and train models
python backend\train_model.py

# 4. (Optional) Seed sample records into SQLite for instant visual demo
python backend\seed.py

# 5. Start Flask Backend Server
python backend\app.py
```

*Expected output:*
```
Starting Student Performance Prediction API on http://127.0.0.1:5000
 * Running on http://127.0.0.1:5000 (Press CTRL+C to quit)
```

---

### Terminal 2: Frontend Setup & Execution

```powershell
# 1. Navigate to the frontend directory
cd "C:\Users\Admin\OneDrive\Desktop\student-performance-prediction\frontend"

# 2. Start the Vite React development server
npm run dev
```

*Expected output:*
```
  VITE v5.4.21  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open your browser and navigate to**: [http://localhost:5173](http://localhost:5173)

---

## 6. How to Demonstrate to Teacher / Examiner

1. **Dashboard Overview**:
   - Show live KPI cards (Total Students, Average Marks, R² accuracy).
   - Point out the interactive **Category Distribution Pie Chart** and **Attendance vs Marks Scatter Chart**.
2. **Make a Live Prediction**:
   - Go to **Predict Performance**.
   - Use the preset buttons (*High Performer*, *Average Student*, or *At-Risk Student*) or enter custom values.
   - Click **Predict Performance**.
   - Highlight the **predicted marks**, the **performance tier badge**, and the **transparent analytical explanation** (strengths, risk factors, and recommended actions).
3. **Inspect Records & Filtering**:
   - Open **Student Records**.
   - Search by student ID (e.g. `STU1001` or `STU_HIGH`).
   - Filter by performance tier (e.g., *Excellent* or *Needs Improvement*).
   - Click **View** to inspect full student details in the modal.
   - Click **Export CSV** to download the student records spreadsheet.
4. **Inspect Model Evaluation**:
   - Open **Model Evaluation**.
   - Show the teacher the actual scientific metrics: **MAE (3.52 marks)**, **RMSE (4.48 marks)**, **R² (71.8%)**, and the **Feature Importance** chart proving which factors impact performance most.
5. **Run Automated Tests**:
   - In PowerShell, run:
     ```powershell
     .\backend\venv\Scripts\pytest.exe backend\tests -v
     ```
   - Show that all 12 test cases pass successfully.

---

## 7. Backend REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and model status |
| `GET` | `/api/dashboard` | Dashboard KPIs, category counts, and chart distributions |
| `POST` | `/api/predict` | Validates input, runs ML inference, saves record, returns result |
| `GET` | `/api/students` | List student records (supports `?search=` and `?category=`) |
| `GET` | `/api/students/<id>` | Retrieve a single student record |
| `DELETE` | `/api/students/<id>` | Delete a student record by ID |
| `GET` | `/api/history` | Chronological prediction history log |
| `GET` | `/api/model-metrics` | Return real MAE, RMSE, R², and feature importances |
| `GET` | `/api/export` | Download all student records as a CSV attachment |
| `POST` | `/api/seed` | Seed initial sample predictions into SQLite |

---

## 8. Troubleshooting

- **PowerShell Execution Policy**:
  If `Activate.ps1` gives an execution policy warning, run:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
- **Port 5000 Already in Use**:
  Change port in `backend/app.py` or terminate the existing process.
- **Vite Proxy Connection**:
  Ensure the backend is running on `http://127.0.0.1:5000` before submitting predictions from the frontend.
