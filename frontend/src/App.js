import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import ViewerPage from './pages/ViewerPage';
import FileListPage from './pages/FileListPage';
import { AuthProvider, useAuth } from './auth';
import './index.css';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  return (
    <nav style={{ background: '#1976d2', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/upload" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: 20 }}>3D Model Viewer</Link>
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <Link to="/upload" style={{ color: '#fff', marginRight: 16 }}>Upload</Link>
            <button onClick={logout} style={{ background: '#fff', color: '#1976d2', border: 'none', borderRadius: 5, padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', marginRight: 16 }}>Login</Link>
            <Link to="/register" style={{ color: '#fff' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path="/viewer/:id" element={<PrivateRoute><ViewerPage /></PrivateRoute>} />
          <Route path="/files" element={<PrivateRoute><FileListPage /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/upload" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
