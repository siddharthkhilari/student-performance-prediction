"""
Prediction Inference and Validation Service
-------------------------------------------
Handles input validation, feature preparation, model inference using
the trained Random Forest models, and generates natural-language explanations.
"""

import os
import math
import joblib
import pandas as pd
import numpy as np

# Feature definitions and expected valid ranges
VALIDATION_RANGES = {
    "previous_marks": (0.0, 100.0, "Previous Marks must be between 0 and 100."),
    "attendance": (0.0, 100.0, "Attendance Percentage must be between 0 and 100%."),
    "study_hours": (0.0, 16.0, "Daily Study Hours must be between 0 and 16 hours."),
    "assignment_completion": (0.0, 100.0, "Assignment Completion must be between 0 and 100%."),
    "backlog_count": (0, 20, "Number of Backlogs must be an integer between 0 and 20."),
    "sleep_hours": (0.0, 24.0, "Daily Sleep Hours must be between 0 and 24 hours.")
}

FEATURE_ORDER = [
    "previous_marks",
    "attendance",
    "study_hours",
    "assignment_completion",
    "backlog_count",
    "sleep_hours",
    "extracurricular_participation"
]

_CACHED_REGRESSOR = None
_CACHED_CLASSIFIER = None

def get_models():
    """Lazily loads and caches the trained models."""
    global _CACHED_REGRESSOR, _CACHED_CLASSIFIER
    if _CACHED_REGRESSOR is None or _CACHED_CLASSIFIER is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        regressor_path = os.path.join(base_dir, "models", "marks_predictor.joblib")
        classifier_path = os.path.join(base_dir, "models", "category_classifier.joblib")
        
        if not os.path.exists(regressor_path) or not os.path.exists(classifier_path):
            # Attempt to train if not yet trained
            from train_model import train_and_evaluate
            train_and_evaluate()
            
        _CACHED_REGRESSOR = joblib.load(regressor_path)
        _CACHED_CLASSIFIER = joblib.load(classifier_path)
        
    return _CACHED_REGRESSOR, _CACHED_CLASSIFIER

def validate_student_input(data):
    """
    Validates input data strictly.
    Returns: (is_valid: bool, cleaned_data: dict, error_message: str or None)
    """
    if not isinstance(data, dict):
        return False, None, "Invalid request body: Expected JSON object."

    student_id = str(data.get("student_id", "")).strip()
    if not student_id:
        return False, None, "Student ID is required and cannot be empty."

    cleaned = {"student_id": student_id}

    for field, (min_val, max_val, err_msg) in VALIDATION_RANGES.items():
        if field not in data or data[field] is None or data[field] == "":
            return False, None, f"Field '{field}' is required."
        try:
            val = float(data[field])
            if math.isnan(val) or math.isinf(val):
                return False, None, f"Field '{field}' must be a finite real number."
            if field == "backlog_count":
                if not val.is_integer():
                    return False, None, f"Backlog count must be a whole integer."
                val = int(val)
            if val < min_val or val > max_val:
                return False, None, err_msg
            cleaned[field] = val
        except (ValueError, TypeError):
            return False, None, f"Field '{field}' must be a valid numerical value."

    # Validate extracurricular_participation
    ec_raw = data.get("extracurricular_participation", 0)
    if isinstance(ec_raw, str):
        ec_raw_lower = ec_raw.strip().lower()
        if ec_raw_lower in ["1", "true", "yes", "y"]:
            cleaned["extracurricular_participation"] = 1
        elif ec_raw_lower in ["0", "false", "no", "n"]:
            cleaned["extracurricular_participation"] = 0
        else:
            return False, None, "Extracurricular Participation must be 1 (Yes) or 0 (No)."
    elif isinstance(ec_raw, (int, float, bool)):
        cleaned["extracurricular_participation"] = 1 if bool(ec_raw) else 0
    else:
        return False, None, "Invalid extracurricular participation value."

    return True, cleaned, None

