import { openDatabaseSync } from "expo-sqlite"

import { AppDatabase, DATABASE_VERSION } from "./AppDatabase"
import { TodoDaoImpl } from "./TodoDaoImpl"
import { UserDaoImpl } from "./UserDaoImpl"

const mockExecSync = jest.fn()
const mockGetFirstSync = jest.fn()

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: mockExecSync,
    getFirstSync: mockGetFirstSync,
  })),
}))

describe("AppDatabase", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetFirstSync.mockReturnValue({ user_version: 0 })
  })

  it("opens room.db and creates tables for fresh install (version 0)", () => {
    new AppDatabase()

    expect(openDatabaseSync).toHaveBeenCalledWith("room.db")
    expect(mockGetFirstSync).toHaveBeenCalledWith("PRAGMA user_version")
    expect(mockExecSync).toHaveBeenCalledWith(
      "CREATE TABLE IF NOT EXISTS user (user_id INTEGER PRIMARY KEY NOT NULL)",
    )
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS todo"),
    )
    expect(mockExecSync).toHaveBeenCalledWith(`PRAGMA user_version = ${DATABASE_VERSION}`)
  })

  it("runs incremental migrations when upgrading from older version", () => {
    mockGetFirstSync.mockReturnValue({ user_version: 1 })

    new AppDatabase()

    // Should run migration 2 and 3
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS todo"),
    )
    expect(mockExecSync).toHaveBeenCalledWith(
      "ALTER TABLE todo ADD COLUMN priority TEXT DEFAULT 'medium'",
    )
    expect(mockExecSync).toHaveBeenCalledWith(`PRAGMA user_version = ${DATABASE_VERSION}`)
  })

  it("exposes UserDao and TodoDao backed by the connection", () => {
    const db = new AppDatabase()
    expect(db.getUserDao()).toBeInstanceOf(UserDaoImpl)
    expect(db.getTodoDao()).toBeInstanceOf(TodoDaoImpl)
  })
})
