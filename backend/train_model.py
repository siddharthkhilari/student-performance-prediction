"""
Model Training Script for Student Performance Prediction
-------------------------------------------------------
Trains Machine Learning models to predict:
1. Expected Examination Marks (Random Forest Regressor)
2. Performance Category (Random Forest Classifier & Rule Alignment)

Evaluates performance using MAE, RMSE, and R-squared on an isolated test set (20%).
Saves models with joblib and evaluation metrics with JSON.
Ensures zero data leakage by excluding student_id and final_marks from features.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, classification_report
import joblib

from generate_dataset import generate_student_dataset, save_dataset

# Category classification rule function
def categorize_marks(mark):
    """Maps a continuous numerical mark to a qualitative academic category."""
    if mark >= 80.0:
        return "Excellent"
    elif mark >= 70.0:
        return "Good"
    elif mark >= 50.0:
        return "Average"
    else:
        return "Needs Improvement"

FEATURE_COLUMNS = [
    "previous_marks",
    "attendance",
    "study_hours",
    "assignment_completion",
    "backlog_count",
    "sleep_hours",
    "extracurricular_participation"
]

def train_and_evaluate(dataset_csv_path=None, models_dir=None):
    """
    Loads dataset, trains models, evaluates metrics, and persists artifacts.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if dataset_csv_path is None:
        dataset_csv_path = os.path.join(base_dir, "dataset", "student_performance_data.csv")
    if models_dir is None:
        models_dir = os.path.join(base_dir, "models")
        
    os.makedirs(models_dir, exist_ok=True)

    # If dataset doesn't exist yet, generate it
    if not os.path.exists(dataset_csv_path):
        print(f"Dataset not found at {dataset_csv_path}. Generating now...")
        save_dataset(dataset_csv_path)

    print(f"Loading dataset from: {dataset_csv_path}")
    df = pd.read_csv(dataset_csv_path)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns.")

    # Validate required columns
    missing_cols = [c for c in FEATURE_COLUMNS + ["final_marks"] if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    # Feature matrix X and Target y (Prevent Data Leakage: exclude student_id and final_marks from X)
    X = df[FEATURE_COLUMNS]
    y_reg = df["final_marks"]
    y_cat = df["final_marks"].apply(categorize_marks)

    # Train / Test split (80% train, 20% test with fixed random seed)
    X_train, X_test, y_reg_train, y_reg_test, y_cat_train, y_cat_test = train_test_split(
        X, y_reg, y_cat, test_size=0.20, random_state=42
    )
    print(f"Training set: {len(X_train)} samples | Testing set: {len(X_test)} samples.")

    # 1. Train Random Forest Regressor for Marks
    print("Training Random Forest Regressor...")
    regressor = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    regressor.fit(X_train, y_reg_train)

    # Evaluate Regressor
    y_reg_pred = regressor.predict(X_test)
    y_reg_pred_clamped = np.clip(np.round(y_reg_pred, 2), 0.0, 100.0)

    mae = float(mean_absolute_error(y_reg_test, y_reg_pred_clamped))
    mse = float(mean_squared_error(y_reg_test, y_reg_pred_clamped))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_reg_test, y_reg_pred_clamped))

    print("\n--- Regression Evaluation Metrics ---")
    print(f"Mean Absolute Error (MAE):     {mae:.3f} marks")
    print(f"Root Mean Squared Error (RMSE): {rmse:.3f} marks")
    print(f"R-squared Score (R2):           {r2:.4f}")

    # 2. Train Random Forest Classifier for Categories
    print("\nTraining Random Forest Classifier for Performance Categories...")
    classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    classifier.fit(X_train, y_cat_train)

    # Evaluate Classifier
    y_cat_pred = classifier.predict(X_test)
    cat_accuracy = float(accuracy_score(y_cat_test, y_cat_pred))
    print(f"Classifier Accuracy:           {cat_accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_cat_test, y_cat_pred))

    # Feature Importances
    feature_importances = []
    for col, imp in zip(FEATURE_COLUMNS, regressor.feature_importances_):
        feature_importances.append({
            "feature": col,
            "importance": round(float(imp), 4),
            "percentage": round(float(imp) * 100, 2)
        })
    feature_importances.sort(key=lambda x: x["importance"], reverse=True)

    # Save Models using joblib
    regressor_path = os.path.join(models_dir, "marks_predictor.joblib")
    classifier_path = os.path.join(models_dir, "category_classifier.joblib")
    joblib.dump(regressor, regressor_path)
    joblib.dump(classifier, classifier_path)
    print(f"Saved Regressor to: {regressor_path}")
    print(f"Saved Classifier to: {classifier_path}")

    # Save Metrics to JSON
    metrics_data = {
        "model_name": "Random Forest Regressor & Classifier",
        "dataset_size": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "test_split_ratio": 0.20,
        "random_state": 42,
        "metrics": {
            "mae": round(mae, 3),
            "rmse": round(rmse, 3),
            "r2_score": round(r2, 4),
            "classifier_accuracy": round(cat_accuracy * 100, 2)
        },
        "feature_importances": feature_importances,
        "hyperparameters": {
            "n_estimators": 120,
            "max_depth": 12,
            "min_samples_split": 4,
            "min_samples_leaf": 2
        },
        "target_variable": "final_marks",
        "feature_columns": FEATURE_COLUMNS
    }

    metrics_path = os.path.join(models_dir, "model_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=4)
    print(f"Saved Evaluation Metrics to: {metrics_path}")

    return {
        "regressor_path": regressor_path,
        "classifier_path": classifier_path,
        "metrics_path": metrics_path,
        "metrics": metrics_data
    }

if __name__ == "__main__":
    train_and_evaluate()
