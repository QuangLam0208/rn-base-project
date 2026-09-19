import { SQLiteDatabase } from "expo-sqlite"

import { UserDaoImpl } from "./UserDaoImpl"

function mockDb(): jest.Mocked<
  Pick<SQLiteDatabase, "runAsync" | "getAllAsync" | "getFirstAsync" | "withTransactionAsync">
> {
  return {
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    withTransactionAsync: jest.fn((task: () => Promise<void>) => task()),
  }
}

describe("UserDaoImpl", () => {
  it("insert writes the row via an upsert", async () => {
    const db = mockDb()
    const dao = new UserDaoImpl(db as unknown as SQLiteDatabase)

    await dao.insert({ userId: 42 })

    expect(db.runAsync).toHaveBeenCalledWith("INSERT OR REPLACE INTO user (user_id) VALUES (?)", 42)
  })

  it("insertAll inserts every user inside one transaction", async () => {
    const db = mockDb()
    const dao = new UserDaoImpl(db as unknown as SQLiteDatabase)

    await dao.insertAll([{ userId: 1 }, { userId: 2 }])

    expect(db.withTransactionAsync).toHaveBeenCalledTimes(1)
    expect(db.runAsync).toHaveBeenNthCalledWith(
      1,
      "INSERT OR REPLACE INTO user (user_id) VALUES (?)",
      1,
    )
    expect(db.runAsync).toHaveBeenNthCalledWith(
      2,
      "INSERT OR REPLACE INTO user (user_id) VALUES (?)",
      2,
    )
  })

  it("loadAll maps every row's user_id column to userId", async () => {
    const db = mockDb()
    db.getAllAsync.mockResolvedValue([{ user_id: 1 }, { user_id: 2 }])
    const dao = new UserDaoImpl(db as unknown as SQLiteDatabase)

    const users = await dao.loadAll()

    expect(db.getAllAsync).toHaveBeenCalledWith("SELECT * FROM user")
    expect(users).toEqual([{ userId: 1 }, { userId: 2 }])
  })

  it("findById returns the mapped row when it exists", async () => {
    const db = mockDb()
    db.getFirstAsync.mockResolvedValue({ user_id: 7 })
    const dao = new UserDaoImpl(db as unknown as SQLiteDatabase)

    const user = await dao.findById(7)

    expect(db.getFirstAsync).toHaveBeenCalledWith("SELECT * FROM user WHERE user_id = ?", 7)
    expect(user).toEqual({ userId: 7 })
  })

  it("findById returns null when no row matches", async () => {
    const db = mockDb()
    db.getFirstAsync.mockResolvedValue(null)
    const dao = new UserDaoImpl(db as unknown as SQLiteDatabase)

    const user = await dao.findById(99)

    expect(user).toBeNull()
  })

  it("delete removes the row by user_id", async () => {
    const db = mockDb()
    const dao = new UserDaoImpl(db as unknown as SQLiteDatabase)

    await dao.delete({ userId: 42 })

    expect(db.runAsync).toHaveBeenCalledWith("DELETE FROM user WHERE user_id = ?", 42)
  })
})
