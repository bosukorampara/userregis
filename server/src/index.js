import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// In production behind a proxy (Render/Heroku), trust proxy so Secure cookies work
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/userregis';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});



