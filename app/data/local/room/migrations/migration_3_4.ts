import { Migration } from "./types"

/**
 * Migration from version 3 to 4:
 * Adds `done_at` timestamp column to `todo` table.
 */
export const migration_3_4: Migration = {
  fromVersion: 3,
  toVersion: 4,
  migrate: (db) => {
    db.execSync("ALTER TABLE todo ADD COLUMN done_at INTEGER")
  },
}
