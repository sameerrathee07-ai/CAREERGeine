import 'dotenv/config';
import app from './app.js';
import { initEmail } from './services/email.js';
import logger from './services/logger.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  await initEmail();
  console.log(`\n  🚀 CareerGenie API Server`);
  console.log(`  ├─ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ├─ Port:        ${PORT}`);
  console.log(`  ├─ Frontend:    ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`  └─ Health:      http://localhost:${PORT}/api/health\n`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
