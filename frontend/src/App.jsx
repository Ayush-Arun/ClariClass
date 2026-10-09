import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import TeacherUpload from './pages/TeacherUpload';
import StudentJoin from './pages/StudentJoin';
import StudentView from './pages/StudentView';
import TeacherDashboard from './pages/TeacherDashboard';
import Calibration from './pages/Calibration';

export default function App() {
  const [activePage, setActivePage] = useState('student-join');
  const [user, setUser] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  useEffect(() => {
    const cachedUser = localStorage.getItem('clariclass_user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem('clariclass_user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('clariclass_token');
    localStorage.removeItem('clariclass_user');
    setUser(null);
    setActivePage('login');
  };

  const handleSessionCreated = (session) => {
    setSessionData(session);
    setActivePage('teacher-dashboard');
  };

  const handleJoinSuccess = (session) => {
    setSessionData(session);
    setActivePage('student-view');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
      />

      <div style={{ flex: 1 }}>
        {activePage === 'login' && (
          <Login onLoginSuccess={(u) => { setUser(u); setActivePage('teacher-upload'); }} />
        )}

        {activePage === 'teacher-upload' && (
          <TeacherUpload onSessionCreated={handleSessionCreated} />
        )}

        {activePage === 'student-join' && (
          <StudentJoin onJoinSuccess={handleJoinSuccess} />
        )}

        {activePage === 'student-view' && sessionData && (
          <StudentView sessionData={sessionData} />
        )}

        {activePage === 'teacher-dashboard' && sessionData && (
          <TeacherDashboard sessionData={sessionData} />
        )}

        {isCalibrating && (
          <Calibration onComplete={() => setIsCalibrating(false)} />
        )}
      </div>
    </div>
  );
}
