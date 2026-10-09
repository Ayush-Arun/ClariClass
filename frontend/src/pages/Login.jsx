import React, { useState } from 'react';
import { Mail, GraduationCap } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('teacher'); // 'teacher' | 'student'

  const handleLogin = (e) => {
    e?.preventDefault();
    const userEmail = email.trim() || (role === 'teacher' ? 'prof.harrison@university.edu' : 'alex.rivera@university.edu');
    
    const userObj = {
      email: userEmail,
      name: userEmail.split('@')[0],
      role: role
    };

    localStorage.setItem('clariclass_user', JSON.stringify(userObj));
    localStorage.setItem('clariclass_token', 'mock_dev_token');
    onLoginSuccess(userObj);
  };

  const handleSocialLogin = (provider) => {
    const userEmail = role === 'teacher' ? `teacher@${provider.toLowerCase()}.edu` : `student@${provider.toLowerCase()}.edu`;
    const userObj = {
      email: userEmail,
      name: userEmail.split('@')[0],
      role: role
    };
    localStorage.setItem('clariclass_user', JSON.stringify(userObj));
    localStorage.setItem('clariclass_token', 'mock_dev_token');
    onLoginSuccess(userObj);
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

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: '2.5rem 2rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          WelcomeBack
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.8rem', lineHeight: '1.4' }}>
          Enter your email to receive a secure login code.
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#6B7280',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}>
              INSTITUTIONAL EMAIL
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: '0 0.85rem'
            }}>
              <Mail size={18} color="#9CA3AF" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                style={{
                  width: '100%',
                  padding: '0.85rem 0.75rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#111827'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
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
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 12px rgba(10, 77, 60, 0.2)'
            }}
          >
            Send Login Code
          </button>

          {/* Social Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0 1.25rem',
            color: '#9CA3AF',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }}></div>
            <span style={{ padding: '0 0.75rem' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }}></div>
          </div>

          {/* Social Logins */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span style={{ fontWeight: 800, color: '#EA4335' }}>G</span> Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('Microsoft')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span style={{ color: '#00A4EF', fontWeight: 800 }}>⊞</span> Microsoft
            </button>
          </div>
        </form>
      </div>

      {/* Role Pill Switcher (Teacher / Student) */}
      <div style={{
        marginTop: '1.5rem',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: '0.3rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)'
      }}>
        <button
          type="button"
          onClick={() => setRole('teacher')}
          style={{
            padding: '0.45rem 1.5rem',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: role === 'teacher' ? '#E8F7EE' : 'transparent',
            color: role === 'teacher' ? '#0A4D3C' : '#6B7280'
          }}
        >
          Teacher
        </button>

        <button
          type="button"
          onClick={() => setRole('student')}
          style={{
            padding: '0.45rem 1.5rem',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: role === 'student' ? '#E8F7EE' : 'transparent',
            color: role === 'student' ? '#0A4D3C' : '#6B7280'
          }}
        >
          Student
        </button>
      </div>
    </div>
  );
}
