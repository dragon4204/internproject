const express = require('express');
const multer = require('multer');
const path = require('path');
const Model = require('../models/Model');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + Date.now() + ext);
  },
});
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowed = ['.glb', '.obj'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only .glb and .obj files are allowed'));
    }
    cb(null, true);
  },
});

// GET /api/models - fetch all models
router.get('/', async (req, res) => {
  try {
    const models = await Model.find().populate('uploadedBy', 'username').sort({ createdAt: -1 });
    res.json(models);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/models - upload model metadata and file (auth required)
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  const { name, description } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const model = new Model({
      name,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    });
    await model.save();
    res.status(201).json(model);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 