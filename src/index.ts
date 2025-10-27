import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.routes';
import { eventRoutes } from './routes/event.routes';
import { WebSocketService } from './services/websocket.service';
import 'dotenv/config';

const prisma = new PrismaClient();
const wsService = new WebSocketService();

const app = new Elysia()
  .use(swagger({
    path: '/swagger',
    documentation: {
      info: {
        title: 'Event Management API',
        version: '1.0.0',
      },
    },
  }))
  .decorate('prisma', prisma)
  .ws('/ws', {
    open(ws) {
      ws.subscribe('events');
      wsService.addClient(ws);
      ws.send(JSON.stringify({ type: 'connected', message: 'Connected to WebSocket' }));
    },
    close(ws) {
      wsService.removeClient(ws);
    },
    message(ws, message) {
      ws.send(JSON.stringify({ type: 'pong', message: 'Received' }));
    },
  })
  .group('/api', (app) => app.use(authRoutes).use(eventRoutes))
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: error.message };
    }
    set.status = 500;
    return { error: 'Internal Server Error' };
  });

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});