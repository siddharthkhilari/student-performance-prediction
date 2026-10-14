"""
Flask REST API for Student Performance Prediction System
--------------------------------------------------------
Exposes RESTful endpoints for:
- Health check
- Dashboard aggregate statistics
- Student performance prediction inference
- Student record CRUD operations
- Prediction history
- Real model evaluation metrics
- CSV data export
"""

import os
import io
import csv
import json
import sys
import traceback

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from database import (
    init_db,
    save_student_record,
    get_all_records,
    get_record_by_id,
    delete_record_by_id,
    get_prediction_history,
    get_dashboard_summary
)
from predict import predict_student_performance, get_models

app = Flask(__name__)
# Enable CORS for all routes so frontend running on Vite (localhost:5173 / localhost:3000) can interact seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database tables exist at startup
init_db()

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend operational status."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_exists = (
        os.path.exists(os.path.join(base_dir, "models", "marks_predictor.joblib")) and
        os.path.exists(os.path.join(base_dir, "models", "category_classifier.joblib"))
    )
    return jsonify({
        "status": "healthy",
        "service": "Student Performance Prediction API",
        "model_trained": model_exists,
        "database": "SQLite (students.db)"
    }), 200

@app.route("/api/dashboard", methods=["GET"])
def dashboard_stats():
    """
    Returns aggregated metrics, category distributions,
    and recent predictions for dashboard charts.
    """
    try:
        summary = get_dashboard_summary()
        return jsonify({
            "success": True,
            "data": summary
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve dashboard data: {str(e)}"
        }), 500

@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Validates student parameters, generates predicted marks and category,
    saves the prediction in the database, and returns the result.
    """
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "Missing or invalid JSON payload in request."
            }), 400

        # Run prediction through validation and ML model
        success, prediction_result, error_msg = predict_student_performance(data)
        if not success:
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400

        # Persist to SQLite
        saved_record = save_student_record(prediction_result)

        return jsonify({
            "success": True,
            "message": "Prediction generated and saved successfully.",
            "data": saved_record
        }), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Internal prediction error: {str(e)}"
        }), 500

@app.route("/api/students", methods=["GET"])
def list_students():
    """
    Retrieves all saved student records with optional search and category filters.
    """
    try:
        search = request.args.get("search", "").strip()
        category = request.args.get("category", "").strip()
        records = get_all_records(search=search, category=category)
        return jsonify({
            "success": True,
            "count": len(records),
            "data": records
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch students: {str(e)}"
        }), 500

@app.route("/api/students/<int:record_id>", methods=["GET"])
def get_student(record_id):
    """Retrieves a single student record by ID."""
    try:
        record = get_record_by_id(record_id)
        if not record:
            return jsonify({
                "success": False,
                "error": f"Student record with ID {record_id} not found."
            }), 404
        return jsonify({
            "success": True,
            "data": record
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch student: {str(e)}"
        }), 500

@app.route("/api/students/<int:record_id>", methods=["DELETE"])
def delete_student(record_id):
    """Deletes a student record by ID."""
    try:
        deleted = delete_record_by_id(record_id)
        if not deleted:
            return jsonify({
                "success": False,
                "error": f"Student record with ID {record_id} not found."
            }), 404
        return jsonify({
            "success": True,
            "message": f"Student record {record_id} deleted successfully."
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to delete student: {str(e)}"
        }), 500

@app.route("/api/history", methods=["GET"])
def prediction_history():
    """Returns recent prediction history."""
    try:
        limit = request.args.get("limit", default=50, type=int)
        history = get_prediction_history(limit=limit)
        return jsonify({
            "success": True,
            "count": len(history),
            "data": history
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch history: {str(e)}"
        }), 500

@app.route("/api/model-metrics", methods=["GET"])
def model_metrics():
    """
    Returns real model evaluation metrics, feature importances,
    and hyperparameters from model_metrics.json.
    """
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        metrics_path = os.path.join(base_dir, "models", "model_metrics.json")
        if not os.path.exists(metrics_path):
            # Attempt to train if not yet generated
            from train_model import train_and_evaluate
            train_and_evaluate()

        with open(metrics_path, "r", encoding="utf-8") as f:
            metrics_data = json.load(f)

        return jsonify({
            "success": True,
            "data": metrics_data
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to load model metrics: {str(e)}"
        }), 500

@app.route("/api/export", methods=["GET"])
def export_csv():
    """
    Exports all student records as a downloadable CSV file.
    """
    try:
        records = get_all_records()
        output = io.StringIO()
        fieldnames = [
            "id",
            "student_id",
            "previous_marks",
            "attendance",
            "study_hours",
            "assignment_completion",
            "backlog_count",
            "sleep_hours",
            "extracurricular_participation",
            "predicted_marks",
            "performance_category",
            "created_at"
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in records:
            writer.writerow(r)

        csv_content = output.getvalue()
        output.close()

        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=student_records.csv"}
        )
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Export failed: {str(e)}"
        }), 500

@app.route("/api/seed", methods=["POST"])
def seed_sample_data():
    """
    Optional helper to seed sample predictions from dataset
    so the dashboard immediately has sample data on initial demonstration.
    """
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(base_dir, "dataset", "student_performance_data.csv")
        if not os.path.exists(dataset_path):
            from generate_dataset import save_dataset
            save_dataset(dataset_path)

        import pandas as pd
        df = pd.read_csv(dataset_path).head(15)
        
        added = 0
        for _, row in df.iterrows():
            payload = {
                "student_id": row["student_id"],
                "previous_marks": float(row["previous_marks"]),
                "attendance": float(row["attendance"]),
                "study_hours": float(row["study_hours"]),
                "assignment_completion": float(row["assignment_completion"]),
                "backlog_count": int(row["backlog_count"]),
                "sleep_hours": float(row["sleep_hours"]),
                "extracurricular_participation": int(row["extracurricular_participation"])
            }
            ok, res, _ = predict_student_performance(payload)
            if ok:
                save_student_record(res)
                added += 1

        return jsonify({
            "success": True,
            "message": f"Successfully seeded {added} sample student predictions."
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Seeding failed: {str(e)}"
        }), 500

if __name__ == "__main__":
    # Pre-load / train models at startup
    try:
        get_models()
    except Exception as err:
        print(f"Notice: Model will be initialized on first prediction or train script: {err}")
        
    print("Starting Student Performance Prediction API on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
