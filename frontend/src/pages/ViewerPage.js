import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)} % loaded</Html>;
}

function GLBModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function OBJModel({ url }) {
  const [obj, setObj] = useState();
  useEffect(() => {
    const loader = new OBJLoader();
    loader.load(url, setObj);
  }, [url]);
  return obj ? <primitive object={obj} /> : null;
}

function ViewerPage() {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [error, setError] = useState('');
  const [cameraState, setCameraState] = useState(null);
  const controlsRef = useRef();
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState([]);
  // Viewer settings
  const [wireframe, setWireframe] = useState(false);
  const [lighting, setLighting] = useState(true);
  const [zoom, setZoom] = useState(70);
  const [showAnnotations, setShowAnnotations] = useState(false);

  useEffect(() => {
    axios.get(`/api/models`).then(res => {
      const found = res.data.find(m => m._id === id);
      setModel(found);
      setModels(res.data);
    }).catch(() => setError('Failed to load model metadata'));
  }, [id]);

  // Save camera state on unmount
  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        const { target, object } = controlsRef.current;
        const state = {
          position: object.position.toArray(),
          target: target.toArray(),
        };
        localStorage.setItem(`cameraState-${id}`, JSON.stringify(state));
      }
    };
  }, [id]);

  // Restore camera state
  const onCreated = ({ camera }) => {
    const saved = localStorage.getItem(`cameraState-${id}`);
    if (saved) {
      const state = JSON.parse(saved);
      camera.position.fromArray(state.position);
      if (controlsRef.current) controlsRef.current.target.fromArray(state.target);
    }
  };

  // Save camera state manually
  const handleSaveCamera = () => {
    if (controlsRef.current) {
      const { target, object } = controlsRef.current;
      const state = {
        position: object.position.toArray(),
        target: target.toArray(),
      };
      localStorage.setItem(`cameraState-${id}`, JSON.stringify(state));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  // Reset camera state
  const handleResetCamera = () => {
    localStorage.removeItem(`cameraState-${id}`);
    window.location.reload();
  };

  if (error) return <div>{error}</div>;
  if (!model) return <div>Loading...</div>;
  const ext = model.fileUrl.split('.').pop().toLowerCase();

  return (
    <div className="dashboard-bg">
      <aside className="dashboard-sidebar glassmorphism animate-fade-in">
        <div className="sidebar-logo">△</div>
        <nav className="sidebar-nav">
          <Link to="/upload" className="sidebar-link">Upload Panel</Link>
          <Link to="/files" className="sidebar-link">File List/Table</Link>
          <Link to="/viewer" className="sidebar-link active">3D Viewer Panel</Link>
        </nav>
        <div className="sidebar-footer">
          <span>User Profile & Settings</span>
        </div>
      </aside>
      <main className="dashboard-main viewer-main">
        <div className="viewer-glass-card glassmorphism animate-fade-in">
          <div className="viewer-header">
            <h2 className="viewer-title">{model.name}</h2>
            <div className="viewer-actions">
              <button onClick={handleSaveCamera} className="viewer-btn">Save View</button>
              <button onClick={handleResetCamera} className="viewer-btn viewer-btn-reset">Reset View</button>
              {saved && <span className="viewer-saved">Saved!</span>}
            </div>
          </div>
          <div className="viewer-canvas-wrapper">
            <Canvas camera={{ position: [0, 0, 5], zoom: zoom / 10 }} onCreated={onCreated} style={{ background: '#222', borderRadius: 10, marginTop: 10 }} shadows>
              <ambientLight intensity={lighting ? 0.7 : 0.1} />
              <directionalLight position={[5, 10, 7.5]} intensity={lighting ? 1.2 : 0.2} castShadow={lighting} />
              <Grid args={[10, 10]} cellColor="#444" sectionColor="#888" infiniteGrid={true} />
              <Environment preset="city" />
              <React.Suspense fallback={<Loader />}>
                {ext === 'glb' ? <GLBModel url={model.fileUrl} /> : <OBJModel url={model.fileUrl} />}
                <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate />
              </React.Suspense>
            </Canvas>
          </div>
          <p className="viewer-description">{model.description}</p>
        </div>
        <section className="viewer-settings glassmorphism animate-fade-in">
          <h3>Viewer Settings</h3>
          <div className="viewer-setting-row">
            <label>Wireframe View
              <input type="checkbox" checked={wireframe} onChange={e => setWireframe(e.target.checked)} />
            </label>
          </div>
          <div className="viewer-setting-row">
            <label>Enable Lighting
              <input type="checkbox" checked={lighting} onChange={e => setLighting(e.target.checked)} />
            </label>
          </div>
          <div className="viewer-setting-row">
            <label>Zoom Level ({zoom}%)
              <input type="range" min="10" max="200" value={zoom} onChange={e => setZoom(Number(e.target.value))} />
            </label>
          </div>
          <div className="viewer-setting-row">
            <label>Show Annotations
              <input type="checkbox" checked={showAnnotations} onChange={e => setShowAnnotations(e.target.checked)} />
            </label>
          </div>
          <div className="viewer-setting-row">
            <button className="viewer-btn" onClick={handleSaveCamera}>Save Position</button>
            <button className="viewer-btn viewer-btn-reset" onClick={handleResetCamera}>Reset Camera</button>
          </div>
        </section>
        <section className="recent-models glassmorphism animate-fade-in">
          <h3>Recent Models</h3>
          <div className="recent-models-list">
            {models.slice(0, 5).map(m => (
              <div key={m._id} className={`recent-model-item${m._id === id ? ' active' : ''}`}>
                <Link to={`/viewer/${m._id}`} className="recent-model-link">
                  <div className="recent-model-thumb" />
                  <span>{m.name}</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ViewerPage; 