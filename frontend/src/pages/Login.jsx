import React, { useState } from 'react';
import { apiRequest } from '../api/client';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('teacher');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email, role, name })
      });
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
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
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: '4rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          {step === 'request' ? 'Sign In with OTP' : 'Enter Verification Code'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          {step === 'request'
            ? 'Passwordless access via instant email verification.'
            : `We sent a 6-digit code to ${email}`}
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

        {devOtp && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-success)',
            color: '#6EE7B7',
            borderRadius: 6,
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            <strong>Dev Mode Active:</strong> Your test OTP code is <code>{devOtp}</code>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@institution.edu"
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

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prof. Alex Smith"
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

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 6,
                  background: '#131B2A',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff'
                }}
              >
                <option value="teacher">Teacher / Instructor</option>
                <option value="student">Student</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: 6,
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                6-Digit OTP Code
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
                  padding: '0.75rem',
                  letterSpacing: '0.3em',
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

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: 6,
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {loading ? 'Verifying...' : 'Verify Code & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Back to change email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
