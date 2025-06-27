import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth';
import { Link } from 'react-router-dom';

function UploadPage() {
  const { token, logout } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [models, setModels] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line
  }, []);

  const fetchModels = async () => {
    try {
      const res = await axios.get('/api/models');
      setModels(res.data);
    } catch (err) {
      setError('Failed to fetch models');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) return setError('Please select a .glb or .obj file');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);
    try {
      await axios.post('/api/models', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Model uploaded!');
      setName('');
      setDescription('');
      setFile(null);
      fetchModels();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      if (err.response?.status === 401) logout();
    }
  };

  return (
    <div className="dashboard-bg">
      <aside className="dashboard-sidebar glassmorphism animate-fade-in">
        <div className="sidebar-logo">△</div>
        <nav className="sidebar-nav">
          <Link to="/upload" className="sidebar-link active">Upload Panel</Link>
          <Link to="/files" className="sidebar-link">File List/Table</Link>
          <Link to="/viewer" className="sidebar-link">3D Viewer Panel</Link>
        </nav>
        <div className="sidebar-footer">
          <span>User Profile & Settings</span>
        </div>
      </aside>
      <main className="dashboard-main">
        <div className="upload-glass-card glassmorphism animate-fade-in">
          <h2 className="upload-title">Upload Your 3D Models & Files</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <input type="text" placeholder="Model Name" value={name} onChange={e => setName(e.target.value)} required className="upload-input" />
            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="upload-input" />
            <input type="file" accept=".glb,.obj" onChange={e => setFile(e.target.files[0])} required className="upload-input" />
            <button type="submit" className="upload-btn">Upload</button>
          </form>
          {error && <p className="upload-error">{error}</p>}
          {success && <p className="upload-success">{success}</p>}
        </div>
        <section className="recent-uploads glassmorphism animate-fade-in">
          <h3>Recent Uploads</h3>
          <ul className="recent-uploads-list">
            {models.slice(0, 7).map(model => (
              <li key={model._id} className="recent-upload-item">
                <span className="recent-upload-name">{model.name}</span>
                <span className="recent-upload-status done">Done</span>
                <Link to={`/viewer/${model._id}`} className="recent-upload-view">View</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default UploadPage; 