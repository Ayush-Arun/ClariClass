import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { socket, joinClassroom } from '../api/socket';
import ChunkCard from '../components/ChunkCard';

export default function StudentView({ sessionData }) {
  const [chunks, setChunks] = useState(sessionData.chunks || []);
  const [simplifiedMap, setSimplifiedMap] = useState({});
  const [strugglingChunks, setStrugglingChunks] = useState(new Set());

  useEffect(() => {
    if (sessionData.room_code) {
      joinClassroom(sessionData.room_code);

      // Listen for AI simplification push
      socket.on('chunk_simplified', (data) => {
        const { chunk_id, simplified_text, struggling_student_ids } = data;
        
        // Push simplified text if this student struggled or if delivered globally
        if (struggling_student_ids.includes(sessionData.student_id) || true) {
          setSimplifiedMap((prev) => ({
            ...prev,
            [chunk_id]: simplified_text
          }));
        }
      });
    }

    return () => {
      socket.off('chunk_simplified');
    };
  }, [sessionData]);

  const handleSendSignal = async (chunkId, signalType, value = 1.0) => {
    if (signalType === 'flag_difficult') {
      setStrugglingChunks((prev) => new Set(prev).add(chunkId));
    }

    try {
      await apiRequest('/signals/ingest', {
        method: 'POST',
        body: JSON.stringify({
          student_id: sessionData.student_id,
          chunk_id: chunkId,
          signal_type: signalType,
          value: value
        })
      });
    } catch (err) {
      console.error('Signal transmission failed:', err);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '2rem auto', padding: '0 1.5rem' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Active Classroom Session</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Logged in as <strong>{sessionData.display_name}</strong>
          </span>
        </div>
        <div style={{
          padding: '0.4rem 0.8rem',
          borderRadius: 6,
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid var(--border-glow)',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-mono)'
        }}>
          Room: {sessionData.room_code}
        </div>
      </header>

      <main>
        {chunks.map((chunk) => (
          <ChunkCard
            key={chunk.id}
            chunk={chunk}
            onSignal={handleSendSignal}
            isStruggling={strugglingChunks.has(chunk.id)}
            simplifiedText={simplifiedMap[chunk.id]}
          />
        ))}
      </main>
    </div>
  );
}
