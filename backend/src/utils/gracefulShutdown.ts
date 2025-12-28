import logger from '../config/logger';
import prisma from '../config/prisma';
import { Server } from 'http';

export const setupGracefulShutdown = (server: Server): void => {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    // Stop accepting new requests
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close Prisma database connections
        await prisma.$disconnect();
        logger.info('Database connections closed');

        // Exit process
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error });
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  // Handle termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error });
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    shutdown('unhandledRejection');
  });
};
