import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// If USE_SQLITE is set to '1', use a local SQLite file for quick local testing.
const useSqlite = process.env.USE_SQLITE === '1' || process.env.SQLITE === '1';

let sequelize;
if (useSqlite) {
  const storage = process.env.SQLITE_STORAGE || path.join(process.cwd(), 'server', 'dev.sqlite');
  sequelize = new Sequelize({ dialect: 'sqlite', storage, logging: false });
} else {
  // PostgreSQL configuration - use consistent environment variables
  const host = process.env.POSTGRES_HOST || process.env.DATABASE_URL ? undefined : 'localhost';
  const database = process.env.POSTGRES_DATABASE || 'userregis';
  const username = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || '';
  const port = process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432;

  // Use DATABASE_URL if provided (common in production), otherwise use individual variables
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    });
  } else {
    sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    });
  }
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(useSqlite ? 'Connected to SQLite' : 'Connected to PostgreSQL');
  } catch (err) {
    console.error('Unable to connect to database:', err);
    console.error('Database connection details:', {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DATABASE || 'userregis',
      username: process.env.POSTGRES_USER || 'postgres',
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
    throw err;
  }
}

export { sequelize, testConnection };
