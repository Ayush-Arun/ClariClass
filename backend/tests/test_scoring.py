from services.struggle_scoring import compute_chunk_struggle

def test_struggle_scoring_below_threshold():
    signals = [
        {"student_id": 1, "signal_type": "flag_difficult", "value": 1.0}
    ]
    total_students = 10 # 1 out of 10 is 10% (< 25% default threshold)
    res = compute_chunk_struggle(signals, total_students, struggle_threshold_percent=25.0)
    
    assert res["struggling_students_count"] == 1
    assert res["struggle_percentage"] == 10.0
    assert res["threshold_exceeded"] is False

def test_struggle_scoring_above_threshold():
    signals = [
        {"student_id": 1, "signal_type": "flag_difficult", "value": 1.0},
        {"student_id": 2, "signal_type": "dwell_ms", "value": 50000},
        {"student_id": 3, "signal_type": "expression_confusion", "value": 0.85}
    ]
    total_students = 10 # 3 out of 10 is 30% (>= 25% default threshold)
    res = compute_chunk_struggle(signals, total_students, struggle_threshold_percent=25.0)
    
    assert res["struggling_students_count"] == 3
    assert res["struggle_percentage"] == 30.0
    assert res["threshold_exceeded"] is True
