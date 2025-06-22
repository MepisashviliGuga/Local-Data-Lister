import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Use the main DATABASE_URL (the pooler) for the application
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });