"""
Database Configuration and Operations for Student Performance Prediction
-------------------------------------------------------------------------
Uses SQLite and SQLAlchemy for robust local data persistence.
Stores both student input metrics, model prediction outputs, explanations,
and timestamps.
"""

import os
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, Float, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class StudentPrediction(Base):
    """
    SQLAlchemy Model representing a student performance record and prediction.
    """
    __tablename__ = "student_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    previous_marks = Column(Float, nullable=False)
    attendance = Column(Float, nullable=False)
    study_hours = Column(Float, nullable=False)
    assignment_completion = Column(Float, nullable=False)
    backlog_count = Column(Integer, nullable=False)
    sleep_hours = Column(Float, nullable=False)
    extracurricular_participation = Column(Integer, nullable=False)  # 0 or 1
    predicted_marks = Column(Float, nullable=False)
    performance_category = Column(String(50), nullable=False, index=True)  # Excellent, Good, Average, Needs Improvement
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        """Serialize model instance to dictionary."""
        return {
            "id": self.id,
            "student_id": self.student_id,
            "previous_marks": round(self.previous_marks, 2),
            "attendance": round(self.attendance, 2),
            "study_hours": round(self.study_hours, 2),
            "assignment_completion": round(self.assignment_completion, 2),
            "backlog_count": self.backlog_count,
            "sleep_hours": round(self.sleep_hours, 2),
            "extracurricular_participation": bool(self.extracurricular_participation),
            "predicted_marks": round(self.predicted_marks, 2),
            "performance_category": self.performance_category,
            "explanation": self.explanation,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }

# Database engine initialization
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "students.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes SQLite database tables."""
    Base.metadata.create_all(bind=engine)
    return DB_PATH

def get_db():
    """Context manager or session provider."""
    session = SessionLocal()
    try:
        return session
    finally:
        pass  # caller manages closing

def save_student_record(data):
    """
    Saves a new student prediction record to the database.
    """
    session = SessionLocal()
    try:
        record = StudentPrediction(
            student_id=data["student_id"],
            previous_marks=float(data["previous_marks"]),
            attendance=float(data["attendance"]),
            study_hours=float(data["study_hours"]),
            assignment_completion=float(data["assignment_completion"]),
            backlog_count=int(data["backlog_count"]),
            sleep_hours=float(data["sleep_hours"]),
            extracurricular_participation=int(data["extracurricular_participation"]),
            predicted_marks=float(data["predicted_marks"]),
            performance_category=data["performance_category"],
            explanation=data.get("explanation", "")
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        return record.to_dict()
    finally:
        session.close()

def get_all_records(search="", category=""):
    """
    Retrieves all records with optional search filter by student_id
    and category filter.
    """
    session = SessionLocal()
    try:
        query = session.query(StudentPrediction).order_by(StudentPrediction.id.desc())
        if search:
            query = query.filter(StudentPrediction.student_id.ilike(f"%{search.strip()}%"))
        if category and category != "All":
            query = query.filter(StudentPrediction.performance_category == category)
        records = query.all()
        return [r.to_dict() for r in records]
    finally:
        session.close()

def get_record_by_id(record_id):
    """Fetches a single student record by primary ID."""
    session = SessionLocal()
    try:
        record = session.query(StudentPrediction).filter(StudentPrediction.id == record_id).first()
        return record.to_dict() if record else None
    finally:
        session.close()

def delete_record_by_id(record_id):
    """Deletes a student record by ID."""
    session = SessionLocal()
    try:
        record = session.query(StudentPrediction).filter(StudentPrediction.id == record_id).first()
        if record:
            session.delete(record)
            session.commit()
            return True
        return False
    finally:
        session.close()

def get_prediction_history(limit=50):
    """Retrieves recent prediction history ordered newest first."""
    session = SessionLocal()
    try:
        records = session.query(StudentPrediction).order_by(StudentPrediction.created_at.desc()).limit(limit).all()
        return [r.to_dict() for r in records]
    finally:
        session.close()

def get_dashboard_summary():
    """
    Calculates summary statistics for the dashboard.
    """
    session = SessionLocal()
    try:
        records = session.query(StudentPrediction).all()
        total_students = len(records)
        
        if total_students == 0:
            return {
                "total_records": 0,
                "average_marks": 0.0,
                "category_counts": {
                    "Excellent": 0,
                    "Good": 0,
                    "Average": 0,
                    "Needs Improvement": 0
                },
                "category_distribution": [
                    {"name": "Excellent", "value": 0, "color": "#10B981"},
                    {"name": "Good", "value": 0, "color": "#3B82F6"},
                    {"name": "Average", "value": 0, "color": "#F59E0B"},
                    {"name": "Needs Improvement", "value": 0, "color": "#EF4444"}
                ],
                "attendance_vs_marks": [],
                "study_hours_vs_marks": [],
                "recent_predictions": []
            }
        
        avg_marks = round(sum(r.predicted_marks for r in records) / total_students, 2)
        
        counts = {
            "Excellent": 0,
            "Good": 0,
            "Average": 0,
            "Needs Improvement": 0
        }
        for r in records:
            cat = r.performance_category
            if cat in counts:
                counts[cat] += 1
            else:
                counts[cat] = 1

        category_distribution = [
            {"name": "Excellent", "value": counts.get("Excellent", 0), "color": "#10B981"},
            {"name": "Good", "value": counts.get("Good", 0), "color": "#3B82F6"},
            {"name": "Average", "value": counts.get("Average", 0), "color": "#F59E0B"},
            {"name": "Needs Improvement", "value": counts.get("Needs Improvement", 0), "color": "#EF4444"}
        ]

        # Correlation scatter points (sample up to 50 for clean chart performance)
        sample = records[-50:]
        attendance_vs_marks = [
            {"student_id": r.student_id, "attendance": round(r.attendance, 1), "predicted_marks": round(r.predicted_marks, 1)}
            for r in sample
        ]
        study_hours_vs_marks = [
            {"student_id": r.student_id, "study_hours": round(r.study_hours, 1), "predicted_marks": round(r.predicted_marks, 1)}
            for r in sample
        ]
        
        recent = [r.to_dict() for r in records[-10:]]
        recent.reverse()

        return {
            "total_records": total_students,
            "average_marks": avg_marks,
            "category_counts": counts,
            "category_distribution": category_distribution,
            "attendance_vs_marks": attendance_vs_marks,
            "study_hours_vs_marks": study_hours_vs_marks,
            "recent_predictions": recent
        }
    finally:
        session.close()
