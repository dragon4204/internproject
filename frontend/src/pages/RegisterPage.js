import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('/api/auth/register', { username, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-glass-card animate-fade-in">
        <div className="auth-logo">{/* Replace with logo SVG or image if available */}
          <span style={{fontSize: '2.5rem', color: '#7b6ef6'}}>▮▮▮</span>
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Welcome to 3D File Manager! Enter your details to get started.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Username
            <input type="text" placeholder="Your unique username" value={username} onChange={e => setUsername(e.target.value)} required className="auth-input" />
          </label>
          <label>Password
            <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input" />
          </label>
          <label>Confirm Password
            <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="auth-input" />
          </label>
          <button type="submit" className="auth-btn">Register Account</button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage; 