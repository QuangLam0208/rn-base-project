import { SQLiteDatabase } from "expo-sqlite"

export type MigrationFn = (db: SQLiteDatabase) => void

/**
 * Represents a single database migration step between schema versions.
 * Mirrors Android Room's `Migration(startVersion, endVersion)`.
 */
export interface Migration {
  readonly fromVersion: number
  readonly toVersion: number
  readonly migrate: MigrationFn
}
