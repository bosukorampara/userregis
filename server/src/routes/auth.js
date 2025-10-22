import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const COOKIE_NAME = 'token';
const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const trimmedName = String(name || '').trim();
    const trimmedEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');

    // Field-level validation with specific messages
    if (!trimmedName) return res.status(400).json({ message: 'Name is required.' });
    if (trimmedName.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    if (!trimmedEmail) return res.status(400).json({ message: 'Email is required.' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(trimmedEmail)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (!rawPassword) return res.status(400).json({ message: 'Password is required.' });
    if (rawPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  const existing = await User.findOne({ where: { email: trimmedEmail } });
    if (existing) return res.status(409).json({ message: 'Email is already registered.' });

    const passwordHash = await bcrypt.hash(rawPassword, 10);
  const user = await User.create({ name: trimmedName, email: trimmedEmail, passwordHash });
  // Do not set auth cookie here; require explicit login after registration
  return res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    // Duplicate key safety (race conditions)
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }
    // Likely connectivity or server error
    return res.status(503).json({ message: 'Service temporarily unavailable. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const trimmedEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');

    if (!trimmedEmail) return res.status(400).json({ message: 'Email is required.' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(trimmedEmail)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (!rawPassword) return res.status(400).json({ message: 'Password is required.' });

  const user = await User.findOne({ where: { email: trimmedEmail } });
    if (!user) return res.status(404).json({ message: 'No account found for this email.' });

    const ok = await bcrypt.compare(rawPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Incorrect password.' });

  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return res.status(503).json({ message: 'Service temporarily unavailable. Please try again.' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const payload = jwt.verify(token, JWT_SECRET);
  const user = await User.findByPk(payload.sub, { attributes: ['id', 'name', 'email'] });
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: 0 });
  return res.json({ ok: true });
});

export default router;


