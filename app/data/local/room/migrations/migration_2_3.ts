import { Migration } from "./types"

/**
 * Migration from version 2 to 3:
 * Adds `priority` column to the existing `todo` table.
 */
export const migration_2_3: Migration = {
  fromVersion: 2,
  toVersion: 3,
  migrate: (db) => {
    db.execSync("ALTER TABLE todo ADD COLUMN priority TEXT DEFAULT 'medium'")
  },
}
