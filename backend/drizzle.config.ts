import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Use the DIRECT_URL for migrations!
    url: process.env.DIRECT_URL!, 
  },
  verbose: true,
  strict: true,
});