const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware: ensures MongoDB connection is active before routes run
app.use(async (req, res, next) => {
  // Allow health check to respond even if DB is still connecting or experiencing issues
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('[StaffSync DB Error]:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please verify MONGODB_URI or MONGO_URI in environment variables.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

// Health Check API
const healthHandler = (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    system: 'StaffSync HRMS API',
    version: '1.0.0',
    database: isDbReady ? 'connected' : 'connecting_or_disconnected',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', healthHandler);

// Route modules
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Mount routes under both /api/* and /* to seamlessly handle Vercel serverless rewrites and direct client requests
const routeList = [
  ['/auth', authRoutes],
  ['/employees', employeeRoutes],
  ['/attendance', attendanceRoutes],
  ['/leaves', leaveRoutes],
  ['/announcements', announcementRoutes],
  ['/trainings', trainingRoutes],
  ['/dashboard', dashboardRoutes],
];

routeList.forEach(([path, router]) => {
  app.use(`/api${path}`, router);
  app.use(path, router);
});

// Root fallback route for standalone development
app.get('/', (req, res) => {
  res.send('StaffSync API is running smoothly. Access /api/health for system status.');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Only listen on port when running standalone (not inside Vercel serverless functions)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  // Initialize DB on standalone startup
  connectDB().catch((err) => {
    console.warn(`[Initial DB Warning]: ${err.message}`);
  });

  app.listen(PORT, () => {
    console.log(`[StaffSync Server]: Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
