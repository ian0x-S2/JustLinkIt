import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import * as schema from './schema';
import path from 'node:path';
import { building } from '$app/environment';

const sqlite = new Database('sqlite.db');
sqlite.run('PRAGMA journal_mode = WAL');
sqlite.run('PRAGMA synchronous = NORMAL');
sqlite.run('PRAGMA foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Run migrations on startup (but not during build)
if (!building) {
	try {
		const migrationsFolder = path.resolve('./drizzle');
		migrate(db, { migrationsFolder });
	} catch (e) {
		console.error('Failed to run migrations:', e);
	}
}
