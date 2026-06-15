import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../drizzle/schema';

type DB = LibSQLDatabase<typeof schema> | BetterSQLite3Database<typeof schema>;

const url = process.env.TURSO_URL || 'file:local.db';
const isTurso = url.startsWith('libsql://');

let _db: DB = null as unknown as DB;

if (isTurso) {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const client = createClient({ url, authToken: process.env.TURSO_TOKEN });
  _db = drizzle(client, { schema }) as DB;
} else {
  const Database = (await import('better-sqlite3')).default;
  const { drizzle } = await import('drizzle-orm/better-sqlite3');
  const sqlite = new Database(url.replace('file:', ''));
  _db = drizzle(sqlite, { schema }) as DB;
}

export const db = _db;
export { schema };
