import { WebSocket } from 'elysia';
import { Event } from '@prisma/client';

export class WebSocketService {
  private clients: Set<WebSocket> = new Set();

  // Add client to the set when they connect
  addClient(ws: WebSocket) {
    this.clients.add(ws);
  }

  // Remove client on disconnect
  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  // Broadcast event updates to all connected clients
  broadcastEvent(event: Event, action: 'created' | 'approved') {
    const message = JSON.stringify({
      type: `event:${action}`,
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        approved: event.approved,
        createdAt: event.createdAt,
      },
    });
    for (const client of this.clients) {
      if (client.isSubscribed('events')) {
        client.send(message);
      }
    }
  }
}