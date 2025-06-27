// Global variables
let currentUser = null;
let currentToken = localStorage.getItem('token');
let scene, camera, renderer, controls;
let currentModel = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Initialize the application
function initializeApp() {
    // Show login page by default if not authenticated
    if (!currentToken) {
        showPage('login');
    } else {
        showPage('upload');
        loadModels();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Upload form
    document.getElementById('upload-form').addEventListener('submit', handleUpload);
    
    // File input change
    document.getElementById('model-file').addEventListener('change', handleFileSelect);
    
    // Viewer controls
    document.getElementById('save-camera-btn').addEventListener('click', saveCameraState);
    document.getElementById('reset-camera-btn').addEventListener('click', resetCameraState);
    document.getElementById('back-to-upload').addEventListener('click', () => showPage('upload'));
}

// Check authentication status
function checkAuthStatus() {
    if (currentToken) {
        // Verify token is still valid
        fetch('/api/models', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        })
        .then(response => {
            if (response.ok) {
                updateNavbar(true);
                loadModels();
            } else {
                logout();
            }
        })
        .catch(() => {
            logout();
        });
    } else {
        updateNavbar(false);
    }
}

// Update navbar based on authentication status
function updateNavbar(isAuthenticated) {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const uploadLink = document.getElementById('upload-link');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (isAuthenticated) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        uploadLink.style.display = 'inline';
        logoutBtn.style.display = 'inline';
    } else {
        loginLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        uploadLink.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

// Show different pages
function showPage(pageName) {
    // Hide all pages
    const pages = ['login-page', 'register-page', 'upload-page', 'viewer-page'];
    pages.forEach(page => {
        document.getElementById(page).style.display = 'none';
    });
    
    // Show selected page
    document.getElementById(`${pageName}-page`).style.display = 'block';
    
    // Update active state in navbar
    updateActiveNavLink(pageName);
}

// Update active navigation link
function updateActiveNavLink(pageName) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    if (pageName === 'upload') {
        document.getElementById('upload-link').classList.add('active');
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentToken = data.token;
            localStorage.setItem('token', currentToken);
            updateNavbar(true);
            showPage('upload');
            loadModels();
            errorElement.textContent = '';
        } else {
            errorElement.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorElement.textContent = 'Network error. Please try again.';
    } finally {
        showLoading(false);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    showLoading(true);
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const errorElement = document.getElementById('register-error');
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showPage('login');
            errorElement.textContent = '';
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
            alert('Registration successful! Please login.');
        } else {
            errorElement.textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        errorElement.textContent = 'Network error. Please try again.';
    } finally {
        showLoading(false);
    }
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    const fileLabel = document.querySelector('.file-text');
    
    if (file) {
        fileLabel.textContent = file.name;
        document.querySelector('.file-label').style.borderColor = '#388e3c';
    } else {
        fileLabel.textContent = 'Choose a file';
        document.querySelector('.file-label').style.borderColor = '#1976d2';
    }
}

// Handle upload
async function handleUpload(e) {
    e.preventDefault();
    showLoading(true);
    
    const name = document.getElementById('model-name').value;
    const description = document.getElementById('model-description').value;
    const file = document.getElementById('model-file').files[0];
    const errorElement = document.getElementById('upload-error');
    const successElement = document.getElementById('upload-success');
    
    if (!file) {
        errorElement.textContent = 'Please select a .glb or .obj file';
        showLoading(false);
        return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/models', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successElement.textContent = 'Model uploaded successfully!';
            errorElement.textContent = '';
            
            // Reset form
            document.getElementById('upload-form').reset();
            document.querySelector('.file-text').textContent = 'Choose a file';
            document.querySelector('.file-label').style.borderColor = '#1976d2';
            
            // Reload models
            loadModels();
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                successElement.textContent = '';
            }, 3000);
        } else {
            errorElement.textContent = data.message || 'Upload failed';
            if (response.status === 401) {
                logout();
            }
        }
    } catch (error) {
        errorElement.textContent = 'Network error. Please try again.';
    } finally {
        showLoading(false);
    }
}

