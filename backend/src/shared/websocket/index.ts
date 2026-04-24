import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

let io: SocketServer;

/**
 * Initialize WebSocket server for real-time alert notifications.
 * Clients authenticate via JWT token in the auth handshake.
 */
export function initWebSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: env.FRONTEND_URL, methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);
    console.log(`🔌 User ${userId} connected via WebSocket`);

    socket.on('disconnect', () => {
      console.log(`🔌 User ${userId} disconnected`);
    });
  });

  return io;
}

/** Send real-time alert to a specific user */
export function emitAlert(userId: string, alert: any): void {
  if (io) {
    io.to(`user:${userId}`).emit('alert', alert);
  }
}

/** Send a dashboard refresh signal to a specific user */
export function emitDashboardUpdate(userId: string): void {
  if (io) {
    io.to(`user:${userId}`).emit('dashboard:refresh');
  }
}
