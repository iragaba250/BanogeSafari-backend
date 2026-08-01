import mongoose from 'mongoose';
import app from '../backend/app.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function handler(req, res) {
  const originalUrl = req.headers['x-vercel-rewrite'];
  if (originalUrl) {
    const [pathname, query = ''] = String(originalUrl).split('?');
    req.url = `${pathname}${query ? `?${query}` : ''}`;
  }

  if (!cached.conn) {
    if (!cached.promise) {
      cached.promise = mongoose
        .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
        .then((conn) => conn);
    }
    cached.conn = await cached.promise;
  }
  return app(req, res);
}
