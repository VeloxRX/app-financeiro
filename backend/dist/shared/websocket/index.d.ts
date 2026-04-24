import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
/**
 * Initialize WebSocket server for real-time alert notifications.
 * Clients authenticate via JWT token in the auth handshake.
 */
export declare function initWebSocket(httpServer: HttpServer): SocketServer;
/** Send real-time alert to a specific user */
export declare function emitAlert(userId: string, alert: any): void;
/** Send a dashboard refresh signal to a specific user */
export declare function emitDashboardUpdate(userId: string): void;
//# sourceMappingURL=index.d.ts.map