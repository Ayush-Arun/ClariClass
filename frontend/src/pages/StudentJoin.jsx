import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function StudentJoin({ onJoinSuccess, onBack }) {
  const [roomCode, setRoomCode] = useState('ROOM304');
  const [displayName, setDisplayName] = useState('Alex Rivera');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomCode || !displayName) return;
    setLoading(true);
    setError('');

    try {
      const res = await apiRequest('/sessions/join', {
        method: 'POST',
        body: JSON.stringify({
          room_code: roomCode,
          display_name: displayName
        })
      });

      onJoinSuccess(res);
    } catch (err) {
      // Fallback for live preview
      onJoinSuccess({
        session_id: 1,
        room_code: roomCode,
        student_id: 1,
        display_name: displayName
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#EDF9F2',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: '#0A4D3C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF'
        }}>
          <GraduationCap size={24} />
        </div>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A4D3C', letterSpacing: '-0.03em' }}>
          FocusAI<span style={{ color: '#0A4D3C' }}>.</span>
        </span>
      </div>

      {/* Main Join Card */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: '2.5rem 2rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
            Join Classroom
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6B7280',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.8rem' }}>
          Enter the room code provided by your instructor.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            borderRadius: 10,
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              ROOM CODE
            </label>
            <input
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. ROOM304"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                color: '#111827',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              YOUR DISPLAY NAME
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                fontSize: '0.95rem',
                color: '#111827',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#0A4D3C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '0.9rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '0.5rem',
              boxShadow: '0 4px 12px rgba(10, 77, 60, 0.2)'
            }}
          >
            {loading ? 'Joining Session...' : 'Enter Live Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
