import { PrismaClient } from '@prisma/client';
import { Context } from 'elysia';
import { WebSocketService } from '../services/websocket.service';

export class EventController {
  private prisma: PrismaClient;
  private wsService: WebSocketService;

  constructor(prisma: PrismaClient, wsService: WebSocketService) {
    this.prisma = prisma;
    this.wsService = wsService;
  }

  async createEvent({ body, set, request }: Context & { body: { title: string; description: string; date: string; location: string } }) {
    const user = (request as any).user;
    if (user.role !== 'ORGANIZER') {
      set.status = 403;
      throw new Error('Only organizers can create events');
    }
    const { title, description, date, location } = body;
    const event = await this.prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        organizerId: user.userId,
        approved: false,
      },
    });
    // Broadcast event creation
    this.wsService.broadcastEvent(event, 'created');
    set.status = 201;
    return { message: 'Event created successfully', event };
  }

  async getEvents({ set }: Context) {
    const events = await this.prisma.event.findMany({
      where: { approved: true },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        createdAt: true,
      },
    });
    set.status = 200;
    return events;
  }

  async approveEvent({ params, set, request }: Context & { params: { id: string } }) {
    const user = (request as any).user;
    if (user.role !== 'ADMIN') {
      set.status = 403;
      throw new Error('Only admins can approve events');
    }
    const event = await this.prisma.event.update({
      where: { id: params.id },
      data: { approved: true },
    });
    if (!event) {
      set.status = 404;
      throw new Error('Event not found');
    }
    // Broadcast event approval
    this.wsService.broadcastEvent(event, 'approved');
    set.status = 200;
    return { message: 'Event approved successfully', event };
  }
}