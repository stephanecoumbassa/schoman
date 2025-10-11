import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { createServer } from 'http';
import compression from 'compression';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import classRoutes from './routes/classRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';

// Import Socket.io service
import socketService from './services/socketService.js';

// Import cache service
import cacheService from './services/cacheService.js';

// Import error handling
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Import rate limiters
import { apiLimiter, authLimiter, uploadLimiter, exportLimiter } from './middleware/rateLimiter.js';

// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoman';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware - compress all responses
app.use(compression());

// Global rate limiter for all API routes
app.use('/api', apiLimiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('✅ Connecté à MongoDB');
    console.log('✅ Connecté à MongoDB');
  })
  .catch((error) => {
    logger.error('❌ Erreur de connexion à MongoDB:', error);
    console.error('❌ Erreur de connexion à MongoDB:', error);
  });

// Initialize cache service
cacheService.connect()
  .then(() => {
    if (cacheService.isReady()) {
      logger.info('✅ Cache service connected');
      console.log('✅ Cache service connected');
    }
  })
  .catch((error) => {
    logger.warn('⚠️ Cache service not available:', error);
    console.warn('⚠️ Cache service not available - continuing without cache');
  });

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API Schoman!',
    status: 'En fonctionnement',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/uploads', uploadLimiter, uploadRoutes);
app.use('/api/exports', exportLimiter, exportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schools', schoolRoutes);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server and initialize Socket.io
const httpServer = createServer(app);
socketService.initialize(httpServer);

// Start server
httpServer.listen(PORT, () => {
  const message = `🚀 Serveur démarré sur http://localhost:${PORT}`;
  logger.info(message);
  console.log(message);
});