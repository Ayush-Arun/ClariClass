from typing import List, Dict, Any

def compute_chunk_struggle(
    chunk_signals: List[Dict[str, Any]], 
    total_active_students: int,
    struggle_threshold_percent: float = 25.0
) -> Dict[str, Any]:
    """
    Computes struggle metrics for a chunk.
    Signals can be: 'flag_difficult', 'dwell_ms', 'gaze_dwell_ms', 'expression_confusion'.
    """
    if total_active_students <= 0:
        return {
            "struggling_students_count": 0,
            "struggle_percentage": 0.0,
            "threshold_exceeded": False,
            "details": {}
        }

    struggling_student_ids = set()
    important_student_ids = set()

    for sig in chunk_signals:
        s_type = sig.get("signal_type")
        s_id = sig.get("student_id")
        val = sig.get("value", 1.0)

        if s_type == "flag_difficult":
            struggling_student_ids.add(s_id)
        elif s_type == "flag_important":
            important_student_ids.add(s_id)
        elif s_type == "dwell_ms" and val > 45000:  # > 45s dwell
            struggling_student_ids.add(s_id)
        elif s_type == "expression_confusion" and val >= 0.7:
            struggling_student_ids.add(s_id)
        elif s_type == "gaze_dwell_ms" and val > 30000:
            struggling_student_ids.add(s_id)

    struggle_count = len(struggling_student_ids)
    struggle_pct = (struggle_count / total_active_students) * 100.0
    threshold_exceeded = struggle_pct >= struggle_threshold_percent

    return {
        "struggling_students_count": struggle_count,
        "struggling_student_ids": list(struggling_student_ids),
        "important_students_count": len(important_student_ids),
        "struggle_percentage": round(struggle_pct, 2),
        "threshold_exceeded": threshold_exceeded
    }
