import { Elysia, t } from 'elysia';
import { AuthController } from '../controllers/auth.controller';

export const authRoutes = (app: Elysia) =>
  app.group('/auth', (app) =>
    app
      .post(
        '/signup-user',
        async (ctx) => new AuthController(ctx.prisma).signupUser(ctx),
        {
          body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 6 }),
          }),
        }
      )
      .post(
        '/signup-organizer',
        async (ctx) => new AuthController(ctx.prisma).signupOrganizer(ctx),
        {
          body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 6 }),
          }),
        }
      )
      .post(
        '/signup-admin',
        async (ctx) => new AuthController(ctx.prisma).signupAdmin(ctx),
        {
          body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 6 }),
          }),
        }
      )
      .post(
        '/login-user',
        async (ctx) => new AuthController(ctx.prisma).loginUser(ctx),
        {
          body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String(),
          }),
        }
      )
      .post(
        '/login-organizer',
        async (ctx) => new AuthController(ctx.prisma).loginOrganizer(ctx),
        {
          body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String(),
          }),
        }
      )
      .post('/logout', async (ctx) => new AuthController(ctx.prisma).logout(ctx))
      .post(
        '/forgot-password',
        async (ctx) => new AuthController(ctx.prisma).forgotPassword(ctx),
        {
          body: t.Object({
            email: t.String({ format: 'email' }),
          }),
        }
      )
      .post(
        '/reset-password',
        async (ctx) => new AuthController(ctx.prisma).resetPassword(ctx),
        {
          body: t.Object({
            token: t.String(),
            newPassword: t.String({ minLength: 6 }),
          }),
        }
      )
      .post(
        '/refresh-token',
        async (ctx) => new AuthController(ctx.prisma).refreshToken(ctx),
        {
          body: t.Object({
            refreshToken: t.String(),
          }),
        }
      )
  );