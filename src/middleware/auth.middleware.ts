import { Elysia } from 'elysia';
import { verifyToken } from '../services/jwt.service';

export const authMiddleware = new Elysia()
  .derive(({ headers, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      throw new Error('Authorization header missing or invalid');
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = verifyToken(token);
      return { user: payload };
    } catch (error) {
      set.status = 401;
      throw new Error('Invalid or expired token');
    }
  });