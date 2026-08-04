import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

import rateLimit from 'express-rate-limit';
import { Server as SocketServer } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import Team from './models/Team.js';
import matchRoutes from './routes/matchRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import supportHistoryRoutes from './routes/supportHistoryRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import coinsRoutes from './routes/coinsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminPanelRoutes from './routes/adminPanelRoutes.js';
import coinPackageRoutes from './routes/coinPackageRoutes.js';
import CoinPackage from './models/CoinPackage.js';
import { seedSuperAdmin } from './controllers/adminPanelController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeMatchEngine } from './services/matchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const loadEnvironment = () => {
  const configuredEnvFile = process.env.ENV_FILE;
  const envCandidates = [
    configuredEnvFile ? path.resolve(configuredEnvFile) : null,
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', '..', '.env'),
  ].filter(Boolean);

  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        throw result.error;
      }
      console.log(`Loaded environment variables from ${envPath}`);
      return envPath;
    }
  }

  console.warn('No .env file found. Falling back to process environment variables only.');
  return null;
};

loadEnvironment();

const app = express();
const server = http.createServer(app);
const rawOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

// allow any onrender.com subdomain so renamed/suffixed Render services work
const isAllowedOrigin = (origin) => {
  if (!origin) return false;
  if (rawOrigins.includes(origin)) return true;
  if (origin.endsWith('.onrender.com')) return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  return false;
};

const corsOptions = {
  origin: rawOrigins.length === 0 ? '*' : (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error(`CORS: origin not allowed — ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

const clientOrigin = rawOrigins.length > 0 ? isAllowedOrigin : '*';
const io = new SocketServer(server, {
  cors: {
    origin: rawOrigins.length === 0 ? '*' : (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/support-history', supportHistoryRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-panel', adminPanelRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/coin-packages', coinPackageRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Game Backend API is Running!');
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'AI Cartoon Battle Arena API running' });
});

let dbReady = false;
app.use((req, res, next) => {
  if (!dbReady && req.path.startsWith('/api/') && req.path !== '/api/status') {
    return res.status(503).json({
      status: 'degraded',
      message: 'Database unavailable. The API is running in degraded mode.',
    });
  }
  next();
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const localMongoUri = 'mongodb://127.0.0.1:27017/ai-cartoon-battle-arena';
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || '';
const directMongoUri = process.env.MONGO_DIRECT_URI || '';
const fallbackMongoUri = process.env.MONGO_FALLBACK_URI || localMongoUri;

const redactMongoUri = (uri = '') => uri.replace(/\/\/([^@]+)@/, '//***:***@');

const normalizeMongoUri = (uri, options = {}) => {
  const { allowSrv = true, envName = 'MongoDB URI' } = options;
  const normalized = (uri || '').trim();
  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('mongodb://')) {
    return normalized;
  }

  if (normalized.startsWith('mongodb+srv://')) {
    if (!allowSrv) {
      throw new Error(`${envName} must start with mongodb:// (direct URI), not mongodb+srv://`);
    }
    return normalized;
  }

  if (normalized.includes('.mongodb.net')) {
    return allowSrv ? `mongodb+srv://${normalized}` : `mongodb://${normalized}`;
  }

  throw new Error(
    `Invalid MongoDB URI format: ${redactMongoUri(normalized)}. Use mongodb:// or mongodb+srv://`
  );
};

const safeNormalizeMongoUri = (uri, options = {}) => {
  try {
    return normalizeMongoUri(uri, options);
  } catch (error) {
    return '';
  }
};

const validateEnvironment = () => {
  const requiredEnv = ['JWT_SECRET'];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const hasUriPlaceholder = (uri) => {
  return /<[^>]+>/.test(uri || '');
};

const validateMongoEnvironment = () => {
  const mongoUris = [process.env.MONGO_URI, process.env.MONGO_DIRECT_URI, process.env.MONGO_FALLBACK_URI]
    .filter(Boolean);
  const placeholders = mongoUris.filter((uri) => hasUriPlaceholder(uri));
  if (placeholders.length > 0) {
    throw new Error(
      `MongoDB environment contains placeholder values: ${placeholders.join(', ')}`
    );
  }
};

const buildMongoUriCandidates = () => {
  const candidates = [normalizeMongoUri(mongoUri, { allowSrv: true, envName: 'MONGO_URI' })].filter(Boolean);

  return [...new Set(candidates)];
};

const isSrvDnsFailure = (error) => {
  const message = `${error?.message || ''} ${error?.cause?.message || ''} ${error?.reason?.message || ''}`;
  return (
    message.includes('querySrv') ||
    message.includes('ENOTFOUND') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEOUT')
  );
};

const isSrvUri = (uri) => uri.startsWith('mongodb+srv://');

const connectMongoWithUri = async (uri, positionLabel) => {
  console.log(`Connecting to MongoDB (${positionLabel}): ${redactMongoUri(uri)}`);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true,
  });
  return uri;
};

