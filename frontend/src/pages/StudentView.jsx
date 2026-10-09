import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  File, 
  AlertTriangle, 
  Star, 
  Edit3, 
  Hand,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { socket, joinClassroom } from '../api/socket';

export default function StudentView({ sessionData, onBack }) {
  const [currentSlide, setCurrentSlide] = useState(7);
  const [totalSlides, setTotalSlides] = useState(15);
  const [isDifficult, setIsDifficult] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState('');
  const [gazePosition, setGazePosition] = useState({ x: 48, y: 52 }); // Percentages

  useEffect(() => {
    if (sessionData?.room_code) {
      joinClassroom(sessionData.room_code);

      socket.on('chunk_simplified', (data) => {
        if (data.simplified_text) {
          setSimplifiedText(data.simplified_text);
        }
      });
    }

    return () => {
      socket.off('chunk_simplified');
    };
  }, [sessionData]);

  const handleFlagDifficult = async () => {
    const nextState = !isDifficult;
    setIsDifficult(nextState);
    if (nextState) {
      try {
        await apiRequest('/signals/ingest', {
          method: 'POST',
          body: JSON.stringify({
            student_id: sessionData?.student_id || 1,
            chunk_id: currentSlide,
            signal_type: 'flag_difficult',
            value: 1.0
          })
        });
      } catch (e) {
        console.log('Signal sent:', e);
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
            chunk_id: currentSlide,
            signal_type: 'flag_important',
            value: 1.0
          })
        });
      } catch (e) {
        console.log('Signal sent:', e);
      }
    }
  };

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
        {/* Brand & Course Title */}
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
            Physics 101: <span style={{ fontWeight: 700, color: '#111827' }}>Newton's Laws</span>
          </div>
        </div>

        {/* Status Indicators */}
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

      {/* ─── MAIN CONTENT TWO-COLUMN LAYOUT ──────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', maxWidth: 1400, width: '100%', margin: '0 auto', padding: '2.5rem 3rem', gap: '3.5rem' }}>
        
        {/* ── LEFT COLUMN: SLIDE CONTENT & FLOATING CONTROLS ── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          {/* Slide Navigation Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#9CA3AF',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              SLIDE {currentSlide} OF {totalSlides}
            </span>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button 
                onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
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
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <button 
                onClick={() => setCurrentSlide(Math.min(totalSlides, currentSlide + 1))}
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
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Slide Body */}
          <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem'
            }}>
              Newton's Second Law: F = ma
            </h1>

            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#374151' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                The acceleration of an object depends directly upon the <strong>net force</strong> acting on it and inversely upon its mass. When multiple forces act simultaneously, you must first resolve them into a single vector sum before applying the law.
              </p>

              {/* Eye Gaze Target Ring Indicator (Blue Concentric Ring) */}
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

              <p>
                This means that if you double the force while keeping mass constant, the acceleration doubles. Conversely, doubling the mass with the same force halves the acceleration. Many students confuse <strong>inertia</strong> with force—remember, inertia is a property of mass, not a push or pull.
              </p>
            </div>
          </div>

          {/* AI Simplified Drawer (When Activated) */}
          {simplifiedText && (
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
              <p style={{ fontSize: '0.95rem', color: '#1E3A8A', lineHeight: '1.6' }}>
                {simplifiedText}
              </p>
            </div>
          )}

          {/* Floating Action Bar Attached to Bottom of Slide Content */}
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
            {/* Difficult Flag Button */}
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
              <span>DIFFICULT</span>
            </button>

            <div style={{ height: 16, width: 1, backgroundColor: '#E5E7EB' }}></div>

            {/* Important Flag Button */}
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
              <span>IMPORTANT</span>
            </button>

            <div style={{ height: 16, width: 1, backgroundColor: '#E5E7EB' }}></div>

            {/* Add Note Button */}
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

            {/* Raise Hand Button */}
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
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              <Hand size={15} />
              <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
            </button>
          </div>

        </div>

        {/* ── RIGHT COLUMN: TEACHER VIDEO, SHARED MATERIALS, PROGRESS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Teacher Video Widget */}
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
              {/* PDF Document Card */}
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

              {/* PPTX Document Card */}
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
              48% Complete
            </div>

            {/* Progress Bar */}
            <div style={{ height: 6, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '48%', height: '100%', backgroundColor: '#10B981' }}></div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
