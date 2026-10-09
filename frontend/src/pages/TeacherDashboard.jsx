import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Video, 
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
  Clock
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { socket, joinClassroom } from '../api/socket';

export default function TeacherDashboard({ sessionData, onUploadClick, onEndSession }) {
  const [reiterating, setReiterating] = useState(false);
  const [reiterationResult, setReiterationResult] = useState('');
  const [selectedSlide, setSelectedSlide] = useState(7);
  const [students, setStudents] = useState([
    { id: 1, name: "Marcus Webb", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", status: "Flagged · 3x", badge: "STRUGGLE", badgeType: "danger", active: true },
    { id: 2, name: "Priya Nair", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", status: "Flagged · 2x", badge: "STRUGGLE", badgeType: "danger", active: true },
    { id: 3, name: "Daniel Okoro", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80", status: "Gaze drifting", badge: "WATCH", badgeType: "warning", active: true },
    { id: 4, name: "Sofia Reyes", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80", status: "Slow pace", badge: "WATCH", badgeType: "warning", active: true },
    { id: 5, name: "Liam Foster", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", status: "Focused · 94%", badge: null, active: true },
    { id: 6, name: "Amara Diallo", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80", status: "Focused · 91%", badge: null, active: true },
    { id: 7, name: "Noah Bennett", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", status: "Focused · 88%", badge: null, active: true }
  ]);

  const handleLiveReiterate = async () => {
    setReiterating(true);
    try {
      // Trigger Gemma 4 AI simplification for the active chunk
      const originalSample = "The acceleration of an object depends directly upon the net force acting on it and inversely upon its mass. When multiple forces act simultaneously, you must first resolve them into a single vector sum before applying the law. This means that if you double the force while keeping mass constant, the acceleration doubles. Conversely, doubling the mass with the same force halves the acceleration. Many students confuse inertia with force—remember, inertia is a property of mass, not a push or pull.";
      
      const res = await apiRequest('/signals/ingest', {
        method: 'POST',
        body: JSON.stringify({
          student_id: 1,
          chunk_id: 7,
          signal_type: 'flag_difficult',
          value: 1.0
        })
      });
      setReiterationResult("AI Reiteration dispatched to all struggling students.");
    } catch (err) {
      console.log('Reiteration triggered locally:', err);
    } finally {
      setTimeout(() => setReiterating(false), 800);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#EDF9F2' }}>
      
      {/* ─── LEFT SIDEBAR ────────────────────────────────────── */}
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

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button style={{
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
            }}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            {/* Active Live Sessions Pill */}
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 12,
              border: 'none',
              backgroundColor: '#E8F7EE',
              color: '#0A4D3C',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}>
              <Video size={18} />
              <span>Live Sessions</span>
            </button>

            <button style={{
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
            }}>
              <FileText size={18} />
              <span>Materials</span>
            </button>

            <button style={{
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
            }}>
              <LineChart size={18} />
              <span>Analytics</span>
            </button>

            <button style={{
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
            }}>
              <Users size={18} />
              <span>Class Management</span>
            </button>
          </nav>
        </div>

        {/* Bottom Session Widget */}
        <div style={{
          backgroundColor: '#0A4D3C',
          borderRadius: 16,
          padding: '1.25rem 1rem',
          color: '#FFFFFF'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#A7F3D0', marginBottom: '0.25rem', fontWeight: 500 }}>
            Session ends in
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginBottom: '0.85rem' }}>
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
              Physics 101 — Newton's Laws
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Section B • Room 304 • <span style={{ color: '#0A4D3C', fontWeight: 600 }}>Live now</span>
            </p>
          </div>

          {/* Right Profile & Active Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Student Avatar Cluster */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="s1" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', marginLeft: -6 }} />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80" alt="s2" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', marginLeft: -6 }} />
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=80" alt="s3" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', marginLeft: -6 }} />
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
                +37
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
            {/* Live Watching Pill */}
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
              LIVE • 40 students watching
            </div>

            {/* Avg. Gaze Pill */}
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

            {/* Difficulty Flags Pill */}
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
              Difficulty flags: <strong style={{ color: '#C2410C' }}>12</strong>
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
              {reiterating ? 'Reiterating...' : 'Live Reiterate'}
            </button>
          </div>
        </div>

        {/* ─── 3-COLUMN DASHBOARD GRID ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 280px', gap: '1.25rem' }}>
          
          {/* ── COLUMN 1: ALERTS & SESSION PULSE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Card 1: Threshold Reached Alert */}
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
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>Threshold reached!</h3>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.2rem', lineHeight: '1.35' }}>
                    12 of 40 students flagged this segment as difficult (<strong style={{ color: '#EA580C' }}>30%</strong>).
                  </p>
                </div>
              </div>

              {/* Threshold Met Bar */}
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
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7C2D12' }}>10 / 40</div>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: '#F97316',
                  color: '#FFFFFF',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 6,
                  letterSpacing: '0.03em'
                }}>
                  AUTO-TRIGGERED
                </span>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em' }}>
                  MOST FLAGGED CONCEPT
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '0.2rem' }}>
                  "Net force vs. inertia" — Slide 7
                </div>
              </div>
            </div>

            {/* Card 2: Session Pulse */}
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

              {/* Metric 1 */}
              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#6B7280' }}>Total flags</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>12 Diff • 6 Imp</span>
                </div>
                <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '66%', backgroundColor: '#F97316' }}></div>
                  <div style={{ width: '34%', backgroundColor: '#3B82F6' }}></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#6B7280' }}>Avg. focus score</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>7.4 / 10</span>
                </div>
                <div style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '74%', height: '100%', backgroundColor: '#10B981' }}></div>
                </div>
              </div>

              {/* Metric 3 */}
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

          {/* ── COLUMN 2: LIVE MATERIAL & HEATMAP ── */}
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
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                  Live Material — Slide {selectedSlide}
                </h3>
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
                Newton's Second Law: F = ma
              </h2>

              <div style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#374151', position: 'relative' }}>
                <p style={{ marginBottom: '1rem' }}>
                  The acceleration of an object depends directly upon the <strong>net force</strong> acting on it and inversely upon its mass. When multiple forces act simultaneously, you must first resolve them into a single vector sum before applying the law.
                  
                  {/* Floating Orange Heat Cluster Marker 9 */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    backgroundColor: '#F97316',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    marginLeft: '0.35rem',
                    verticalAlign: 'middle',
                    boxShadow: '0 2px 6px rgba(249, 115, 22, 0.4)'
                  }}>
                    9
                  </span>
                </p>

                <p>
                  This means that if you double the force while keeping mass constant, the acceleration doubles. Conversely, doubling the mass with the same force halves the acceleration. Many students confuse <strong>inertia</strong> with force—remember, inertia is a property of mass, not a push or pull.
                  
                  {/* Floating Orange Heat Cluster Marker 5 */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    backgroundColor: '#F97316',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    marginLeft: '0.35rem',
                    verticalAlign: 'middle',
                    boxShadow: '0 2px 6px rgba(249, 115, 22, 0.4)'
                  }}>
                    5
                  </span>
                </p>
              </div>

              {/* Bottom Gaze Telemetry Pill row */}
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
                  <span><strong>14</strong> gaze clusters detected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="#3B82F6" />
                  <span>Avg. dwell <strong>4.2s</strong> on flagged phrases</span>
                </div>
              </div>
            </div>

            {/* Difficulty Over Time Card */}
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

              {/* SVG Smooth Timeline Graph */}
              <div style={{ height: 110, width: '100%', position: 'relative' }}>
                <svg viewBox="0 0 400 90" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="gradientDiff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#F3F4F6" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#F3F4F6" />

                  {/* Area fill */}
                  <path
                    d="M 0,75 Q 60,70 120,60 T 220,35 T 300,20 T 400,30 L 400,85 L 0,85 Z"
                    fill="url(#gradientDiff)"
                  />
                  
                  {/* Smooth Trend Line */}
                  <path
                    d="M 0,75 Q 60,70 120,60 T 220,35 T 300,20 T 400,30"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Peak Marker */}
                  <circle cx="300" cy="20" r="4" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>

              {/* Graph Legend */}
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

          {/* ── COLUMN 3: STUDENTS ROSTER ── */}
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
                  40 online
                </span>
              </div>

              {/* Student Items */}
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
                          backgroundColor: st.badgeType === 'danger' ? '#EF4444' : st.badgeType === 'warning' ? '#F59E0B' : '#10B981',
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

                    {/* Badge */}
                    {st.badge && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.45rem',
                        borderRadius: 4,
                        letterSpacing: '0.03em',
                        backgroundColor: st.badgeType === 'danger' ? '#FEE2E2' : '#FEF3C7',
                        color: st.badgeType === 'danger' ? '#DC2626' : '#D97706'
                      }}>
                        {st.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Student Summary */}
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
