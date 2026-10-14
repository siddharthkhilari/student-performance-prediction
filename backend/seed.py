"""
Database Seeding Script
-----------------------
Seeds 25 realistic student prediction records from the dataset into SQLite.
Allows the user and teacher to immediately see populated charts and metrics upon first launch.
"""

import os
import sys
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, save_student_record, get_all_records
from predict import predict_student_performance
from generate_dataset import save_dataset

def seed():
    init_db()
    existing = get_all_records()
    if len(existing) >= 15:
        print(f"Database already has {len(existing)} student records. No seeding needed.")
        return

    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "dataset", "student_performance_data.csv")
    if not os.path.exists(dataset_path):
        save_dataset(dataset_path)

    df = pd.read_csv(dataset_path).head(25)
    added = 0
    for _, row in df.iterrows():
        payload = {
            "student_id": str(row["student_id"]),
            "previous_marks": float(row["previous_marks"]),
            "attendance": float(row["attendance"]),
            "study_hours": float(row["study_hours"]),
            "assignment_completion": float(row["assignment_completion"]),
            "backlog_count": int(row["backlog_count"]),
            "sleep_hours": float(row["sleep_hours"]),
            "extracurricular_participation": int(row["extracurricular_participation"])
        }
        ok, res, err = predict_student_performance(payload)
        if ok:
            save_student_record(res)
            added += 1

    print(f"Successfully seeded {added} student performance records into SQLite database.")

if __name__ == "__main__":
    seed()