// Load models
async function loadModels() {
    try {
        const response = await fetch('/api/models');
        const models = await response.json();
        
        const modelsList = document.getElementById('models-list');
        modelsList.innerHTML = '';
        
        if (models.length === 0) {
            modelsList.innerHTML = '<p style="text-align: center; color: #666;">No models uploaded yet.</p>';
            return;
        }
        
        models.forEach(model => {
            const modelItem = document.createElement('div');
            modelItem.className = 'model-item';
            modelItem.innerHTML = `
                <h4>${model.name}</h4>
                <p>${model.description || 'No description'}</p>
                <p><small>By: ${model.uploadedBy?.username || 'Unknown'}</small></p>
            `;
            modelItem.addEventListener('click', () => openViewer(model._id));
            modelsList.appendChild(modelItem);
        });
    } catch (error) {
        console.error('Failed to load models:', error);
    }
}

// Open 3D viewer
async function openViewer(modelId) {
    showLoading(true);
    
    try {
        const response = await fetch('/api/models');
        const models = await response.json();
        const model = models.find(m => m._id === modelId);
        
        if (!model) {
            alert('Model not found');
            showLoading(false);
            return;
        }
        
        currentModel = model;
        showPage('viewer');
        
        // Update viewer UI
        document.getElementById('viewer-title').textContent = model.name;
        document.getElementById('viewer-description').textContent = model.description || 'No description available';
        
        // Initialize 3D viewer
        initViewer(model.fileUrl);
        
    } catch (error) {
        alert('Failed to load model');
        console.error(error);
    } finally {
        showLoading(false);
    }
}

// Initialize 3D viewer
function initViewer(modelUrl) {
    const container = document.getElementById('viewer-canvas');
    
    // Clear previous scene
    if (renderer) {
        container.innerHTML = '';
    }
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x888888);
    scene.add(gridHelper);
    
    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Load model
    loadModel(modelUrl);
    
    // Restore camera state if exists
    restoreCameraState();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Load 3D model
function loadModel(url) {
    const fileExtension = url.split('.').pop().toLowerCase();
    
    if (fileExtension === 'glb' || fileExtension === 'gltf') {
        const loader = new THREE.GLTFLoader();
        loader.load(url, (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(model);
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
        });
    } else if (fileExtension === 'obj') {
        const loader = new THREE.OBJLoader();
        loader.load(url, (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Add basic material if none exists
                    if (!child.material) {
                        child.material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
                    }
                }
            });
            scene.add(object);
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            object.scale.setScalar(scale);
            object.position.sub(center.multiplyScalar(scale));
        });
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('viewer-canvas');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Save camera state
function saveCameraState() {
    if (controls && currentModel) {
        const state = {
            position: camera.position.toArray(),
            target: controls.target.toArray()
        };
        localStorage.setItem(`cameraState-${currentModel._id}`, JSON.stringify(state));
        
        const saveStatus = document.getElementById('save-status');
        saveStatus.textContent = 'View saved!';
        saveStatus.classList.add('show');
        
        setTimeout(() => {
            saveStatus.classList.remove('show');
        }, 2000);
    }
}

// Restore camera state
function restoreCameraState() {
    if (currentModel) {
        const saved = localStorage.getItem(`cameraState-${currentModel._id}`);
        if (saved) {
            const state = JSON.parse(saved);
            camera.position.fromArray(state.position);
            controls.target.fromArray(state.target);
            controls.update();
        }
    }
}

// Reset camera state
function resetCameraState() {
    if (currentModel) {
        localStorage.removeItem(`cameraState-${currentModel._id}`);
        location.reload();
    }
}

// Logout function
function logout() {
    currentToken = null;
    localStorage.removeItem('token');
    updateNavbar(false);
    showPage('login');
    
    // Clear forms
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    document.getElementById('upload-form').reset();
    document.querySelector('.file-text').textContent = 'Choose a file';
    document.querySelector('.file-label').style.borderColor = '#1976d2';
}

// Show/hide loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Utility function to make API calls
async function apiCall(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
        }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
        if (response.status === 401) {
            logout();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
} 