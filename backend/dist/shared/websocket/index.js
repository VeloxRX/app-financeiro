"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.emitAlert = emitAlert;
exports.emitDashboardUpdate = emitDashboardUpdate;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
let io;
/**
 * Initialize WebSocket server for real-time alert notifications.
 * Clients authenticate via JWT token in the auth handshake.
 */
function initWebSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: env_1.env.FRONTEND_URL, methods: ['GET', 'POST'] },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            socket.userId = payload.userId;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        socket.join(`user:${userId}`);
        console.log(`🔌 User ${userId} connected via WebSocket`);
        socket.on('disconnect', () => {
            console.log(`🔌 User ${userId} disconnected`);
        });
    });
    return io;
}
/** Send real-time alert to a specific user */
function emitAlert(userId, alert) {
    if (io) {
        io.to(`user:${userId}`).emit('alert', alert);
    }
}
/** Send a dashboard refresh signal to a specific user */
function emitDashboardUpdate(userId) {
    if (io) {
        io.to(`user:${userId}`).emit('dashboard:refresh');
    }
}
//# sourceMappingURL=index.js.map