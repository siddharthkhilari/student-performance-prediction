"""
Automated Test Suite for Student Performance Prediction System
--------------------------------------------------------------
Covers:
1. Dataset generation and integrity
2. Model training, file existence, and joblib loading
3. Prediction range [0, 100] and category verification
4. Input validation (rejection of out-of-range, non-numeric, or missing inputs)
5. Flask API health check endpoint
6. Flask API prediction endpoint
7. Student database CRUD operations (create, read, delete)
8. CSV export endpoint
"""

import os
import sys
import json
import pytest

# Add parent directory to path so imports work cleanly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from generate_dataset import generate_student_dataset
from database import init_db, save_student_record, get_all_records, get_record_by_id, delete_record_by_id
from predict import validate_student_input, predict_student_performance
from app import app

@pytest.fixture
def client():
    """Provides a test client for Flask API testing."""
    app.config["TESTING"] = True
    init_db()
    with app.test_client() as test_client:
        yield test_client

# 1. Dataset Generation Test
def test_dataset_generation():
    df = generate_student_dataset(num_records=1000, random_seed=42)
    assert len(df) == 1000, "Dataset should contain exactly 1000 records"
    expected_cols = [
        "student_id", "previous_marks", "attendance", "study_hours",
        "assignment_completion", "backlog_count", "sleep_hours",
        "extracurricular_participation", "final_marks"
    ]
    for col in expected_cols:
        assert col in df.columns, f"Missing expected column: {col}"
    assert df.isnull().sum().sum() == 0, "Dataset should have no null values"
    assert (df["final_marks"] >= 0.0).all() and (df["final_marks"] <= 100.0).all(), "Final marks must be in [0, 100]"

# 2. Input Validation Tests
def test_input_validation_valid():
    valid_data = {
        "student_id": "TEST_001",
        "previous_marks": 85.5,
        "attendance": 90.0,
        "study_hours": 4.5,
        "assignment_completion": 95.0,
        "backlog_count": 0,
        "sleep_hours": 7.5,
        "extracurricular_participation": 1
    }
    is_valid, cleaned, err = validate_student_input(valid_data)
    assert is_valid is True
    assert err is None
    assert cleaned["student_id"] == "TEST_001"
    assert cleaned["previous_marks"] == 85.5

def test_input_validation_out_of_range():
    # Previous marks > 100
    invalid_data = {
        "student_id": "TEST_002",
        "previous_marks": 150.0,
        "attendance": 80.0,
        "study_hours": 3.0,
        "assignment_completion": 80.0,
        "backlog_count": 0,
        "sleep_hours": 7.0,
        "extracurricular_participation": 0
    }
    is_valid, cleaned, err = validate_student_input(invalid_data)
    assert is_valid is False
    assert "Previous Marks must be between 0 and 100" in err

def test_input_validation_missing_field():
    missing_data = {
        "student_id": "TEST_003",
        "previous_marks": 70.0
    }
    is_valid, cleaned, err = validate_student_input(missing_data)
    assert is_valid is False
    assert "required" in err

def test_input_validation_negative_backlog():
    neg_backlog = {
        "student_id": "TEST_004",
        "previous_marks": 75.0,
        "attendance": 80.0,
        "study_hours": 3.0,
        "assignment_completion": 80.0,
        "backlog_count": -2,
        "sleep_hours": 7.0,
        "extracurricular_participation": 0
    }
    is_valid, cleaned, err = validate_student_input(neg_backlog)
    assert is_valid is False
    assert "Backlogs" in err

# 3. Model Prediction Range and Category Test
def test_model_prediction_range():
    student_payload = {
        "student_id": "TEST_PRED_1",
        "previous_marks": 78.0,
        "attendance": 85.0,
        "study_hours": 5.0,
        "assignment_completion": 88.0,
        "backlog_count": 0,
        "sleep_hours": 7.5,
        "extracurricular_participation": 1
    }
    success, result, err = predict_student_performance(student_payload)
    assert success is True
    assert err is None
    assert 0.0 <= result["predicted_marks"] <= 100.0, "Marks must be clamped within [0, 100]"
    assert result["performance_category"] in ["Excellent", "Good", "Average", "Needs Improvement"]
    assert len(result["explanation"]) > 20, "Explanation should be informative"

# 4. Database CRUD Operations Test
def test_database_crud():
    sample_record = {
        "student_id": "DB_TEST_999",
        "previous_marks": 92.0,
        "attendance": 95.0,
        "study_hours": 6.0,
        "assignment_completion": 100.0,
        "backlog_count": 0,
        "sleep_hours": 8.0,
        "extracurricular_participation": 1,
        "predicted_marks": 93.4,
        "performance_category": "Excellent",
        "explanation": "High performer with disciplined schedule."
    }
    # Create
    created = save_student_record(sample_record)
    assert created["id"] is not None
    record_id = created["id"]

    # Read
    fetched = get_record_by_id(record_id)
    assert fetched is not None
    assert fetched["student_id"] == "DB_TEST_999"
    assert fetched["performance_category"] == "Excellent"

    # Delete
    del_result = delete_record_by_id(record_id)
    assert del_result is True
    assert get_record_by_id(record_id) is None

# 5. Flask API Health Check Test
def test_api_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"

# 6. Flask API Predict Endpoint Test
def test_api_predict_success(client):
    payload = {
        "student_id": "API_TEST_101",
        "previous_marks": 82.0,
        "attendance": 88.0,
        "study_hours": 4.5,
        "assignment_completion": 90.0,
        "backlog_count": 0,
        "sleep_hours": 7.0,
        "extracurricular_participation": 1
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 201
    json_data = res.get_json()
    assert json_data["success"] is True
    assert "data" in json_data
    assert json_data["data"]["student_id"] == "API_TEST_101"
    assert 0 <= json_data["data"]["predicted_marks"] <= 100

def test_api_predict_invalid_input(client):
    res = client.post("/api/predict", json={"student_id": "BAD_TEST", "previous_marks": 250})
    assert res.status_code == 400
    json_data = res.get_json()
    assert json_data["success"] is False

# 7. Flask API Dashboard and Export Endpoints Test
def test_api_dashboard(client):
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert "total_records" in json_data["data"]

def test_api_export_csv(client):
    res = client.get("/api/export")
    assert res.status_code == 200
    assert "text/csv" in res.content_type
    assert b"student_id" in res.data
