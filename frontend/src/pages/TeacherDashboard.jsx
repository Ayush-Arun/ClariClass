import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { socket, joinClassroom } from '../api/socket';
import ClassHeatmap from '../components/ClassHeatmap';
import StudentTable from '../components/StudentTable';

export default function TeacherDashboard({ sessionData }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest(`/analytics/class/${sessionData.room_code}`);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load class analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    if (sessionData.room_code) {
      joinClassroom(sessionData.room_code);

      // Real-time struggle telemetry updates
      socket.on('struggle_updated', () => {
        fetchAnalytics();
      });
      socket.on('chunk_simplified', () => {
        fetchAnalytics();
      });
    }

    return () => {
      socket.off('struggle_updated');
      socket.off('chunk_simplified');
    };
  }, [sessionData]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading classroom analytics...</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1.5rem' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Instructor Real-Time Cockpit</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Room Code: <strong>{sessionData.room_code}</strong> | Document ID: {sessionData.document_id || 'Active'}
          </p>
        </div>

        <div style={{
          padding: '0.5rem 1rem',
          borderRadius: 8,
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--accent-success)',
          color: '#6EE7B7',
          fontWeight: 600
        }}>
          ● Live Session Active
        </div>
      </header>

      {analytics && (
        <>
          <ClassHeatmap chunks={analytics.chunks} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <StudentTable students={analytics.students} />

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>⭐ Key Highlights Flagged</h3>
              {analytics.highlights.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No highlights flagged yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analytics.highlights.map((h, i) => (
                    <div key={i} style={{
                      padding: '0.75rem',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: '3px solid var(--accent-warning)'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)' }}>{h.votes} Student Votes</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{h.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
