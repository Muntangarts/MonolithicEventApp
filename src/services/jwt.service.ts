import jwt from 'jsonwebtoken';

export function generateToken(userId: string, role: string, expiresIn = '1h') {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
}