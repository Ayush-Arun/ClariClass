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
        if (u.role === 'teacher') {
          setCurrentPage('teacher-dashboard');
        } else if (u.role === 'student') {
          setCurrentPage('student-view');
        }
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
            onBack={handleLogout}
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
