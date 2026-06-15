import { defineConfig } from 'drizzle-kit';

const url = process.env.TURSO_URL || 'file:local.db';
const isTurso = url.startsWith('libsql://');

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: isTurso ? 'turso' : 'sqlite',
  dbCredentials: isTurso
    ? { url, authToken: process.env.TURSO_TOKEN! }
    : { url },
});
