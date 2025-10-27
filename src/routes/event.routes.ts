import { Elysia, t } from 'elysia';
import { EventController } from '../controllers/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { WebSocketService } from '../services/websocket.service';

export const eventRoutes = (app: Elysia) =>
  app.group('/events', (app) => {
    const wsService = new WebSocketService();
    return app
      .use(authMiddleware)
      .post(
        '/',
        async (ctx) => new EventController(ctx.prisma, wsService).createEvent(ctx),
        {
          body: t.Object({
            title: t.String(),
            description: t.String(),
            date: t.String({ format: 'date-time' }),
            location: t.String(),
          }),
        }
      )
      .get('/', async (ctx) => new EventController(ctx.prisma, wsService).getEvents(ctx))
      .put(
        '/:id/approve',
        async (ctx) => new EventController(ctx.prisma, wsService).approveEvent(ctx),
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      );
  });