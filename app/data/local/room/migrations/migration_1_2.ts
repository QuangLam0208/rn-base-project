import { Migration } from "./types"

/**
 * Migration from version 1 to 2:
 * Creates the initial `todo` table with basic fields.
 */
export const migration_1_2: Migration = {
  fromVersion: 1,
  toVersion: 2,
  migrate: (db) => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS todo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        is_done INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT 0
      )
    `)
  },
}
