/**
 * Prisma Client Instance
 * 
 * Singleton instance of Prisma Client for database access.
 */

import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Handle connection
prisma.$connect()
  .then(() => {
    logger.info('Prisma Client connected');
  })
  .catch((error) => {
    logger.error('Prisma Client connection failed', { error });
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma Client disconnected');
});

export default prisma;