const connectMongoWithFallback = async () => {
  const urisToTry = buildMongoUriCandidates();
  if (urisToTry.length === 0) {
    throw new Error(
      'No MongoDB URI configured. Set MONGO_URI (Atlas) or MONGO_FALLBACK_URI (local).'
    );
  }

  const primaryUri = urisToTry[0];
  try {
    return await connectMongoWithUri(primaryUri, 'primary');
  } catch (error) {
    console.error(`MongoDB connection failed for ${redactMongoUri(primaryUri)}: ${error.message}`);

    let normalizedDirectUri = '';
    try {
      normalizedDirectUri = normalizeMongoUri(directMongoUri, {
        allowSrv: false,
        envName: 'MONGO_DIRECT_URI',
      });
    } catch (directUriError) {
      console.error(directUriError.message);
    }

    if (isSrvUri(primaryUri) && isSrvDnsFailure(error) && normalizedDirectUri) {
      console.warn('SRV DNS lookup failed. Falling back to MONGO_DIRECT_URI...');
      try {
        return await connectMongoWithUri(normalizedDirectUri, 'direct');
      } catch (directError) {
        console.error(
          `MongoDB connection failed for ${redactMongoUri(normalizedDirectUri)}: ${directError.message}`
        );
      }
    }

    const normalizedFallbackUri = normalizeMongoUri(fallbackMongoUri, {
      allowSrv: true,
      envName: 'MONGO_FALLBACK_URI',
    });
    const canTryLocalFallback =
      normalizedFallbackUri && normalizedFallbackUri !== primaryUri && normalizedFallbackUri !== normalizedDirectUri;
    if (canTryLocalFallback) {
      console.warn('Trying MONGO_FALLBACK_URI...');
      try {
        return await connectMongoWithUri(normalizedFallbackUri, 'fallback');
      } catch (fallbackError) {
        console.error(
          `MongoDB connection failed for ${redactMongoUri(normalizedFallbackUri)}: ${fallbackError.message}`
        );
        throw fallbackError;
      }
    }

    throw error;
  }
};

const seedDefaultTeams = async () => {
  const defaults = [
    { name: 'Team A', slug: 'team-a', description: 'Fast-paced support team', logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80' },
    { name: 'Team B', slug: 'team-b', description: 'Balanced support team', logo: 'https://images.unsplash.com/photo-1525186402429-2b0a70edaf7f1?auto=format&fit=crop&w=200&q=80' },
  ];

  for (const teamData of defaults) {
    await Team.findOneAndUpdate(
      { slug: teamData.slug },
      { $setOnInsert: teamData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const seedDefaultCoinPackages = async () => {
  const defaults = [
    { title: 'Starter Pack', coins: 500, pricePKR: 1500, description: 'Perfect for new players.' },
    { title: 'Growth Pack', coins: 1000, pricePKR: 3000, description: 'Best value for daily players.' },
    { title: 'Champion Pack', coins: 2500, pricePKR: 7500, description: 'For serious supporters.' },
  ];

  for (const pkg of defaults) {
    await CoinPackage.findOneAndUpdate(
      { title: pkg.title },
      { $setOnInsert: pkg },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const start = async () => {
  try {
    validateEnvironment();
    validateMongoEnvironment();
    const connectedMongoUri = await connectMongoWithFallback();
    dbReady = true;
    console.log(`Connected to MongoDB at ${redactMongoUri(connectedMongoUri)}`);
    await seedDefaultTeams();
    await seedDefaultCoinPackages();
    await seedSuperAdmin();
    initializeMatchEngine(io);
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.warn('MongoDB connection unavailable. Starting server in degraded mode.', error.message);
    dbReady = false;
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    const attemptedUris = [
      ...buildMongoUriCandidates(),
      safeNormalizeMongoUri(directMongoUri, { allowSrv: false, envName: 'MONGO_DIRECT_URI' }),
      safeNormalizeMongoUri(fallbackMongoUri, { allowSrv: true, envName: 'MONGO_FALLBACK_URI' }),
    ].filter(Boolean);
    if (attemptedUris.length > 0) {
      console.error(
        `MongoDB URIs attempted: ${attemptedUris.map((uri) => redactMongoUri(uri)).join(', ')}`
      );
    }
  }
};

start();
