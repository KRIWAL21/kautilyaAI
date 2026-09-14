import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class SiteVisitGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SiteVisitGateway.name);

  afterInit() {
    this.logger.log('SiteVisit WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ── Room management ─────────────────────────────────────────────
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room: ${data.room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
  }

  // ── Broadcast helpers (called by SiteVisitsService) ─────────────

  /**
   * Emit a site visit event to all connected parties:
   *   - broker:{brokerId}
   *   - client:{clientId}
   *   - builder:{builderId}
   */
  broadcastSiteVisitUpdate(
    visit: any,
    eventName:
      | 'site-visit:booked'
      | 'site-visit:confirmed'
      | 'site-visit:completed'
      | 'site-visit:cancelled'
      | 'site-visit:updated',
  ) {
    const rooms: string[] = [];

    if (visit.broker?._id || visit.broker) {
      rooms.push(`broker:${visit.broker?._id ?? visit.broker}`);
    }
    if (visit.client?._id || visit.client) {
      rooms.push(`client:${visit.client?._id ?? visit.client}`);
    }
    if (visit.builder?._id || visit.builder) {
      rooms.push(`builder:${visit.builder?._id ?? visit.builder}`);
    }

    for (const room of rooms) {
      this.server.to(room).emit(eventName, { visit });
    }

    this.logger.log(
      `Broadcast [${eventName}] to rooms: ${rooms.join(', ')}`,
    );
  }
}
