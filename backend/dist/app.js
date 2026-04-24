"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const env_1 = require("./config/env");
const rateLimit_1 = require("./middleware/rateLimit");
const errorHandler_1 = require("./middleware/errorHandler");
const websocket_1 = require("./shared/websocket");
const migrate_1 = require("./config/migrate");
// Route imports
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const categories_routes_1 = __importDefault(require("./modules/categories/categories.routes"));
const transactions_routes_1 = __importDefault(require("./modules/transactions/transactions.routes"));
const goals_routes_1 = __importDefault(require("./modules/goals/goals.routes"));
const alerts_routes_1 = __importDefault(require("./modules/alerts/alerts.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.env.FRONTEND_URL, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(rateLimit_1.generalLimiter);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/categories', categories_routes_1.default);
app.use('/api/transactions', transactions_routes_1.default);
app.use('/api/goals', goals_routes_1.default);
app.use('/api/alerts', alerts_routes_1.default);
app.use('/api', reports_routes_1.default);
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
// WebSocket
(0, websocket_1.initWebSocket)(httpServer);
// Start server with auto-migration
async function start() {
    try {
        await (0, migrate_1.migrate)();
        httpServer.listen(env_1.env.PORT, () => {
            console.log(`🚀 FinAI Backend running on port ${env_1.env.PORT}`);
            console.log(`📊 Environment: ${env_1.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
start();
exports.default = app;
//# sourceMappingURL=app.js.map