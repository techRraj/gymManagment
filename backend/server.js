import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import matchRoutes from './routes/match.routes.js';
import crewRoutes from './routes/crew.routes.js';
import { handleMulterError } from './middleware/upload.js';

// ES Module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// ✅ 1. Ensure uploads directory exists (critical for Render)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// ✅ 2. ROBUST CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:5173',
  'https://gym-managment-gules.vercel.app', // Your Vercel frontend
  process.env.FRONTEND_URL // Fallback to environment variable
].filter(Boolean); // Removes undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Serve static uploads folder with explicit CORS headers for images
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache images for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*'); // Guarantee images load on Vercel
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/crews', crewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'GymBrosUK API is running', 
    timestamp: new Date().toISOString() 
  });
});

// ✅ 4. Test endpoint to verify uploads are accessible
app.get('/api/test-uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const baseUrl = process.env.FRONTEND_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
    res.json({ 
      success: true, 
      message: `Found ${files.length} files in uploads`,
      files: files.map(f => `${baseUrl}/uploads/${f}`)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server'
  });
});

// ✅ 5. Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏋️ GymBrosUK API ready`);
  console.log(`📁 Uploads served at: /uploads`);
});