import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import { testConnection, sequelize } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const CLIENT_URLS = process.env.CLIENT_URLS || '';
const allowedOrigins = [CLIENT_URL, ...CLIENT_URLS.split(',').map((s) => s.trim()).filter(Boolean)];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow same-origin requests or no Origin (like curl/postman)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((o) => o && origin === o);
      return callback(isAllowed ? null : new Error('CORS: Origin not allowed'), isAllowed);
    },
  })
);
app.use(express.json());
app.use(cookieParser());

// In production behind a proxy (Render/Heroku), trust proxy so Secure cookies work
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.get('/', (_req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

app.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api/auth', authRouter);

async function start() {
  try {
    console.log('Starting server...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', PORT);
    console.log('Client URL:', CLIENT_URL);
    
    await testConnection();
    console.log('Database connection successful');
    
    // Sync models with DB. In production consider migrations instead of sync({ alter: true }).
    await sequelize.sync();
    console.log('Database tables synced');
    
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    console.error('Error details:', err.message);
    process.exit(1);
  }
}

start();