def generate_performance_explanation(cleaned_data, predicted_marks, category):
    """
    Generates educational analytics feedback describing how input factors
    contribute to the predicted performance.
    """
    positives = []
    negatives = []
    tips = []

    # Previous marks
    if cleaned_data["previous_marks"] >= 80:
        positives.append(f"Strong academic foundation from previous exams ({cleaned_data['previous_marks']}%)")
    elif cleaned_data["previous_marks"] < 50:
        negatives.append(f"Lower score in previous exams ({cleaned_data['previous_marks']}%) requires remedial focus")

    # Attendance
    if cleaned_data["attendance"] >= 85:
        positives.append(f"High classroom attendance ({cleaned_data['attendance']}%) ensures consistent learning continuity")
    elif cleaned_data["attendance"] < 75:
        negatives.append(f"Attendance ({cleaned_data['attendance']}%) is below standard 75% threshold, missing key lectures")
        tips.append("Prioritize attending daily classes to stay aligned with curriculum pacing.")

    # Study hours
    if cleaned_data["study_hours"] >= 4:
        positives.append(f"Disciplined daily self-study routine ({cleaned_data['study_hours']} hrs/day)")
    elif cleaned_data["study_hours"] < 2:
        negatives.append(f"Daily study time ({cleaned_data['study_hours']} hrs/day) is low for university workload")
        tips.append("Gradually increase self-study by at least 1-2 hours daily using focused study blocks.")

    # Assignment completion
    if cleaned_data["assignment_completion"] >= 90:
        positives.append(f"Timely submission of assignments ({cleaned_data['assignment_completion']}%) reinforces topic grasp")
    elif cleaned_data["assignment_completion"] < 70:
        negatives.append(f"Low assignment completion ({cleaned_data['assignment_completion']}%) leaves practical gaps")

    # Backlogs
    if cleaned_data["backlog_count"] == 0:
        positives.append("Clear academic record with zero backlogs")
    else:
        negatives.append(f"Active backlog count ({cleaned_data['backlog_count']}) creates academic pressure")
        tips.append("Allocate dedicated weekend revision to clear pending backlogs.")

    # Sleep hours
    if 7.0 <= cleaned_data["sleep_hours"] <= 8.5:
        positives.append(f"Optimal sleep schedule ({cleaned_data['sleep_hours']} hrs/day) supporting cognitive retention")
    elif cleaned_data["sleep_hours"] < 6.0:
        negatives.append(f"Sleep deprivation ({cleaned_data['sleep_hours']} hrs/day) may cause fatigue and reduce exam focus")
        tips.append("Ensure 7 to 8 hours of restorative sleep before study sessions.")
    elif cleaned_data["sleep_hours"] > 9.5:
        negatives.append(f"Excessive daily sleep ({cleaned_data['sleep_hours']} hrs/day) reduces productive study windows")

    # Extracurricular
    if cleaned_data["extracurricular_participation"] == 1:
        positives.append("Active extracurricular engagement reflects well-rounded personal development")

    # Assemble comprehensive explanation
    text_parts = []
    text_parts.append(f"Student {cleaned_data['student_id']} is projected to score {predicted_marks:.1f}% ({category}).")
    
    if positives:
        text_parts.append("Positive Factors: " + "; ".join(positives) + ".")
    if negatives:
        text_parts.append("Risk/Limiting Factors: " + "; ".join(negatives) + ".")
    if tips:
        text_parts.append("Recommended Actions: " + " ".join(tips))
    else:
        text_parts.append("Maintain the current disciplined study habits and consistent revision.")

    return "\n".join(text_parts)

def predict_student_performance(data):
    """
    Full prediction pipeline:
    1. Validates input
    2. Runs trained Random Forest Regressor & Classifier
    3. Produces bounded score and category
    4. Generates explanation
    """
    is_valid, cleaned, err = validate_student_input(data)
    if not is_valid:
        return False, None, err

    regressor, classifier = get_models()

    # Create 1-row DataFrame with exact feature order
    features_df = pd.DataFrame([[cleaned[col] for col in FEATURE_ORDER]], columns=FEATURE_ORDER)

    # 1. Predict continuous marks
    raw_mark = float(regressor.predict(features_df)[0])
    predicted_marks = round(float(np.clip(raw_mark, 0.0, 100.0)), 2)

    # 2. Determine category (Align classifier with rule-based thresholds)
    if predicted_marks >= 80.0:
        category = "Excellent"
    elif predicted_marks >= 70.0:
        category = "Good"
    elif predicted_marks >= 50.0:
        category = "Average"
    else:
        category = "Needs Improvement"

    # 3. Generate explanation
    explanation = generate_performance_explanation(cleaned, predicted_marks, category)

    result = {
        **cleaned,
        "predicted_marks": predicted_marks,
        "performance_category": category,
        "explanation": explanation
    }

    return True, result, None
