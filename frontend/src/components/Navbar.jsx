import React from 'react';

export default function Navbar({ activePage, setActivePage, user, onLogout }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 23, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActivePage('home')}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: '#fff'
        }}>C</div>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>ClariClass</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => setActivePage('student-join')} 
          style={{
            background: activePage === 'student-join' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: 'var(--text-primary)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Join Session
        </button>

        <button 
          onClick={() => setActivePage('teacher-upload')} 
          style={{
            background: activePage === 'teacher-upload' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: 'var(--text-primary)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Teacher Upload
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</span>
            <button 
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--accent-danger)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.4rem 0.8rem',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setActivePage('login')}
            style={{
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign In with OTP
          </button>
        )}
      </div>
    </nav>
  );
}
