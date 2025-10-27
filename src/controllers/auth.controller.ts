import { PrismaClient } from '@prisma/client';
import {hash, compare} from 'bcrypt';
import { generateToken, verifyToken, generateRefreshToken } from '../services/jwt.service';
import { sendEmail } from '../services/email.service';
import { Context } from 'elysia';

export class AuthController {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async signupUser({ body, set }: Context & { body: { email: string; password: string } }) {
    const { email, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ATTENDEE',
      },
    });
    await sendEmail(email, 'Welcome to Event App', 'Thank you for signing up!');
    set.status = 201;
    return { message: 'User created successfully' };
  }

  async signupOrganizer({ body, set }: Context & { body: { email: string; password: string } }) {
    const { email, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ORGANIZER',
      },
    });
    await sendEmail(email, 'Welcome Organizer', 'Thank you for signing up as an organizer!');
    set.status = 201;
    return { message: 'Organizer created successfully' };
  }

  async signupAdmin({ body, set }: Context & { body: { email: string; password: string } }) {
    const { email, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    await sendEmail(email, 'Welcome Admin', 'Thank you for signing up as an admin!');
    set.status = 201;
    return { message: 'Admin created successfully' };
  }

  async loginUser({ body, set }: Context & { body: { email: string; password: string } }) {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      set.status = 401;
      throw new Error('Invalid credentials');
    }
    if (user.role !== 'ATTENDEE') {
      set.status = 403;
      throw new Error('Not authorized as user');
    }
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    return { token, refreshToken };
  }

  async loginOrganizer({ body, set }: Context & { body: { email: string; password: string } }) {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      set.status = 401;
      throw new Error('Invalid credentials');
    }
    if (user.role !== 'ORGANIZER') {
      set.status = 403;
      throw new Error('Not authorized as organizer');
    }
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    return { token, refreshToken };
  }

  async logout({ set }: Context) {
    // Invalidate token (client-side clearing, server stateless)
    set.status = 200;
    return { message: 'Logged out successfully' };
  }

  async forgotPassword({ body, set }: Context & { body: { email: string } }) {
    const { email } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      set.status = 404;
      throw new Error('User not found');
    }
    const resetToken = generateToken(user.id, user.role, '15m');
    await sendEmail(email, 'Password Reset', `Reset your password: http://your-app/reset-password?token=${resetToken}`);
    set.status = 200;
    return { message: 'Password reset email sent' };
  }

  async resetPassword({ body, set }: Context & { body: { token: string; newPassword: string } }) {
    const { token, newPassword } = body;
    try {
      const payload = verifyToken(token);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });
      set.status = 200;
      return { message: 'Password reset successfully' };
    } catch (error) {
      set.status = 401;
      throw new Error('Invalid or expired token');
    }
  }

  async refreshToken({ body, set }: Context & { body: { refreshToken: string } }) {
    const { refreshToken } = body;
    try {
      const payload = verifyToken(refreshToken);
      const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) {
        set.status = 404;
        throw new Error('User not found');
      }
      const newToken = generateToken(user.id, user.role);
      const newRefreshToken = generateRefreshToken(user.id);
      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      set.status = 401;
      throw new Error('Invalid refresh token');
    }
  }
}