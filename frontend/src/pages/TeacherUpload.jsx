import React, { useState } from 'react';
import { apiRequest } from '../api/client';

export default function TeacherUpload({ onSessionCreated }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [threshold, setThreshold] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUploadAndCreate = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);

      // Step 1: Upload document
      const docRes = await apiRequest('/documents/upload', {
        method: 'POST',
        body: formData
      });

      // Step 2: Create session
      const sessionRes = await apiRequest('/sessions/create', {
        method: 'POST',
        body: JSON.stringify({
          document_id: docRes.document_id,
          struggle_threshold_percent: parseFloat(threshold)
        })
      });

      onSessionCreated(sessionRes);
    } catch (err) {
      setError(err.message || 'Failed to upload document or create session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '3rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Upload Lecture Material</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Upload your PDF slide deck or PPTX. ClariClass will parse it into adaptive learning chunks.
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

        <form onSubmit={handleUploadAndCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Lecture / Document Title
            </label>
            <input
              type="text"
              placeholder="e.g. Lecture 4: Distributed Consensus & Paxos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              PDF or PPTX File
            </label>
            <input
              type="file"
              accept=".pdf,.pptx,.ppt"
              required
              onChange={(e) => setFile(e.target.files[0])}
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
              Struggle Trigger Threshold ({threshold}%)
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              When ≥ {threshold}% of active students flag or linger on a section, Gemma AI will simplify it live.
            </span>
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
            {loading ? 'Processing Document...' : 'Launch Live Classroom Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
