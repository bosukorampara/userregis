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
  // Expect environment variables: MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const database = process.env.MYSQL_DATABASE || 'userregis';
  const username = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';

  // Use PostgreSQL for production, MySQL for local
  const dialect = process.env.NODE_ENV === 'production' ? 'postgres' : 'mysql';
  
  // For PostgreSQL, we need to use the correct port
  const port = process.env.NODE_ENV === 'production' ? 5432 : (process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306);
  
  sequelize = new Sequelize(database, username, password, {
    host,
    port,
    dialect,
    logging: false,
    // Add SSL configuration for production MySQL
    ...(process.env.NODE_ENV === 'production' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(useSqlite ? 'Connected to SQLite' : `Connected to ${process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'MySQL'}`);
  } catch (err) {
    console.error('Unable to connect to database:', err);
    console.error('Database connection details:', {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      username: process.env.MYSQL_USER,
      nodeEnv: process.env.NODE_ENV
    });
    throw err;
  }
}

export { sequelize, testConnection };
