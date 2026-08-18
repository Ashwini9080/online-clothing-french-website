import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config({ path: ['.env.local', '.env'] });

interface MemoryUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  joinedAt: Date;
}

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'lumiere_super_secret_fallback_key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lumiere-studio';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const memoryUsers: MemoryUser[] = [];

function isMongoReady(): boolean {
  return mongoose.connection.readyState === 1;
}

async function findUserByEmail(email: string): Promise<MemoryUser | null> {
  const normalizedEmail = email.toLowerCase();

  if (isMongoReady()) {
    return User.findOne({ email: normalizedEmail }) as unknown as MemoryUser | null;
  }

  return memoryUsers.find((user) => user.email.toLowerCase() === normalizedEmail) || null;
}

async function createUserRecord(name: string, email: string, passwordHash: string): Promise<MemoryUser> {
  if (isMongoReady()) {
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
    });

    await newUser.save();
    return newUser as unknown as MemoryUser;
  }

  const newUser: MemoryUser = {
    _id: `${Date.now()}-${memoryUsers.length + 1}`,
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    joinedAt: new Date(),
  };

  memoryUsers.push(newUser);
  return newUser;
}

// Middleware
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',') }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lumiere-backend', timestamp: new Date().toISOString() });
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.warn('⚠️ MongoDB unavailable, using in-memory auth store for local development:', err.message);
  });

// ─── AUTHENTICATION ROUTES ──────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if user exists
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await createUserRecord(name, normalizedEmail, hashedPassword);

    // Create JWT
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: { name: newUser.name, email: newUser.email, joinedAt: newUser.joinedAt }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Check user
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ error: 'Incorrect email or password.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect email or password.' });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: { name: user.name, email: user.email, joinedAt: user.joinedAt }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ─── SERVE FRONTEND (SINGLE-SERVICE DEPLOYMENT) ─────────────────────
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

// Fallback to index.html for React client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
