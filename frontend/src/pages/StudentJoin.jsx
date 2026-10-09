import React, { useState, useRef } from 'react';
import { apiRequest } from '../api/client';
import { GraduationCap, ArrowLeft, Camera, Sparkles, User, KeyRound, AlertCircle } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

export default function StudentJoin({ onJoinSuccess, onBack }) {
  const [roomCode, setRoomCode] = useState('ROOM304');
  const [displayName, setDisplayName] = useState('Alex Rivera');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomCode.trim() || !displayName.trim()) {
      setError('Please provide both room code and your full name.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await apiRequest('/sessions/join', {
        method: 'POST',
        body: JSON.stringify({
          room_code: roomCode.trim().toUpperCase(),
          display_name: displayName.trim()
        })
      });

      onJoinSuccess({
        ...res,
        avatar_url: avatarUrl
      });
    } catch (err) {
      // Fallback for demo / offline preview
      onJoinSuccess({
        session_id: 1,
        room_code: roomCode.trim().toUpperCase(),
        student_id: Math.floor(Math.random() * 1000) + 10,
        display_name: displayName.trim(),
        avatar_url: avatarUrl
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f2f8f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          backgroundColor: '#0a4d3c',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(10, 77, 60, 0.25)'
        }}>
          <GraduationCap size={22} />
        </div>
        <span style={{ fontSize: '24px', fontWeight: 800, color: '#0a4d3c', letterSpacing: '-0.02em' }}>
          FocusAI<span style={{ color: '#0a4d3c' }}>.</span>
        </span>
      </div>

      {/* Main Join Card */}
      <div className="focus-card" style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 20px 40px -8px rgba(10, 77, 60, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid #e5ece8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>
            Join Classroom Session
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6b7280',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}
        </div>

        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0' }}>
          Enter your name, optional photo, and the session room code from your teacher.
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Avatar Upload / Monogram Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f8fbf9', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e5ece8' }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar name={displayName || 'Student'} avatarUrl={avatarUrl} size={54} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#0a4d3c',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Upload custom photo"
              >
                <Camera size={12} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                Profile Image / Avatar
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                {avatarUrl ? 'Custom photo selected' : 'Auto-generated dynamic initials'}
              </div>
            </div>
          </div>

          {/* Display Name input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              FULL NAME / STUDENT ID
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Marcus Webb or Priya Nair"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: '12px',
                  border: '1.5px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0a4d3c'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <User size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#9ca3af' }} />
            </div>
          </div>

          {/* Room Code input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              CLASSROOM ROOM CODE
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. ROOM304"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: '12px',
                  border: '1.5px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  color: '#0a4d3c',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0a4d3c'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <KeyRound size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#9ca3af' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#0a4d3c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              marginTop: '8px',
              boxShadow: '0 4px 14px rgba(10, 77, 60, 0.25)',
              transition: 'all 0.18s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <span>Connecting Telemetry...</span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Enter Live Classroom</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
