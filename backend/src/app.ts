import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { env } from './config/env';
import { generalLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { initWebSocket } from './shared/websocket';
import { migrate } from './config/migrate';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import transactionsRoutes from './modules/transactions/transactions.routes';
import goalsRoutes from './modules/goals/goals.routes';
import alertsRoutes from './modules/alerts/alerts.routes';
import reportsRoutes from './modules/reports/reports.routes';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api', reportsRoutes);

// Error handler (must be last)
app.use(errorHandler);

// WebSocket
initWebSocket(httpServer);

// Start server with auto-migration
async function start() {
  try {
    await migrate();
    httpServer.listen(env.PORT, () => {
      console.log(`🚀 FinAI Backend running on port ${env.PORT}`);
      console.log(`📊 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
