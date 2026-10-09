import React, { useState } from 'react';
import { apiRequest } from '../api/client';

export default function StudentJoin({ onJoinSuccess }) {
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
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
      setError(err.message || 'Unable to join session. Verify your room code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: '4rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          Join Classroom Session
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Enter the 6-character room code provided by your instructor.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--accent-danger)',
            color: '#FCA5A5',
            borderRadius: 6,
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Room Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 7K9X2B"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '0.75rem',
                letterSpacing: '0.25em',
                textAlign: 'center',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-mono)',
                borderRadius: 6,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#fff'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Your Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Lee"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 6,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#fff'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.85rem',
              borderRadius: 6,
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Joining Room...' : 'Enter Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
