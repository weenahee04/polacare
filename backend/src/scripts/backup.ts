import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import logger from '../config/logger';

dotenv.config();

const execAsync = promisify(exec);

const backupDatabase = async (): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `polacare-backup-${timestamp}.sql`);

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    database: process.env.DB_NAME || 'polacare',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  };

  const pgDumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F c -f ${backupFile}`;

  try {
    logger.info('Starting database backup', { backupFile });
    await execAsync(pgDumpCommand);
    logger.info('Database backup completed successfully', { backupFile });

    // Cleanup old backups (keep last 7 days)
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        logger.info('Deleted old backup', { file });
      }
    }
  } catch (error) {
    logger.error('Database backup failed', { error });
    throw error;
  }
};

// Run backup if called directly
if (require.main === module) {
  backupDatabase()
    .then(() => {
      logger.info('Backup script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Backup script failed', { error });
      process.exit(1);
    });
}

export default backupDatabase;

