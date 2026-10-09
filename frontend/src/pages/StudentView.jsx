import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Flag, 
  Sparkles, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  CheckCircle2, 
  ArrowLeft,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { socket, joinClassroom } from '../api/socket';
import { gazeTracker } from '../services/gazeTracker';
import CalibrationModal from '../components/CalibrationModal';
import UserAvatar from '../components/UserAvatar';

export default function StudentView({ sessionData, onBack }) {
  const [session, setSession] = useState(sessionData || {
    room_code: 'ROOM304',
    title: "Physics 101 — Newton's Laws",
    student_id: 1,
    display_name: 'Alex Rivera'
  });

  const [chunks, setChunks] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeReiteration, setActiveReiteration] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Privacy & Eye tracking state
  const [isCalibModalOpen, setIsCalibModalOpen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [gazeActiveBlock, setGazeActiveBlock] = useState(null);

  // Student flag state
  const [flaggedBlocks, setFlaggedBlocks] = useState({});
  const [importantBlocks, setImportantBlocks] = useState({});

  // Fetch initial session chunks
  const fetchSessionChunks = async () => {
    try {
      const roomCode = session.room_code || 'ROOM304';
      const res = await apiRequest(`/analytics/class/${roomCode}`);
      if (res?.chunks && res.chunks.length > 0) {
        setChunks(res.chunks);
      }
    } catch (err) {
      if (chunks.length === 0) {
        setChunks([
          {
            chunk_id: 1,
            order: 1,
            title: "Newton's First Law: Inertia",
            text: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This tendency to resist changes in state of motion is termed inertia.",
            simplified_text: "Inertia means things keep doing what they're doing unless pushed. A stationary ball stays still; a moving ball keeps rolling forever unless friction, gravity, or a wall stops it.",
            page_number: 1
          },
          {
            chunk_id: 2,
            order: 2,
            title: "Newton's Second Law: F = ma",
            text: "The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object.",
            simplified_text: "Force equals mass times acceleration (F = m × a). Heavier objects need stronger pushes to speed up.",
            page_number: 2
          },
          {
            chunk_id: 3,
            order: 3,
            title: "Newton's Third Law: Action & Reaction",
            text: "For every action, there is an equal and opposite reaction. Whenever one body exerts a force on a second body, the first body experiences a force that is equal in magnitude and opposite in direction.",
            simplified_text: "Every action has an equal and opposite reaction.",
            page_number: 3
          }
        ]);
      }
    }
  };

  useEffect(() => {
    fetchSessionChunks();

    if (session.room_code) {
      joinClassroom(session.room_code);

      // Listen for teacher slide change event
      socket.on('slide_updated', (data) => {
        if (typeof data.slide_index === 'number') {
          setCurrentSlideIndex(data.slide_index);
          setActiveReiteration(null);
          setActiveQuiz(null);
          setQuizAnswered(false);
        }
      });

      // Listen for live AI reiteration broadcast
      socket.on('content_simplified', (data) => {
        if (data.simplified_text) {
          setActiveReiteration(data.simplified_text);
        }
      });

      // Listen for comprehension quiz broadcast
      socket.on('comprehension_triggered', (data) => {
        if (data.question) {
          setActiveQuiz(data);
          setQuizAnswered(false);
          setSelectedOption(null);
        }
      });
    }

    // Subscribe to gaze telemetry
    const unsubscribeGaze = gazeTracker.subscribe((state) => {
      setCameraEnabled(state.isTracking);
      setGazeActiveBlock(state.activeBlockId);

      // Ingest derived dwell signal periodically
      if (state.metrics && state.metrics.dwell_ms >= 10000) {
        apiRequest('/signals/ingest', {
          method: 'POST',
          body: JSON.stringify({
            student_id: session.student_id || 1,
            chunk_id: parseInt(state.metrics.block_id) || 1,
            signal_type: 'gaze_dwell',
            value: state.metrics.dwell_ms
          })
        }).catch(() => {});
      }
    });

    return () => {
      socket.off('slide_updated');
      socket.off('content_simplified');
      socket.off('comprehension_triggered');
      unsubscribeGaze();
    };
  }, [session.room_code]);

  const currentChunk = chunks[currentSlideIndex] || chunks[0];

  const handleFlagDifficult = async () => {
    if (!currentChunk) return;
    const cid = currentChunk.chunk_id || currentChunk.id || 1;
    setFlaggedBlocks(prev => ({ ...prev, [cid]: !prev[cid] }));

    try {
      await apiRequest('/signals/ingest', {
        method: 'POST',
        body: JSON.stringify({
          student_id: session.student_id || 1,
          chunk_id: cid,
          signal_type: 'flag_difficult',
          value: 1.0
        })
      });
    } catch (err) {}
  };

  const handleFlagImportant = async () => {
    if (!currentChunk) return;
    const cid = currentChunk.chunk_id || currentChunk.id || 1;
    setImportantBlocks(prev => ({ ...prev, [cid]: !prev[cid] }));

    try {
      await apiRequest('/signals/ingest', {
        method: 'POST',
        body: JSON.stringify({
          student_id: session.student_id || 1,
          chunk_id: cid,
          signal_type: 'flag_important',
          value: 1.0
        })
      });
    } catch (err) {}
  };

  const handleQuizSubmit = (idx) => {
    setSelectedOption(idx);
    setQuizAnswered(true);

    const isCorrect = idx === (activeQuiz?.correct_index ?? 0);
    apiRequest('/signals/ingest', {
      method: 'POST',
      body: JSON.stringify({
        student_id: session.student_id || 1,
        chunk_id: currentChunk?.chunk_id || 1,
        signal_type: 'quiz_response',
        value: isCorrect ? 1.0 : 0.0
      })
    }).catch(() => {});
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f2f8f5', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Student Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5ece8',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#0a4d3c',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                {session.title || "Physics 101 — Newton's Laws"}
              </span>
              <span style={{
                backgroundColor: '#cbf53d',
                color: '#0d3d2c',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)'
              }}>
                {session.room_code || 'ROOM304'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Live Synchronized with Instructor
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Camera Gaze Toggle */}
          <button
            onClick={() => setIsCalibModalOpen(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1.5px solid #d1ded7',
              backgroundColor: cameraEnabled ? '#ecfdf5' : '#ffffff',
              color: cameraEnabled ? '#047857' : '#4b5563',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {cameraEnabled ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>{cameraEnabled ? 'Gaze Telemetry Active' : 'Enable Eye-Tracking'}</span>
          </button>

          <UserAvatar name={session.display_name || 'Student'} avatarUrl={session.avatar_url} size={36} />

          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                color: '#6b7280',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Main Slide Content Canvas */}
      <main style={{ flex: 1, padding: '24px 32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        {/* Active Slide Card */}
        <div 
          id="active-slide-content"
          className="focus-card" 
          style={{ 
            padding: '32px 36px', 
            marginBottom: '20px',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280' }}>
              Slide {currentSlideIndex + 1} of {chunks.length || 1}
            </span>

            {/* Quick Flag Controls */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleFlagDifficult}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: flaggedBlocks[currentChunk?.chunk_id || currentChunk?.id || 1] ? '#fee2e2' : '#f1f5f9',
                  color: flaggedBlocks[currentChunk?.chunk_id || currentChunk?.id || 1] ? '#dc2626' : '#4b5563',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Flag size={13} />
                <span>Flag Difficult</span>
              </button>

              <button
                onClick={handleFlagImportant}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: importantBlocks[currentChunk?.chunk_id || currentChunk?.id || 1] ? '#fef3c7' : '#f1f5f9',
                  color: importantBlocks[currentChunk?.chunk_id || currentChunk?.id || 1] ? '#b45309' : '#4b5563',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Lightbulb size={13} />
                <span>Mark Important</span>
              </button>
            </div>
          </div>

          {currentChunk ? (
            <div 
              data-content-block-id={currentChunk.chunk_id || currentChunk.id || 1}
              style={{
                borderLeft: '4px solid #0a4d3c',
                paddingLeft: '18px'
              }}
            >
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 14px 0' }}>
                {currentChunk.title || `Slide ${currentSlideIndex + 1}`}
              </h2>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, margin: 0 }}>
                {currentChunk.text}
              </p>
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>Waiting for instructor to broadcast material...</p>
          )}
        </div>

        {/* Live Reiteration Explanation Banner */}
        {(activeReiteration || currentChunk?.simplified_text) && (
          <div className="focus-card animate-slide-up" style={{
            padding: '24px 28px',
            backgroundColor: '#ecfdf5',
            border: '1.5px solid #6ee7b7',
            borderRadius: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>
              <Sparkles size={18} />
              <span>Teacher Shared Gemma AI Clarification</span>
            </div>
            <p style={{ fontSize: '14px', color: '#064e3b', lineHeight: 1.6, margin: 0 }}>
              {activeReiteration || currentChunk.simplified_text}
            </p>
          </div>
        )}

        {/* Comprehension Quiz Card */}
        {activeQuiz && (
          <div className="focus-card animate-slide-up" style={{
            padding: '24px 28px',
            borderLeft: '4px solid #3b82f6',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
              <HelpCircle size={16} />
              <span>Quick Comprehension Check</span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>
              {activeQuiz.question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeQuiz.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => !quizAnswered && handleQuizSubmit(idx)}
                  disabled={quizAnswered}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                    backgroundColor: quizAnswered 
                      ? idx === activeQuiz.correct_index 
                        ? '#dcfce7' 
                        : idx === selectedOption 
                          ? '#fee2e2' 
                          : '#ffffff'
                      : '#ffffff',
                    color: '#111827',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: quizAnswered ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Calibration Modal */}
      <CalibrationModal 
        isOpen={isCalibModalOpen} 
        onClose={() => setIsCalibModalOpen(false)}
        onCalibrationComplete={() => setCameraEnabled(true)}
      />

    </div>
  );
}
