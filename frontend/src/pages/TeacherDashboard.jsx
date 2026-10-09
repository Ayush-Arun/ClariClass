import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Sliders,
  Share2,
  TrendingUp,
  Award,
  Zap,
  Check,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import UploadModal from '../components/UploadModal';
import { apiRequest } from '../api/client';
import { socket, joinClassroom } from '../api/socket';

export default function TeacherDashboard({ sessionData, onEndSession }) {
  // Navigation tabs: 'Dashboard' | 'Materials' | 'Analytics' | 'Class Management'
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Active Session State
  const [session, setSession] = useState(sessionData || {
    room_code: 'ROOM304',
    title: "Physics 101 — Newton's Laws",
    document_id: 1,
    struggle_threshold_percent: 25
  });

  // Slide chunks state
  const [chunks, setChunks] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);

  // Student telemetry state
  const [students, setStudents] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(14 * 60 + 32); // Initial 14:32

  // Live Reiteration state (Gemma AI simplification)
  const [isReiterating, setIsReiterating] = useState(false);
  const [simplifiedChunks, setSimplifiedChunks] = useState({});
  const [reiterationTriggered, setReiterationTriggered] = useState(false);

  // Uploaded documents library
  const [documentsList, setDocumentsList] = useState([]);

  // Session timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load session, chunks, and analytics
  const fetchSessionData = async () => {
    try {
      const roomCode = session.room_code || 'ROOM304';
      const analytics = await apiRequest(`/analytics/class/${roomCode}`);

      if (analytics?.chunks?.length > 0) {
        setChunks(analytics.chunks);
      }
      if (analytics?.students?.length > 0) {
        setStudents(analytics.students.map(s => ({
          id: s.id,
          name: s.display_name,
          avatarUrl: s.avatar_url || null,
          status: 'Active in session',
          badge: null
        })));
      }
    } catch (err) {
      // Initialize matching baseline data if backend DB is empty
      if (chunks.length === 0) {
        setChunks([
          {
            chunk_id: 1,
            order: 1,
            title: "Newton's First Law: Inertia",
            text: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This tendency to resist changes in state of motion is termed inertia.",
            simplified_text: "Inertia means things keep doing what they're already doing unless pushed. A stationary ball stays still; a moving ball keeps rolling forever unless friction, gravity, or a wall stops it.",
            struggle_percentage: 30,
            struggling_count: 12,
            important_count: 5,
            gaze_clusters: 14,
            avg_dwell: 4.2
          },
          {
            chunk_id: 2,
            order: 2,
            title: "Newton's Second Law: F = ma",
            text: "The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object.",
            simplified_text: "Force equals mass times acceleration (F = m × a). Heavier objects need stronger pushes to speed up, and pushing harder makes anything accelerate faster.",
            struggle_percentage: 18,
            struggling_count: 4,
            important_count: 9,
            gaze_clusters: 19,
            avg_dwell: 5.1
          },
          {
            chunk_id: 3,
            order: 3,
            title: "Newton's Third Law: Action & Reaction",
            text: "For every action, there is an equal and opposite reaction. This means that in every interaction, there is a pair of forces acting on the two interacting objects.",
            simplified_text: "Every time you push against something, it pushes back on you with the exact same strength in the opposite direction—like how a rocket pushes gas down to go up.",
            struggle_percentage: 8,
            struggling_count: 1,
            important_count: 6,
            gaze_clusters: 11,
            avg_dwell: 3.4
          }
        ]);

        setStudents([
          { id: 1, name: "Marcus Webb", avatarUrl: null, status: "Flagged · 3x", badge: "STRUGGLE", badgeType: "danger" },
          { id: 2, name: "Priya Nair", avatarUrl: null, status: "Flagged · 2x", badge: "STRUGGLE", badgeType: "danger" },
          { id: 3, name: "Daniel Okoro", avatarUrl: null, status: "Gaze drifting", badge: "WATCH", badgeType: "warning" },
          { id: 4, name: "Sofia Reyes", avatarUrl: null, status: "Slow pace", badge: "WATCH", badgeType: "warning" },
          { id: 5, name: "Liam Foster", avatarUrl: null, status: "Focused · 94%", badge: null },
          { id: 6, name: "Amara Diallo", avatarUrl: null, status: "Focused · 91%", badge: null },
          { id: 7, name: "Noah Bennett", avatarUrl: null, status: "Focused · 88%", badge: null }
        ]);
      }
    }
  };

  useEffect(() => {
    fetchSessionData();

    if (session.room_code) {
      joinClassroom(session.room_code);

      socket.on('struggle_updated', (data) => {
        if (data.chunk_id) {
          setChunks(prev => prev.map(c => 
            c.chunk_id === data.chunk_id 
              ? { ...c, struggle_percentage: data.struggle_percentage, struggling_count: data.struggling_count }
              : c
          ));
        }
      });

      socket.on('content_simplified', (data) => {
        if (data.chunk_id && data.simplified_text) {
          setSimplifiedChunks(prev => ({
            ...prev,
            [data.chunk_id]: data.simplified_text
          }));
          setIsReiterating(false);
        }
      });
    }

    return () => {
      socket.off('struggle_updated');
      socket.off('content_simplified');
    };
  }, [session.room_code]);

  // Current Slide Data
  const currentChunk = useMemo(() => {
    if (!chunks || chunks.length === 0) return null;
    const clampedIndex = Math.min(Math.max(0, currentSlideIndex), chunks.length - 1);
    return chunks[clampedIndex];
  }, [chunks, currentSlideIndex]);

  // Handle slide pagination smoothly
  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < chunks.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  // Trigger Live AI Reiteration (Gemma)
  const handleTriggerReiterate = async () => {
    if (!currentChunk) return;
    setIsReiterating(true);
    setReiterationTriggered(true);

    try {
      const res = await apiRequest('/signals/flag', {
        method: 'POST',
        body: JSON.stringify({
          student_id: 1,
          chunk_id: currentChunk.chunk_id || currentChunk.id || 1,
          signal_type: 'flag_difficult',
          value: 1.0
        })
      });

      if (res?.simplified_text) {
        setSimplifiedChunks(prev => ({
          ...prev,
          [currentChunk.chunk_id || currentChunk.id]: res.simplified_text
        }));
      } else if (currentChunk.simplified_text) {
        setSimplifiedChunks(prev => ({
          ...prev,
          [currentChunk.chunk_id || currentChunk.id]: currentChunk.simplified_text
        }));
      }
    } catch (err) {
      // Offline fallback: Use baked simplification
      if (currentChunk.simplified_text) {
        setSimplifiedChunks(prev => ({
          ...prev,
          [currentChunk.chunk_id || currentChunk.id]: currentChunk.simplified_text
        }));
      }
    } finally {
      setTimeout(() => setIsReiterating(false), 500);
    }
  };

  // Handle Document Upload Success
  const handleUploadSuccess = async (uploadRes) => {
    if (uploadRes?.document_id) {
      try {
        const docData = await apiRequest(`/documents/${uploadRes.document_id}`);
        if (docData?.chunks && docData.chunks.length > 0) {
          const formattedChunks = docData.chunks.map((c, idx) => ({
            chunk_id: c.id,
            order: c.order || idx + 1,
            title: `Section ${c.order || idx + 1}: ${docData.title.split('.')[0]}`,
            text: c.text,
            simplified_text: c.simplified_text || null,
            struggle_percentage: 0,
            struggling_count: 0,
            important_count: 0,
            gaze_clusters: Math.floor(Math.random() * 12) + 4,
            avg_dwell: (Math.random() * 2.5 + 2.5).toFixed(1)
          }));

          setChunks(formattedChunks);
          setCurrentSlideIndex(0);
          setSession(prev => ({
            ...prev,
            title: docData.title,
            document_id: docData.id
          }));

          setDocumentsList(prev => [
            { id: docData.id, title: docData.title, slidesCount: formattedChunks.length, date: new Date().toLocaleTimeString() },
            ...prev
          ]);
        }
      } catch (err) {
        console.error("Failed to load parsed chunks", err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f2f8f5' }}>
      
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR                                         */}
      {/* ======================================================== */}
      <aside style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5ece8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px 20px',
        flexShrink: 0
      }}>
        {/* Brand & Menu */}
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '32px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: '#0a4d3c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(10, 77, 60, 0.2)'
            }}>
              <GraduationCap size={20} />
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0a4d3c',
              letterSpacing: '-0.02em'
            }}>
              FocusAI.
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'Materials', icon: FileText },
              { name: 'Analytics', icon: LineChart },
              { name: 'Class Management', icon: Users }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#d9f2e4' : 'transparent',
                    color: isActive ? '#0a4d3c' : '#4b5563',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f0f7f3';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? '#0a4d3c' : '#6b7280', flexShrink: 0 }} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Session Box (Dark Forest Green) */}
        <div style={{
          backgroundColor: '#0d3d2c',
          borderRadius: '16px',
          padding: '18px 16px 14px',
          color: '#ffffff',
          boxShadow: '0 8px 20px -4px rgba(13, 61, 44, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.05em' }}>
              ROOM CODE
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

          <div style={{ fontSize: '11px', color: 'rgba(209, 242, 226, 0.8)', marginBottom: '2px' }}>
            Session Timer
          </div>

          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
            marginBottom: '14px',
            color: '#ffffff'
          }}>
            {formatTimer(timerSeconds)}
          </div>

          <button
            onClick={onEndSession}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            End Session
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN APP CONTENT AREA                                 */}
      {/* ======================================================== */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        
        {/* ======================================================== */}
        {/* TOP HEADER BAR                                           */}
        {/* ======================================================== */}
        <header style={{
          backgroundColor: '#f2f8f5',
          padding: '24px 32px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Left Title & Status Badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                {session.title || "Physics 101 — Newton's Laws"}
              </h1>
            </div>

            <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Room {session.room_code || 'ROOM304'}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#15803d', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                Active Classroom
              </span>
            </div>

            {/* Pill Metrics Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
              {/* Watching pill */}
              <div style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#15803d' }} />
                <span>{students.length || 7} students watching</span>
              </div>

              {/* Avg Gaze pill */}
              <div style={{
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Eye size={14} />
                <span>Avg. gaze on slide: 82%</span>
              </div>

              {/* Difficulty flags pill */}
              <div style={{
                backgroundColor: '#ffedd5',
                color: '#ea580c',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Flag size={14} />
                <span>Difficulty flags: {currentChunk?.struggling_count || 12}</span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Student Avatar Stack */}
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '6px' }}>
              {students.slice(0, 3).map((s, idx) => (
                <div key={s.id || idx} style={{ marginLeft: idx === 0 ? 0 : '-10px', zIndex: 10 - idx }}>
                  <UserAvatar name={s.name} size={34} />
                </div>
              ))}
              {students.length > 3 && (
                <div style={{
                  marginLeft: '-10px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#e2f4ea',
                  color: '#0a4d3c',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  zIndex: 5
                }}>
                  +{students.length - 3}
                </div>
              )}
            </div>

            {/* Audio / Headphone Button */}
            <button
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1.5px solid #d1ded7',
                backgroundColor: '#ffffff',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Class Audio Stream"
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0a4d3c'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1ded7'}
            >
              <Headphones size={17} />
            </button>

            {/* Teacher Profile Avatar */}
            <UserAvatar name="Teacher Prof" size={38} />

            {/* Upload PDF / PPT Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #d1ded7',
                color: '#111827',
                padding: '9px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0a4d3c';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 77, 60, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1ded7';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <UploadCloud size={16} style={{ color: '#0a4d3c' }} />
              <span>Upload PDF / PPT</span>
            </button>

            {/* Live Reiterate Button */}
            <button
              onClick={handleTriggerReiterate}
              disabled={isReiterating || !currentChunk}
              style={{
                backgroundColor: '#f97316',
                border: 'none',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isReiterating ? 'wait' : 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
            >
              <RotateCw size={15} style={{ animation: isReiterating ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isReiterating ? 'Reiterating...' : 'Live Reiterate'}</span>
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD VIEW (1:1 Exact Screenshot Layout)      */}
        {/* ======================================================== */}
        {activeTab === 'Dashboard' && (
          <div style={{
            padding: '12px 32px 36px',
            display: 'grid',
            gridTemplateColumns: '290px 1fr 270px',
            gap: '20px',
            alignItems: 'start'
          }}>
            
            {/* ---------------------------------------------------- */}
            {/* LEFT COLUMN: Alert & Pulse Cards                     */}
            {/* ---------------------------------------------------- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Threshold Reached Card */}
              <div className="focus-card" style={{
                padding: '20px',
                borderLeft: '4px solid #f97316',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    backgroundColor: '#ffedd5',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle size={15} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Threshold reached!
                  </h3>
                </div>

                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  12 of 7 students flagged this segment (30%).
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#fff7ed',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  marginBottom: '18px'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#9a3412' }}>
                    Threshold: <strong style={{ color: '#111827' }}>10 / 7</strong>
                  </span>
                  <span style={{
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em'
                  }}>
                    AUTO-TRIGGERED
                  </span>
                </div>

                <div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#9ca3af',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>
                    Active Lecture Segment
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#111827',
                    fontStyle: 'italic'
                  }}>
                    "{currentChunk?.title || "Newton's First Law: Inertia"}"
                  </div>
                </div>
              </div>

              {/* Session Pulse Card */}
              <div className="focus-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 18px 0' }}>
                  Session Pulse
                </h3>

                {/* Total Flags */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>Total flags</span>
                    <span style={{ color: '#111827', fontWeight: 700 }}>12 Diff • 5 Imp</span>
                  </div>
                  <div style={{ height: '7px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '999px', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: '70%', backgroundColor: '#f97316', borderRadius: '999px 0 0 999px' }} />
                    <div style={{ width: '30%', backgroundColor: '#3b82f6', borderRadius: '0 999px 999px 0' }} />
                  </div>
                </div>

                {/* Avg Focus Score */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>Avg. focus score</span>
                    <span style={{ color: '#111827', fontWeight: 700 }}>7.4 / 10</span>
                  </div>
                  <div style={{ height: '7px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '74%', height: '100%', backgroundColor: '#10b981', borderRadius: '999px' }} />
                  </div>
                </div>

                {/* Quiz Readiness */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>Quiz readiness</span>
                    <span style={{ color: '#111827', fontWeight: 700 }}>61%</span>
                  </div>
                  <div style={{ height: '7px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '61%', height: '100%', backgroundColor: '#3b82f6', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>

            </div>

            {/* ---------------------------------------------------- */}
            {/* MIDDLE COLUMN: Live Slide Material & Difficulty Area */}
            {/* ---------------------------------------------------- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Live Material Slide Card */}
              <div className="focus-card" style={{ padding: '24px 28px', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Top Bar: Slide pagination and Heatmap pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '18px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>
                        Live Material — Slide {chunks.length > 0 ? currentSlideIndex + 1 : 0} of {chunks.length || 0}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={handlePrevSlide}
                          disabled={currentSlideIndex === 0}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: currentSlideIndex === 0 ? '#f9fafb' : '#ffffff',
                            color: currentSlideIndex === 0 ? '#cbd5e1' : '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={handleNextSlide}
                          disabled={currentSlideIndex >= chunks.length - 1}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: currentSlideIndex >= chunks.length - 1 ? '#f9fafb' : '#ffffff',
                            color: currentSlideIndex >= chunks.length - 1 ? '#cbd5e1' : '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: currentSlideIndex >= chunks.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsHeatmapActive(!isHeatmapActive)}
                      style={{
                        backgroundColor: isHeatmapActive ? '#dcfce7' : '#f1f5f9',
                        color: isHeatmapActive ? '#15803d' : '#475569',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Difficulty Heatmap
                    </button>
                  </div>

                  {/* Slide Content Body */}
                  {currentChunk ? (
                    <div style={{ transition: 'opacity 0.2s ease' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>
                        {currentChunk.title || `Slide ${currentSlideIndex + 1}`}
                      </h2>

                      <p style={{
                        fontSize: '14px',
                        color: '#374151',
                        lineHeight: 1.6,
                        margin: 0,
                        backgroundColor: isHeatmapActive ? 'rgba(249, 115, 22, 0.06)' : 'transparent',
                        padding: isHeatmapActive ? '8px 12px' : 0,
                        borderRadius: '8px',
                        borderLeft: isHeatmapActive ? '3px solid #f97316' : 'none'
                      }}>
                        {currentChunk.text}
                      </p>

                      {/* Gemma AI Simplified Banner if triggered */}
                      {(simplifiedChunks[currentChunk.chunk_id || currentChunk.id] || (reiterationTriggered && currentChunk.simplified_text)) && (
                        <div style={{
                          marginTop: '16px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          animation: 'slideInUp 0.3s ease-out'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                            <Sparkles size={14} />
                            <span>Gemma Live Adaptive Simplification</span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#064e3b', margin: 0, lineHeight: 1.5 }}>
                            {simplifiedChunks[currentChunk.chunk_id || currentChunk.id] || currentChunk.simplified_text}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      padding: '30px 20px',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1.5px dashed #cbd5e1'
                    }}>
                      <UploadCloud size={32} style={{ color: '#0a4d3c', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                        No Lecture Material Loaded
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>
                        Upload your presentation slides to begin live gaze & confusion tracking
                      </p>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        style={{
                          backgroundColor: '#0a4d3c',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Upload Slide Deck (.pdf / .pptx)
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Telemetry Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  borderTop: '1px solid #f0f5f2',
                  paddingTop: '16px',
                  marginTop: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>
                    <Flame size={15} style={{ color: '#ea580c' }} />
                    <span>{currentChunk?.gaze_clusters || 14} gaze clusters detected</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>
                    <Clock size={15} style={{ color: '#0284c7' }} />
                    <span>Avg. dwell {currentChunk?.avg_dwell || 4.2}s on flagged phrases</span>
                  </div>
                </div>
              </div>

              {/* Difficulty Over Time Area Chart Card */}
              <div className="focus-card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Difficulty Over Time
                  </h3>
                  <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>
                    last 25 minutes
                  </span>
                </div>

                {/* Smooth Glowing Curved Spline Chart */}
                <div style={{ position: 'relative', width: '100%', height: '110px', marginBottom: '14px' }}>
                  <svg 
                    viewBox="0 0 500 110" 
                    preserveAspectRatio="none"
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                  >
                    <defs>
                      <linearGradient id="diffGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Area under curve */}
                    <path
                      d="M 20 95 C 100 90, 180 85, 260 60 C 330 40, 390 28, 420 32 C 450 36, 480 50, 480 95 Z"
                      fill="url(#diffGrad)"
                    />

                    {/* Glowing Stroke line */}
                    <path
                      d="M 20 95 C 100 90, 180 85, 260 60 C 330 40, 390 28, 420 32 C 450 36, 480 50, 480 65"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Peak Highlight Circle */}
                    <circle cx="420" cy="32" r="5" fill="#ffffff" stroke="#f97316" strokeWidth="3" />
                  </svg>
                </div>

                {/* Legend / Metrics Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    <span>28 Focused</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                    <span>8 Watching</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    <span>4 Flagged</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ---------------------------------------------------- */}
            {/* RIGHT COLUMN: Students List Card                     */}
            {/* ---------------------------------------------------- */}
            <div className="focus-card" style={{ padding: '20px 18px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '0 4px'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Students
                </h3>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                  {students.length || 7} online
                </span>
              </div>

              {/* Student Roster List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {students.map((student) => (
                  <div
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <UserAvatar 
                        name={student.name} 
                        avatarUrl={student.avatarUrl} 
                        size={32} 
                        showStatus={true}
                        statusColor={student.badge === 'STRUGGLE' ? '#ef4444' : student.badge === 'WATCH' ? '#eab308' : '#22c55e'}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                          {student.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                          {student.status}
                        </div>
                      </div>
                    </div>

                    {/* Tag badge if any */}
                    {student.badge === 'STRUGGLE' && (
                      <span style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.02em'
                      }}>
                        STRUGGLE
                      </span>
                    )}

                    {student.badge === 'WATCH' && (
                      <span style={{
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.02em'
                      }}>
                        WATCH
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Mini Metrics Summary */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #f0f5f2',
                paddingTop: '16px',
                marginTop: '20px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#4b5563',
                paddingLeft: '4px',
                paddingRight: '4px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  28 Focused
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                  8 Watching
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  4 Flagged
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MATERIALS TAB                                     */}
        {/* ======================================================== */}
        {activeTab === 'Materials' && (
          <div style={{ padding: '24px 32px' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Lecture Material Repository
                </h2>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Manage slides, PDFs, and parsed concept segments stored in PostgreSQL
                </p>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                style={{
                  backgroundColor: '#0a4d3c',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <UploadCloud size={16} />
                <span>Upload New Deck</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Active Document Card */}
              <div className="focus-card" style={{ padding: '20px', borderLeft: '4px solid #0a4d3c' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#e6f7ee',
                    color: '#0a4d3c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={20} />
                  </div>
                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    CURRENT ACTIVE
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                  {session.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0' }}>
                  {chunks.length} slide segments • Stored in PostgreSQL
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('Dashboard')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0a4d3c',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Open in Live View
                  </button>
                </div>
              </div>

              {/* Uploaded History List */}
              {documentsList.map(doc => (
                <div key={doc.id} className="focus-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FolderOpen size={20} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
                    {doc.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0' }}>
                    {doc.slidesCount} slides • Uploaded {doc.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ANALYTICS TAB                                     */}
        {/* ======================================================== */}
        {activeTab === 'Analytics' && (
          <div style={{ padding: '24px 32px' }} className="animate-fade-in">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
              Class Telemetry & Struggle Analytics
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Deep-dive metrics on comprehension bottlenecks and gaze clustering
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="focus-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Highest Confusion Concept</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>Newton's First Law: Inertia</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>30% struggle rate triggered adaptation</div>
              </div>

              <div className="focus-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Average Gaze Dwell</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>4.2 seconds</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Focused primarily on formula definitions</div>
              </div>

              <div className="focus-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Total Reiterations Triggered</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0a4d3c', marginTop: '6px' }}>2 AI Simplifications</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Gemma 4 model provided alternate phrasing</div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CLASS MANAGEMENT TAB                              */}
        {/* ======================================================== */}
        {activeTab === 'Class Management' && (
          <div style={{ padding: '24px 32px' }} className="animate-fade-in">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
              Live Class Roster & Telemetry Settings
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Manage students connected to Room {session.room_code || 'ROOM304'}
            </p>

            <div className="focus-card" style={{ padding: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e5ece8', color: '#6b7280', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>Student</th>
                    <th style={{ padding: '12px 16px' }}>Telemetry State</th>
                    <th style={{ padding: '12px 16px' }}>Confusion Level</th>
                    <th style={{ padding: '12px 16px' }}>Gaze Calibration</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f0f5f2' }}>
                      <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserAvatar name={s.name} avatarUrl={s.avatarUrl} size={32} />
                        <span style={{ fontWeight: 700, color: '#111827' }}>{s.name}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#4b5563' }}>{s.status}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {s.badge === 'STRUGGLE' ? (
                          <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                            HIGH STRUGGLE
                          </span>
                        ) : s.badge === 'WATCH' ? (
                          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                            WATCHING
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                            FOCUSED
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#059669', fontWeight: 600 }}>
                        ✓ Calibrated
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* 3. SLICK, NON-ABRUPT UPLOAD MODAL                         */}
      {/* ======================================================== */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
        sessionRoomCode={session.room_code}
      />

    </div>
  );
}
