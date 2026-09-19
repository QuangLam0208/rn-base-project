import { openDatabaseSync } from "expo-sqlite"

import { AppDatabase } from "./AppDatabase"
import { UserDaoImpl } from "./UserDaoImpl"

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({ execSync: jest.fn() })),
}))

describe("AppDatabase", () => {
  it("opens the room.db database and creates the user table", () => {
    new AppDatabase()

    expect(openDatabaseSync).toHaveBeenCalledWith("room.db")
    const db = (openDatabaseSync as jest.Mock).mock.results[0].value
    expect(db.execSync).toHaveBeenCalledWith(
      "CREATE TABLE IF NOT EXISTS user (user_id INTEGER PRIMARY KEY NOT NULL)",
    )
  })

  it("exposes a UserDao backed by that same connection", () => {
    const db = new AppDatabase()
    expect(db.getUserDao()).toBeInstanceOf(UserDaoImpl)
  })
})
