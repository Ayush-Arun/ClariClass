import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Star, 
  Edit3, 
  Hand,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { socket, joinClassroom } from '../api/socket';

export default function StudentView({ sessionData, onBack }) {
  const [chunks, setChunks] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDifficult, setIsDifficult] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [simplifiedMap, setSimplifiedMap] = useState({});
  const [gazePosition, setGazePosition] = useState({ x: 48, y: 52 });

  const fetchSessionChunks = async () => {
    try {
      const docId = sessionData?.document_id || 1;
      const doc = await apiRequest(`/documents/${docId}`);
      if (doc?.chunks?.length > 0) {
        setChunks(doc.chunks);
      }
    } catch (e) {
      if (chunks.length === 0) {
        setChunks([
          {
            id: 1,
            order: 1,
            title: "Newton's First Law: Inertia",
            text: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This tendency to resist changes in state of motion is termed inertia."
          },
          {
            id: 2,
            order: 2,
            title: "Newton's Second Law: F = ma",
            text: "The acceleration of an object depends directly upon the net force acting on it and inversely upon its mass. When multiple forces act simultaneously, you must first resolve them into a single vector sum before applying the law.\n\nThis means that if you double the force while keeping mass constant, the acceleration doubles. Conversely, doubling the mass with the same force halves the acceleration. Many students confuse inertia with force—remember, inertia is a property of mass, not a push or pull."
          },
          {
            id: 3,
            order: 3,
            title: "Newton's Third Law: Action-Reaction",
            text: "For every action, there is an equal and opposite reaction. Whenever one body exerts a force on a second body, the first body experiences a force that is equal in magnitude and opposite in direction to the force that it exerts."
          }
        ]);
      }
    }
  };

  useEffect(() => {
    fetchSessionChunks();

    if (sessionData?.room_code) {
      joinClassroom(sessionData.room_code);

      socket.on('chunk_simplified', (data) => {
        if (data.simplified_text && data.chunk_id) {
          setSimplifiedMap((prev) => ({
            ...prev,
            [data.chunk_id]: data.simplified_text
          }));
        }
      });
    }

    return () => {
      socket.off('chunk_simplified');
    };
  }, [sessionData?.room_code]);

  const activeChunk = chunks[currentSlideIndex] || chunks[0] || {
    id: 1,
    order: 1,
    title: "Slide 1",
    text: "Lecture material text will appear here."
  };

  const handleFlagDifficult = async () => {
    const nextState = !isDifficult;
    setIsDifficult(nextState);
    if (nextState) {
      try {
        await apiRequest('/signals/ingest', {
          method: 'POST',
          body: JSON.stringify({
            student_id: sessionData?.student_id || 1,
            chunk_id: activeChunk.id || currentSlideIndex + 1,
            signal_type: 'flag_difficult',
            value: 1.0
          })
        });
      } catch (e) {
        // Fallback demo simulation
        setSimplifiedMap((prev) => ({
          ...prev,
          [activeChunk.id || 1]: `💡 Simplified Breakdown (Gemma 4):\n\nKey Intuition: ${activeChunk.text.slice(0, 160)}...\n\nAnalogy: Net force is the single resultant push after subtracting opposing resistance forces like friction.`
        }));
      }
    }
  };

  const handleFlagImportant = async () => {
    const nextState = !isImportant;
    setIsImportant(nextState);
    if (nextState) {
      try {
        await apiRequest('/signals/ingest', {
          method: 'POST',
          body: JSON.stringify({
            student_id: sessionData?.student_id || 1,
            chunk_id: activeChunk.id || currentSlideIndex + 1,
            signal_type: 'flag_important',
            value: 1.0
          })
        });
      } catch (e) {}
    }
  };

  const progressPercent = Math.round(((currentSlideIndex + 1) / (chunks.length || 1)) * 100);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      
      {/* ─── TOP NAVBAR ───────────────────────────────────────── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 2.5rem',
        borderBottom: '1px solid #F3F4F6',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={onBack}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: '#0A4D3C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <GraduationCap size={16} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0A4D3C', letterSpacing: '-0.02em' }}>
              FocusAI<span style={{ color: '#0A4D3C' }}>.</span>
            </span>
          </div>

          <div style={{ height: 18, width: 1, backgroundColor: '#E5E7EB' }}></div>

          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>
            Room: <strong style={{ color: '#0A4D3C' }}>{sessionData?.room_code || 'ROOM304'}</strong> • Student: <strong style={{ color: '#111827' }}>{sessionData?.display_name || 'Alex Rivera'}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#D4F4E4',
            color: '#086F4B',
            padding: '0.3rem 0.75rem',
            borderRadius: 16,
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#086F4B' }}></div>
            LIVE
          </div>

          <span style={{ fontSize: '0.8rem', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>
            14:32 elapsed
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#111827',
            color: '#FFFFFF',
            padding: '0.3rem 0.8rem',
            borderRadius: 16,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }}></div>
            TRACKING ACTIVE
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', maxWidth: 1400, width: '100%', margin: '0 auto', padding: '2.5rem 3rem', gap: '3.5rem' }}>
        
        {/* ── LEFT COLUMN: SLIDE CONTENT ── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#9CA3AF',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              SLIDE {currentSlideIndex + 1} OF {chunks.length || 1}
            </span>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button 
                disabled={currentSlideIndex === 0}
                onClick={() => {
                  setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
                  setIsDifficult(false);
                  setIsImportant(false);
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentSlideIndex === 0 ? 0.4 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <button 
                disabled={currentSlideIndex >= chunks.length - 1}
                onClick={() => {
                  setCurrentSlideIndex(Math.min(chunks.length - 1, currentSlideIndex + 1));
                  setIsDifficult(false);
                  setIsImportant(false);
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: currentSlideIndex >= chunks.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentSlideIndex >= chunks.length - 1 ? 0.4 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem'
            }}>
              {activeChunk.title || `Slide ${activeChunk.order}`}
            </h1>

            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#374151', whiteSpace: 'pre-wrap' }}>
              {activeChunk.text}

              <div style={{
                position: 'relative',
                display: 'inline-block',
                width: '100%',
                margin: '0.5rem 0'
              }}>
                <div style={{
                  position: 'absolute',
                  left: `${gazePosition.x}%`,
                  top: '50%',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '3px solid #3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
                  animation: 'pulseGaze 2s infinite ease-in-out',
                  pointerEvents: 'none'
                }}></div>
              </div>
            </div>
          </div>

          {/* AI Simplified Drawer */}
          {simplifiedMap[activeChunk.id || currentSlideIndex + 1] && (
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 14,
              padding: '1.25rem',
              marginBottom: '2rem',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1D4ED8', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Sparkles size={18} />
                <span>AI Live Simplification (Gemma 4)</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#1E3A8A', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {simplifiedMap[activeChunk.id || currentSlideIndex + 1]}
              </p>
            </div>
          )}

          {/* Floating Action Pill Bar */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.85rem',
            backgroundColor: '#FFFFFF',
            padding: '0.5rem 0.6rem 0.5rem 1.25rem',
            borderRadius: 30,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0,0,0,0.04)',
            border: '1px solid #F3F4F6',
            width: 'fit-content'
          }}>
            <button
              onClick={handleFlagDifficult}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDifficult ? '#EA580C' : '#6B7280',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={15} color={isDifficult ? '#EA580C' : '#9CA3AF'} />
              <span>{isDifficult ? 'FLAGGED DIFFICULT' : 'DIFFICULT'}</span>
            </button>

            <div style={{ height: 16, width: 1, backgroundColor: '#E5E7EB' }}></div>

            <button
              onClick={handleFlagImportant}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: isImportant ? '#D97706' : '#6B7280',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                cursor: 'pointer'
              }}
            >
              <Star size={15} color={isImportant ? '#D97706' : '#9CA3AF'} />
              <span>{isImportant ? 'FLAGGED IMPORTANT' : 'IMPORTANT'}</span>
            </button>

            <div style={{ height: 16, width: 1, backgroundColor: '#E5E7EB' }}></div>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6B7280',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              cursor: 'pointer'
            }}>
              <Edit3 size={15} color="#9CA3AF" />
              <span>ADD NOTE</span>
            </button>

            <button
              onClick={() => setHandRaised(!handRaised)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: handRaised ? '#F59E0B' : '#0A4D3C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 24,
                padding: '0.55rem 1.15rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Hand size={15} />
              <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
            </button>
          </div>

        </div>

        {/* ── RIGHT COLUMN: SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', marginBottom: '0.65rem' }}>
              Teacher Video
            </div>
            <div style={{
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB',
              position: 'relative'
            }}>
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&auto=format&fit=crop&q=80"
                alt="Teacher stream"
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: 4
              }}>
                Prof. Harrison
              </div>
            </div>
          </div>

          {/* Shared Materials */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>Shared Materials</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                backgroundColor: '#D1F2E2',
                color: '#0A4D3C',
                padding: '0.15rem 0.45rem',
                borderRadius: 4
              }}>
                3 NEW
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#F9FAFB',
                padding: '0.75rem 0.85rem',
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 900
                }}>
                  PDF
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Laws_of_Motion.pdf
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                    2.4 MB · PDF Document
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#F9FAFB',
                padding: '0.75rem 0.85rem',
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 900
                }}>
                  P
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Slide_Deck_07.pptx
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                    5.1 MB · PowerPoint
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Progress Card */}
          <div style={{
            backgroundColor: '#0A4D3C',
            borderRadius: 16,
            padding: '1.25rem',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(10, 77, 60, 0.2)'
          }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: '#A7F3D0',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}>
              LESSON PROGRESS
            </div>
            
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              {progressPercent}% Complete
            </div>

            <div style={{ height: 6, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#10B981', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
