import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import { Mail, GraduationCap } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('teacher'); // 'teacher' | 'student'
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email, role, name: email.split('@')[0] })
      });
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to send login code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otpCode) return;
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp_code: otpCode })
      });
      localStorage.setItem('clariclass_token', res.access_token);
      localStorage.setItem('clariclass_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Invalid login code.');
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
          {step === 'request' ? 'WelcomeBack' : 'Enter Login Code'}
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.8rem', lineHeight: '1.4' }}>
          {step === 'request'
            ? 'Enter your email to receive a secure login code.'
            : `Enter the 6-digit code dispatched to ${email}`}
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            borderRadius: 10,
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {devOtp && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#D1F2E2',
            color: '#0A4D3C',
            borderRadius: 10,
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 600
          }}>
            Dev Mode Code: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', marginLeft: '0.25rem' }}>{devOtp}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp}>
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
                transition: 'background 0.2s ease'
              }}
            >
              {loading ? 'Sending Code...' : 'Send Login Code'}
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
                onClick={() => { setEmail('teacher@university.edu'); }}
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
                onClick={() => { setEmail('student@university.edu'); }}
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
        ) : (
          <form onSubmit={handleVerifyOtp}>
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
                6-DIGIT VERIFICATION CODE
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  textAlign: 'center',
                  letterSpacing: '0.3em',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
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
                cursor: 'pointer'
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6B7280',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back to change email
            </button>
          </form>
        )}
      </div>

      {/* Role Pill Switcher (Bottom of Login) */}
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
            backgroundColor: role === 'teacher' ? '#F3F4F6' : 'transparent',
            color: role === 'teacher' ? '#111827' : '#6B7280'
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
            backgroundColor: role === 'student' ? '#F3F4F6' : 'transparent',
            color: role === 'student' ? '#111827' : '#6B7280'
          }}
        >
          Student
        </button>
      </div>
    </div>
  );
}
