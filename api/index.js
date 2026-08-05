import mongoose from 'mongoose';
import app from '../backend/app.js';
import User from '../backend/models/User.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let seeded = global.banogeSeeded;

const restoreApiPath = (req) => {
  const originalUrl = req.headers['x-vercel-rewrite'];
  if (!originalUrl) return;

  const bare = req.url === '/' || req.url === '/api' || req.url === '/api/';
  const hasPath =
    String(originalUrl).startsWith('/api/') && String(originalUrl).length > '/api/'.length;

  if (bare && hasPath) {
    const [pathname, query = ''] = String(originalUrl).split('?');
    req.url = `${pathname}${query ? `?${query}` : ''}`;
  }
};

const ensureAdminExists = async () => {
  const count = await User.countDocuments();
  if (count > 0) return;
  await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@banoge.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  });
  console.log('Seeded default admin (admin@banoge.com / admin123)');
};

export default async function handler(req, res) {
  restoreApiPath(req);

  if (!process.env.MONGO_URI) {
    return res.status(500).json({ message: 'MONGO_URI environment variable is not set' });
  }

  if (!cached.conn) {
    if (!cached.promise) {
      cached.promise = mongoose
        .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
        .then((conn) => conn);
    }
    cached.conn = await cached.promise;
  }

  if (!seeded) {
    try {
      await ensureAdminExists();
    } catch (error) {
      console.error('Seed check failed:', error);
    } finally {
      seeded = global.banogeSeeded = true;
    }
  }

  return app(req, res);
}
