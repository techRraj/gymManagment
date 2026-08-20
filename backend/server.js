import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import matchRoutes from './routes/match.routes.js';
import crewRoutes from './routes/crew.routes.js';

// ES Module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT: Serve static uploads folder - MUST come before routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

// Test endpoint to verify uploads folder is accessible
app.get('/api/test-upload', (req, res) => {
  const fs = require('fs');
  const uploadPath = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadPath);
    res.json({ 
      success: true, 
      uploadPath,
      files,
      message: `Found ${files.length} files in uploads folder`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Cannot access uploads folder',
      error: error.message 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/crews', crewRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GymBrosUK API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to GymBrosUK API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      matches: '/api/matches',
      crews: '/api/crews',
      uploads: '/uploads'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏋️ GymBrosUK API ready`);
  console.log(` Uploads available at: http://localhost:${PORT}/uploads`);
});