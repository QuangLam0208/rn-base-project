import { SQLiteDatabase } from "expo-sqlite"

import { migration_1_2 } from "./migration_1_2"
import { migration_2_3 } from "./migration_2_3"
import { migration_3_4 } from "./migration_3_4"
import { Migration } from "./types"

export * from "./types"
export { migration_1_2 } from "./migration_1_2"
export { migration_2_3 } from "./migration_2_3"
export { migration_3_4 } from "./migration_3_4"

/**
 * Current target database version.
 * Increment this whenever adding a new migration.
 */
export const DATABASE_VERSION = 4

/**
 * Registry of all available migrations in ascending order.
 * Mirrors Room's `.addMigrations(...)` in Android.
 */
export const MIGRATIONS: Migration[] = [migration_1_2, migration_2_3, migration_3_4]

/**
 * Creates the full, up-to-date schema for brand new installs (version = 0).
 * Bypasses incremental migrations to optimize initialization performance.
 */
export function createLatestSchema(db: SQLiteDatabase): void {
  db.execSync("CREATE TABLE IF NOT EXISTS user (user_id INTEGER PRIMARY KEY NOT NULL)")
  db.execSync(`
    CREATE TABLE IF NOT EXISTS todo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      is_done INTEGER NOT NULL DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      created_at INTEGER NOT NULL DEFAULT 0,
      done_at INTEGER
    )
  `)
}

/**
 * Runs incremental migrations sequentially from currentVersion up to targetVersion.
 * Ensures data integrity across app updates.
 */
export function runMigrations(
  db: SQLiteDatabase,
  currentVersion: number,
  targetVersion: number = DATABASE_VERSION,
): void {
  for (let v = currentVersion + 1; v <= targetVersion; v++) {
    const migration = MIGRATIONS.find((m) => m.toVersion === v)
    if (migration) {
      migration.migrate(db)
    }
  }
}
