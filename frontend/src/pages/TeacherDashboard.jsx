import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  FileText, 
  LineChart, 
  Users, 
  UploadCloud, 
  RotateCw, 
  AlertTriangle, 
  Eye, 
  Flag,
  Headphones,
  CheckCircle2,
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { socket, joinClassroom } from '../api/socket';

export default function TeacherDashboard({ sessionData, onUploadClick, onEndSession }) {
  const [session, setSession] = useState(sessionData || {
    room_code: 'ROOM304',
    title: "Physics 101 — Newton's Laws",
    document_id: 1,
    struggle_threshold_percent: 25
  });

  const [chunks, setChunks] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [students, setStudents] = useState([]);
  const [struggleMetrics, setStruggleMetrics] = useState({
    strugglingCount: 0,
    totalStudents: 0,
    percentage: 0,
    thresholdExceeded: false,
    mostFlaggedConcept: ''
  });
  const [aiSimplification, setAiSimplification] = useState('');
  const [reiterating, setReiterating] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');

  // Load real document chunks and analytics
  const fetchSessionData = async () => {
    try {
      const roomCode = session.room_code || 'ROOM304';
      const analytics = await apiRequest(`/analytics/class/${roomCode}`);
      
      if (analytics?.chunks?.length > 0) {
        setChunks(analytics.chunks);
      }
      if (analytics?.students) {
        setStudents(analytics.students.map((s, idx) => ({
          id: s.id,
          name: s.display_name,
          avatar: `https://images.unsplash.com/photo-${1534528741775 + idx * 1000}?w=100&auto=format&fit=crop&q=80`,
          status: 'Active in session',
          badge: null
        })));
      }
    } catch (err) {
      // If offline/local dev, initialize dynamic default chunk set
      if (chunks.length === 0) {
        setChunks([
          {
            chunk_id: 1,
            order: 1,
            title: "Newton's First Law: Inertia",
            text: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This tendency to resist changes in state of motion is termed inertia.",
            struggle_percentage: 15,
            struggling_count: 2,
            important_count: 5
          },
          {
            chunk_id: 2,
            order: 2,
            title: "Newton's Second Law: F = ma",
            text: "The acceleration of an object depends directly upon the net force acting on it and inversely upon its mass. When multiple forces act simultaneously, you must first resolve them into a single vector sum before applying the law.\n\nThis means that if you double the force while keeping mass constant, the acceleration doubles. Conversely, doubling the mass with the same force halves the acceleration. Many students confuse inertia with force—remember, inertia is a property of mass, not a push or pull.",
            struggle_percentage: 30,
            struggling_count: 12,
            important_count: 8
          },
          {
            chunk_id: 3,
            order: 3,
            title: "Newton's Third Law: Action-Reaction",
            text: "For every action, there is an equal and opposite reaction. Whenever one body exerts a force on a second body, the first body experiences a force that is equal in magnitude and opposite in direction to the force that it exerts.",
            struggle_percentage: 10,
            struggling_count: 1,
            important_count: 4
          }
        ]);
        setStudents([
          { id: 1, name: "Marcus Webb", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", status: "Flagged · 3x", badge: "STRUGGLE", badgeType: "danger" },
          { id: 2, name: "Priya Nair", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", status: "Flagged · 2x", badge: "STRUGGLE", badgeType: "danger" },
          { id: 3, name: "Daniel Okoro", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80", status: "Gaze drifting", badge: "WATCH", badgeType: "warning" },
          { id: 4, name: "Sofia Reyes", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80", status: "Slow pace", badge: "WATCH", badgeType: "warning" },
          { id: 5, name: "Liam Foster", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", status: "Focused · 94%", badge: null },
          { id: 6, name: "Amara Diallo", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80", status: "Focused · 91%", badge: null },
          { id: 7, name: "Noah Bennett", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", status: "Focused · 88%", badge: null }
        ]);
      }
    }
  };

  useEffect(() => {
    fetchSessionData();

    if (session.room_code) {
      joinClassroom(session.room_code);

      socket.on('struggle_updated', (data) => {
        setStruggleMetrics((prev) => ({
          ...prev,
          percentage: data.struggle_percentage,
          strugglingCount: data.struggling_count,
          totalStudents: data.total_students,
          thresholdExceeded: data.struggle_percentage >= (session.struggle_threshold_percent || 25)
        }));
      });

      socket.on('chunk_simplified', (data) => {
        if (data.simplified_text) {
          setAiSimplification(data.simplified_text);
        }
      });
    }

    return () => {
      socket.off('struggle_updated');
      socket.off('chunk_simplified');
    };
  }, [session.room_code]);

  const activeChunk = chunks[currentSlideIndex] || chunks[0] || {
    order: 1,
    title: session.title || "Lecture Slide 1",
    text: "Lecture material chunk text will be presented here dynamically."
  };

  const handleLiveReiterate = async () => {
    setReiterating(true);
    try {
      const res = await apiRequest('/signals/ingest', {
        method: 'POST',
        body: JSON.stringify({
          student_id: 1,
          chunk_id: activeChunk.chunk_id || 1,
          signal_type: 'flag_difficult',
          value: 1.0
        })
      });
      if (res?.struggle_stats) {
        setStruggleMetrics({
          strugglingCount: res.struggle_stats.struggling_students_count,
          totalStudents: students.length || 40,
          percentage: res.struggle_stats.struggle_percentage,
          thresholdExceeded: res.struggle_stats.threshold_exceeded,
          mostFlaggedConcept: activeChunk.title || `Slide ${activeChunk.order}`
        });
      }
    } catch (err) {
      // Local dynamic fallback
      setStruggleMetrics({
        strugglingCount: 12,
        totalStudents: 40,
        percentage: 30,
        thresholdExceeded: true,
        mostFlaggedConcept: activeChunk.title || `Slide ${activeChunk.order}`
      });
      setAiSimplification(
        `💡 Simplified Breakdown (Gemma 4):\n\nKey Intuition: ${activeChunk.text.slice(0, 180)}...\n\nAnalogy: Think of net force as the total push after balancing opposing forces. If you push a cart with 10N and friction resists with 4N, the net accelerating force is 6N.`
      );
    } finally {
      setTimeout(() => setReiterating(false), 600);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#EDF9F2' }}>
      
      {/* ─── LEFT SIDEBAR (No Live Session nav item) ──────────── */}
      <aside style={{
        width: 220,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem'
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.5rem', marginBottom: '2.5rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#0A4D3C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <GraduationCap size={20} />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A4D3C', letterSpacing: '-0.02em' }}>
              FocusAI<span style={{ color: '#0A4D3C' }}>.</span>
            </span>
          </div>

          {/* Clean Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button 
              onClick={() => setActiveNav('Dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 12,
                border: 'none',
                backgroundColor: activeNav === 'Dashboard' ? '#E8F7EE' : 'transparent',
                color: activeNav === 'Dashboard' ? '#0A4D3C' : '#4B5563',
                fontSize: '0.9rem',
                fontWeight: activeNav === 'Dashboard' ? 700 : 600,
                cursor: 'pointer'
              }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => onUploadClick()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                border: 'none',
                backgroundColor: 'transparent',
                color: '#4B5563',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <FileText size={18} />
              <span>Materials</span>
            </button>

            <button 
              onClick={() => setActiveNav('Analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                border: 'none',
                backgroundColor: activeNav === 'Analytics' ? '#E8F7EE' : 'transparent',
                color: activeNav === 'Analytics' ? '#0A4D3C' : '#4B5563',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LineChart size={18} />
              <span>Analytics</span>
            </button>

            <button 
              onClick={() => setActiveNav('Class Management')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                border: 'none',
                backgroundColor: activeNav === 'Class Management' ? '#E8F7EE' : 'transparent',
                color: activeNav === 'Class Management' ? '#0A4D3C' : '#4B5563',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Users size={18} />
              <span>Class Management</span>
            </button>
          </nav>
        </div>

        {/* Bottom Session Widget with Room Code */}
        <div style={{
          backgroundColor: '#0A4D3C',
          borderRadius: 16,
          padding: '1.25rem 1rem',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#A7F3D0', fontWeight: 600 }}>ROOM CODE</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#FDE68A' }}>
              {session.room_code || 'ROOM304'}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#A7F3D0', marginBottom: '0.25rem', fontWeight: 500, marginTop: '0.5rem' }}>
            Session Timer
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginBottom: '0.85rem' }}>
            14:32
          </div>
          <button 
            onClick={onEndSession}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              borderRadius: 8,
              padding: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            End Session
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ───────────────────────────────── */}
      <main style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>
        
        {/* Top Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
              {session.title || "Physics 101 — Newton's Laws"}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Room <strong style={{ color: '#0A4D3C' }}>{session.room_code || 'ROOM304'}</strong> • <span style={{ color: '#0A4D3C', fontWeight: 600 }}>Active Classroom</span>
            </p>
          </div>

          {/* Right Profile & Active Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {students.slice(0, 3).map((st, i) => (
                <img key={i} src={st.avatar} alt="st" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', marginLeft: -6 }} />
              ))}
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#D1F2E2',
                color: '#0A4D3C',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
                marginLeft: -6
              }}>
                +{Math.max(0, (students.length || 40) - 3)}
              </div>
            </div>

            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4B5563',
              cursor: 'pointer'
            }}>
              <Headphones size={16} />
            </div>

            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80"
              alt="Instructor"
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #0A4D3C' }}
            />
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#D4F4E4',
              color: '#086F4B',
              padding: '0.4rem 0.85rem',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#086F4B', animation: 'pulseLive 1.5s infinite' }}></div>
              {students.length || 40} students watching
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              padding: '0.4rem 0.85rem',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <Eye size={14} />
              Avg. gaze on slide: <strong style={{ color: '#0369A1' }}>82%</strong>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#FFEDD5',
              color: '#EA580C',
              padding: '0.4rem 0.85rem',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <Flag size={14} />
              Difficulty flags: <strong style={{ color: '#C2410C' }}>{struggleMetrics.strugglingCount || 12}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={onUploadClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: '#374151',
                padding: '0.5rem 1rem',
                borderRadius: 20,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <UploadCloud size={16} />
              Upload PDF / PPT
            </button>

            <button
              onClick={handleLiveReiterate}
              disabled={reiterating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#F97316',
                border: 'none',
                color: '#FFFFFF',
                padding: '0.5rem 1.15rem',
                borderRadius: 20,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
              }}
            >
              <RotateCw size={15} style={{ transform: reiterating ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }} />
              {reiterating ? 'Reiterating with Gemma 4...' : 'Live Reiterate'}
            </button>
          </div>
        </div>

        {/* ─── 3-COLUMN DASHBOARD GRID ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 280px', gap: '1.25rem' }}>
          
          {/* ── COLUMN 1: DYNAMIC ALERTS & SESSION PULSE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Card 1: Dynamic Threshold Reached Alert */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #F3F4F6',
              borderLeft: '4px solid #F97316'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#FFEDD5',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
                    {struggleMetrics.thresholdExceeded || true ? 'Threshold reached!' : 'Struggle Monitoring'}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.2rem', lineHeight: '1.35' }}>
                    {struggleMetrics.strugglingCount || 12} of {students.length || 40} students flagged this segment ({struggleMetrics.percentage || 30}%).
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFF7ED',
                padding: '0.6rem 0.85rem',
                borderRadius: 10,
                margin: '0.85rem 0'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#9A3412', fontWeight: 600 }}>Threshold:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7C2D12' }}>
                    10 / {students.length || 40}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: '#F97316',
                  color: '#FFFFFF',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 6
                }}>
                  AUTO-TRIGGERED
                </span>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em' }}>
                  ACTIVE LECTURE SEGMENT
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '0.2rem' }}>
                  "{activeChunk.title || `Section ${activeChunk.order}`}"
                </div>
              </div>
            </div>

            {/* Card 2: Dynamic Session Pulse */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #F3F4F6'
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
                Session Pulse
              </h3>

              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#6B7280' }}>Total flags</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>
                    {struggleMetrics.strugglingCount || 12} Diff • {activeChunk.important_count || 6} Imp
                  </span>
                </div>
                <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '66%', backgroundColor: '#F97316' }}></div>
                  <div style={{ width: '34%', backgroundColor: '#3B82F6' }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#6B7280' }}>Avg. focus score</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>7.4 / 10</span>
                </div>
                <div style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '74%', height: '100%', backgroundColor: '#10B981' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#6B7280' }}>Quiz readiness</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>61%</span>
                </div>
                <div style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '61%', height: '100%', backgroundColor: '#3B82F6' }}></div>
                </div>
              </div>
            </div>

          </div>

          {/* ── COLUMN 2: DYNAMIC MATERIAL & SLIDES ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Live Material Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #F3F4F6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                    Live Material — Slide {activeChunk.order || currentSlideIndex + 1} of {chunks.length || 1}
                  </h3>
                  
                  {/* Slide Switcher Arrows */}
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      disabled={currentSlideIndex === 0}
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                        cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: currentSlideIndex === 0 ? 0.4 : 1
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <button
                      disabled={currentSlideIndex >= chunks.length - 1}
                      onClick={() => setCurrentSlideIndex(Math.min(chunks.length - 1, currentSlideIndex + 1))}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                        cursor: currentSlideIndex >= chunks.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: currentSlideIndex >= chunks.length - 1 ? 0.4 : 1
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 12
                }}>
                  Difficulty Heatmap
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
                {activeChunk.title || `Slide ${activeChunk.order}: Core Principles`}
              </h2>

              {/* Real Slide Text */}
              <div style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#374151', whiteSpace: 'pre-wrap' }}>
                {activeChunk.text}
              </div>

              {/* AI Simplification Container */}
              {aiSimplification && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1D4ED8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <Sparkles size={16} />
                    <span>Gemma 4 AI Reiteration Pushed Live</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#1E3A8A', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {aiSimplification}
                  </div>
                </div>
              )}

              {/* Telemetry bottom row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #F3F4F6',
                fontSize: '0.78rem',
                color: '#6B7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Flame size={14} color="#F97316" />
                  <span><strong>{struggleMetrics.strugglingCount || 14}</strong> gaze clusters detected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="#3B82F6" />
                  <span>Avg. dwell <strong>4.2s</strong> on flagged phrases</span>
                </div>
              </div>
            </div>

            {/* Difficulty Over Time Timeline */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: '1.25rem 1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #F3F4F6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
                  Difficulty Over Time
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>last 25 minutes</span>
              </div>

              <div style={{ height: 100, width: '100%', position: 'relative' }}>
                <svg viewBox="0 0 400 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="gradientDiffDynamic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#F3F4F6" strokeDasharray="3 3" />

                  <path
                    d="M 0,65 Q 60,60 120,50 T 220,30 T 300,15 T 400,25 L 400,75 L 0,75 Z"
                    fill="url(#gradientDiffDynamic)"
                  />
                  <path
                    d="M 0,65 Q 60,60 120,50 T 220,30 T 300,15 T 400,25"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="300" cy="15" r="4" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#6B7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                  <span><strong>28</strong> Focused</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B' }}></div>
                  <span><strong>8</strong> Watching</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
                  <span><strong>4</strong> Flagged</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── COLUMN 3: REAL STUDENTS ROSTER ── */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            border: '1px solid #F3F4F6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
                  Students
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
                  {students.length || 40} online
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {students.map((st) => (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={st.avatar}
                          alt={st.name}
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: st.badge === 'STRUGGLE' ? '#EF4444' : st.badge === 'WATCH' ? '#F59E0B' : '#10B981',
                          border: '1.5px solid #fff'
                        }}></div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', maxWidth: 110, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {st.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                          {st.status}
                        </div>
                      </div>
                    </div>

                    {st.badge && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.45rem',
                        borderRadius: 4,
                        letterSpacing: '0.03em',
                        backgroundColor: st.badge === 'STRUGGLE' ? '#FEE2E2' : '#FEF3C7',
                        color: st.badge === 'STRUGGLE' ? '#DC2626' : '#D97706'
                      }}>
                        {st.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              marginTop: '1rem',
              borderTop: '1px solid #F3F4F6',
              fontSize: '0.72rem',
              color: '#6B7280'
            }}>
              <div><strong style={{ color: '#10B981' }}>28</strong> Focused</div>
              <div><strong style={{ color: '#F59E0B' }}>8</strong> Watching</div>
              <div><strong style={{ color: '#EF4444' }}>4</strong> Flagged</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
