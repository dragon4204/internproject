import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      login(res.data.token);
      navigate('/upload');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-glass-card animate-fade-in">
        <div className="auth-logo">{/* Replace with logo SVG or image if available */}
          <span style={{fontSize: '2.5rem', color: '#7b6ef6'}}>△</span>
        </div>
        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Sign in to manage your 3D files.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Username
            <input type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required className="auth-input" />
          </label>
          <label>Password
            <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input" />
          </label>
          <div className="auth-row">
            <Link to="/forgot" className="auth-link auth-link-right">Forgot Password?</Link>
          </div>
          <button type="submit" className="auth-btn">Login</button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 