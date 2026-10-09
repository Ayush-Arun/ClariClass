from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import ClassSession, Chunk, Student, Signal
from services.struggle_scoring import compute_chunk_struggle

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboards"])

@router.get("/class/{room_code}")
def get_class_analytics(room_code: str, db: Session = Depends(get_db)):
    """
    Returns class-wide struggle heatmap, important highlights, and student list.
    """
    session = db.query(ClassSession).filter(ClassSession.room_code == room_code.upper()).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    students = db.query(Student).filter(Student.session_id == session.id).all()
    chunks = db.query(Chunk).filter(Chunk.document_id == session.document_id).order_by(Chunk.chunk_order).all()
    
    total_students = len(students)
    chunk_analytics = []
    highlights = []

    for c in chunks:
        signals = (
            db.query(Signal)
            .join(Student, Signal.student_id == Student.id)
            .filter(Student.session_id == session.id, Signal.chunk_id == c.id)
            .all()
        )
        sig_dicts = [{"student_id": s.student_id, "signal_type": s.signal_type, "value": s.value} for s in signals]
        struggle = compute_chunk_struggle(sig_dicts, total_students, session.struggle_threshold_percent)
        
        chunk_analytics.append({
            "chunk_id": c.id,
            "order": c.chunk_order,
            "page_number": c.page_number,
            "text_preview": c.original_text[:120] + "...",
            "has_simplified": bool(c.simplified_text),
            "struggle_percentage": struggle["struggle_percentage"],
            "struggling_count": struggle["struggling_students_count"],
            "important_count": struggle["important_students_count"]
        })

        if struggle["important_students_count"] > 0:
            highlights.append({
                "chunk_id": c.id,
                "order": c.chunk_order,
                "text": c.original_text,
                "votes": struggle["important_students_count"]
            })

    return {
        "room_code": session.room_code,
        "total_students": total_students,
        "students": [{"id": s.id, "display_name": s.display_name, "joined_at": s.joined_at} for s in students],
        "chunks": chunk_analytics,
        "highlights": sorted(highlights, key=lambda x: x["votes"], reverse=True)
    }

@router.get("/student/{student_id}")
def get_student_analytics(student_id: int, db: Session = Depends(get_db)):
    """
    Returns granular per-student struggle metrics and flags.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    signals = db.query(Signal).filter(Signal.student_id == student_id).all()
    
    return {
        "student_id": student.id,
        "display_name": student.display_name,
        "session_id": student.session_id,
        "signals": [
            {
                "chunk_id": s.chunk_id,
                "signal_type": s.signal_type,
                "value": s.value,
                "created_at": s.created_at
            }
            for s in signals
        ]
    }
