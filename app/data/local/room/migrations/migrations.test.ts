import { SQLiteDatabase } from "expo-sqlite"

import {
  createLatestSchema,
  DATABASE_VERSION,
  MIGRATIONS,
  runMigrations,
} from "./index"

describe("Room DB Migrations Module", () => {
  let mockDb: { execSync: jest.Mock }

  beforeEach(() => {
    mockDb = {
      execSync: jest.fn(),
    }
  })

  it("exports a valid target DATABASE_VERSION", () => {
    expect(DATABASE_VERSION).toBeGreaterThanOrEqual(4)
  })

  it("createLatestSchema generates full schema in one step", () => {
    createLatestSchema(mockDb as unknown as SQLiteDatabase)

    expect(mockDb.execSync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS user"),
    )
    expect(mockDb.execSync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS todo"),
    )
    // Ensures latest fields like priority and done_at are present in fresh install schema
    expect(mockDb.execSync).toHaveBeenCalledWith(
      expect.stringContaining("priority TEXT DEFAULT 'medium'"),
    )
    expect(mockDb.execSync).toHaveBeenCalledWith(
      expect.stringContaining("done_at INTEGER"),
    )
  })

  it("runMigrations executes sequentially from currentVersion to targetVersion", () => {
    // Upgrading from v1 to v4
    runMigrations(mockDb as unknown as SQLiteDatabase, 1, 4)

    // Should execute migration 1->2 (create todo table)
    expect(mockDb.execSync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS todo"),
    )
    // Should execute migration 2->3 (add priority column)
    expect(mockDb.execSync).toHaveBeenCalledWith(
      "ALTER TABLE todo ADD COLUMN priority TEXT DEFAULT 'medium'",
    )
    // Should execute migration 3->4 (add done_at column)
    expect(mockDb.execSync).toHaveBeenCalledWith(
      "ALTER TABLE todo ADD COLUMN done_at INTEGER",
    )
  })

  it("runMigrations only runs pending migrations (e.g. v3 to v4)", () => {
    runMigrations(mockDb as unknown as SQLiteDatabase, 3, 4)

    // Should NOT execute migration 1->2 or 2->3
    expect(mockDb.execSync).not.toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS todo"),
    )
    expect(mockDb.execSync).not.toHaveBeenCalledWith(
      "ALTER TABLE todo ADD COLUMN priority TEXT DEFAULT 'medium'",
    )
    // Should only execute migration 3->4
    expect(mockDb.execSync).toHaveBeenCalledWith(
      "ALTER TABLE todo ADD COLUMN done_at INTEGER",
    )
  })

  it("runMigrations does nothing if currentVersion is already at targetVersion", () => {
    runMigrations(mockDb as unknown as SQLiteDatabase, 4, 4)

    expect(mockDb.execSync).not.toHaveBeenCalled()
  })

  it("has migrations registered in ascending version order", () => {
    for (let i = 0; i < MIGRATIONS.length; i++) {
      expect(MIGRATIONS[i].fromVersion).toBe(i + 1)
      expect(MIGRATIONS[i].toVersion).toBe(i + 2)
    }
  })
})
