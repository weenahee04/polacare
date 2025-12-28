import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';
import logger from '../config/logger';

dotenv.config();

const migrate = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'polacare',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    logger.info('Connected to database for migration');

    // Read migration file
    const migrationPath = join(__dirname, 'migrations', '001_create_tables.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await client.query(sql);
    logger.info('Migration completed successfully');

    await client.end();
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', { error });
    await client.end();
    process.exit(1);
  }
};

migrate();
