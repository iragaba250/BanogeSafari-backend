import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const base = {
  standardHeaders: true,
  legacyHeaders: false,
};

const clientIp = (req) => {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) return ipKeyGenerator(fwd.split(',')[0].trim());
  return ipKeyGenerator(req.ip || req.socket?.remoteAddress || 'unknown');
};

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: clientIp,
  message: { message: 'Too many attempts, please try again later' },
});

export const contactLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: clientIp,
  message: { message: 'Too many messages sent, please try again later' },
});

export const generalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  keyGenerator: clientIp,
  message: { message: 'Too many requests, please try again later' },
});
