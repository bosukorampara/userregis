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
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;
  const database = process.env.MYSQL_DATABASE || 'userregis';
  const username = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';

  // Use PostgreSQL for production (Render), MySQL for local if needed
  const dialect = process.env.NODE_ENV === 'production' ? 'postgres' : 'mysql';
  
  sequelize = new Sequelize(database, username, password, {
    host,
    port,
    dialect,
    logging: false,
    // Add SSL configuration for production PostgreSQL
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
    throw err;
  }
}

export { sequelize, testConnection };
