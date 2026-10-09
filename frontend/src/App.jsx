import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentView from './pages/StudentView';
import TeacherUpload from './pages/TeacherUpload';
import StudentJoin from './pages/StudentJoin';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' | 'teacher-dashboard' | 'student-view' | 'teacher-upload' | 'student-join'
  const [user, setUser] = useState(null);
  const [sessionData, setSessionData] = useState({
    room_code: 'ROOM304',
    document_id: 1,
    student_id: 1,
    display_name: 'Alex Rivera'
  });

  useEffect(() => {
    const cached = localStorage.getItem('clariclass_user');
    if (cached) {
      try {
        const u = JSON.parse(cached);
        setUser(u);
      } catch (e) {}
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'teacher') {
      setCurrentPage('teacher-dashboard');
    } else {
      setCurrentPage('student-view');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clariclass_token');
    localStorage.removeItem('clariclass_user');
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Floating Demo Quick-Switch Bar (for testing between screens) */}
      <div style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        backgroundColor: 'rgba(10, 77, 60, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '0.35rem 0.6rem',
        borderRadius: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#A7F3D0', padding: '0 0.4rem', letterSpacing: '0.04em' }}>
          VIEW MODE:
        </span>

        <button
          onClick={() => setCurrentPage('login')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: currentPage === 'login' ? '#FFFFFF' : 'transparent',
            color: currentPage === 'login' ? '#0A4D3C' : '#FFFFFF'
          }}
        >
          1. Login
        </button>

        <button
          onClick={() => setCurrentPage('teacher-dashboard')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: currentPage === 'teacher-dashboard' ? '#FFFFFF' : 'transparent',
            color: currentPage === 'teacher-dashboard' ? '#0A4D3C' : '#FFFFFF'
          }}
        >
          2. Instructor Cockpit
        </button>

        <button
          onClick={() => setCurrentPage('student-view')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: currentPage === 'student-view' ? '#FFFFFF' : 'transparent',
            color: currentPage === 'student-view' ? '#0A4D3C' : '#FFFFFF'
          }}
        >
          3. Student Reader
        </button>

        <button
          onClick={() => setCurrentPage('teacher-upload')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: currentPage === 'teacher-upload' ? '#FFFFFF' : 'transparent',
            color: currentPage === 'teacher-upload' ? '#0A4D3C' : '#FFFFFF'
          }}
        >
          4. Upload
        </button>
      </div>

      {/* Main Routed Page */}
      <div style={{ flex: 1 }}>
        {currentPage === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}

        {currentPage === 'teacher-dashboard' && (
          <TeacherDashboard 
            sessionData={sessionData}
            onUploadClick={() => setCurrentPage('teacher-upload')}
            onEndSession={handleLogout}
          />
        )}

        {currentPage === 'student-view' && (
          <StudentView 
            sessionData={sessionData} 
            onBack={() => setCurrentPage('login')}
          />
        )}

        {currentPage === 'teacher-upload' && (
          <TeacherUpload 
            onSessionCreated={(res) => { setSessionData(res); setCurrentPage('teacher-dashboard'); }}
            onBack={() => setCurrentPage('teacher-dashboard')}
          />
        )}

        {currentPage === 'student-join' && (
          <StudentJoin 
            onJoinSuccess={(res) => { setSessionData(res); setCurrentPage('student-view'); }}
            onBack={() => setCurrentPage('login')}
          />
        )}
      </div>

    </div>
  );
}
