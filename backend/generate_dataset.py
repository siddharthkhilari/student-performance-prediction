"""
Dataset Generation Script for Student Performance Prediction System
-------------------------------------------------------------------
This script generates a realistic synthetic educational dataset of student records.
Dataset Type: SYNTHETIC (clearly labeled for academic/educational demonstration)
Random Seed: 42 (ensures exact reproducibility)
Number of Records: 1,500 students

Features generated:
- student_id: Unique identifier (e.g., STU1001)
- previous_marks: Score in previous exams (0-100)
- attendance: Attendance percentage (0-100%)
- study_hours: Daily self-study hours (0-16 hours)
- assignment_completion: Percentage of assignments submitted (0-100%)
- backlog_count: Number of active backlogs/arrears (0-20)
- sleep_hours: Average daily sleep hours (0-24 hours)
- extracurricular_participation: Binary participation flag (0 = No, 1 = Yes)
- final_marks: Target outcome variable representing final examination score (0-100)

Domain Logic:
Final marks are computed using a realistic multi-factor academic formula:
  Base = 0.38 * previous_marks
       + 0.20 * attendance
       + 1.80 * study_hours
       + 0.12 * assignment_completion
       - 2.80 * backlog_count
       + 2.00 * extracurricular_participation
       + sleep_adjustment (optimal around 7-8 hours)
       + Gaussian noise (std dev = 3.2)
Clamped strictly to [0.0, 100.0].
"""

import os
import numpy as np
import pandas as pd

def generate_student_dataset(num_records=1500, random_seed=42):
    """
    Generate synthetic student performance dataset.
    
    Parameters:
        num_records (int): Total number of student records to generate (>= 1000).
        random_seed (int): Reproducible random seed.
        
    Returns:
        pd.DataFrame: Generated dataset.
    """
    np.random.seed(random_seed)
    
    # 1. Student IDs
    student_ids = [f"STU{1000 + i}" for i in range(1, num_records + 1)]
    
    # 2. Previous Marks: Bell-shaped distribution centered around 68 with std 14
    previous_marks = np.random.normal(loc=68, scale=14, size=num_records)
    previous_marks = np.clip(np.round(previous_marks, 1), 25.0, 100.0)
    
    # 3. Attendance Percentage: Skewed towards 75-95%
    attendance = np.random.beta(a=7, b=2, size=num_records) * 60 + 40
    attendance = np.clip(np.round(attendance, 1), 35.0, 100.0)
    
    # 4. Daily Study Hours: Mostly 1.5 to 7 hours, max 12
    study_hours = np.random.gamma(shape=3.0, scale=1.2, size=num_records)
    study_hours = np.clip(np.round(study_hours, 1), 0.5, 12.0)
    
    # 5. Assignment Completion Percentage: Correlated with attendance and previous marks
    assignment_completion = 0.5 * attendance + 0.3 * previous_marks + np.random.normal(0, 8, num_records)
    assignment_completion = np.clip(np.round(assignment_completion, 1), 20.0, 100.0)
    
    # 6. Backlog Count: Most students have 0, some have 1-4, rarely more
    # Use Poisson distribution with mean 0.6
    backlog_count = np.random.poisson(lam=0.6, size=num_records)
    backlog_count = np.clip(backlog_count, 0, 8)
    
    # 7. Sleep Hours: Normal distribution around 7 hours with std 1.1
    sleep_hours = np.random.normal(loc=7.0, scale=1.1, size=num_records)
    sleep_hours = np.clip(np.round(sleep_hours, 1), 4.0, 10.5)
    
    # 8. Extracurricular Participation: Binary (approx 45% participation)
    extracurricular = np.random.binomial(n=1, p=0.45, size=num_records)
    
    # Sleep adjustment: 7 to 8 hours is optimal (+2.0 points), <5 or >9 is slightly penalizing
    sleep_adjustment = np.where(
        (sleep_hours >= 6.5) & (sleep_hours <= 8.5),
        2.0,
        np.where(sleep_hours < 5.5, -3.0, -1.0)
    )
    
    # Realistic noise
    noise = np.random.normal(loc=0.0, scale=3.2, size=num_records)
    
    # Final Marks calculation (target variable)
    final_marks = (
        0.38 * previous_marks +
        0.20 * attendance +
        1.75 * study_hours +
        0.12 * assignment_completion -
        2.85 * backlog_count +
        2.20 * extracurricular +
        sleep_adjustment +
        noise
    )
    
    final_marks = np.clip(np.round(final_marks, 1), 0.0, 100.0)
    
    df = pd.DataFrame({
        "student_id": student_ids,
        "previous_marks": previous_marks,
        "attendance": attendance,
        "study_hours": study_hours,
        "assignment_completion": assignment_completion,
        "backlog_count": backlog_count,
        "sleep_hours": sleep_hours,
        "extracurricular_participation": extracurricular,
        "final_marks": final_marks
    })
    
    return df

def save_dataset(output_path=None):
    """Generates and saves the dataset to CSV."""
    if output_path is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(base_dir, "dataset", "student_performance_data.csv")
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_student_dataset(num_records=1500, random_seed=42)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic student records successfully.")
    print(f"Saved dataset to: {output_path}")
    print("\nDataset Summary Statistics:")
    print(df.describe().to_string())
    return output_path

if __name__ == "__main__":
    save_dataset()
