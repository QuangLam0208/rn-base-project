import { SQLiteDatabase } from "expo-sqlite"

import { TodoDaoImpl } from "./TodoDaoImpl"

function mockDb(): jest.Mocked<
  Pick<SQLiteDatabase, "runAsync" | "getAllAsync" | "getFirstAsync">
> {
  return {
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
  }
}

describe("TodoDaoImpl", () => {
  it("insert writes a new todo row", async () => {
    const db = mockDb()
    const dao = new TodoDaoImpl(db as unknown as SQLiteDatabase)

    await dao.insert({
      title: "Buy milk",
      isDone: false,
      priority: "high",
      createdAt: 1000,
      doneAt: null,
    })

    expect(db.runAsync).toHaveBeenCalledWith(
      "INSERT INTO todo (title, is_done, priority, created_at, done_at) VALUES (?, ?, ?, ?, ?)",
      "Buy milk",
      0,
      "high",
      1000,
      null,
    )
  })

  it("update updates an existing todo row", async () => {
    const db = mockDb()
    const dao = new TodoDaoImpl(db as unknown as SQLiteDatabase)

    await dao.update({
      id: 5,
      title: "Buy coffee",
      isDone: true,
      priority: "low",
      createdAt: 2000,
      doneAt: 3000,
    })

    expect(db.runAsync).toHaveBeenCalledWith(
      "UPDATE todo SET title = ?, is_done = ?, priority = ?, done_at = ? WHERE id = ?",
      "Buy coffee",
      1,
      "low",
      3000,
      5,
    )
  })

  it("delete removes the todo by id", async () => {
    const db = mockDb()
    const dao = new TodoDaoImpl(db as unknown as SQLiteDatabase)

    await dao.delete(12)

    expect(db.runAsync).toHaveBeenCalledWith("DELETE FROM todo WHERE id = ?", 12)
  })

  it("loadAll maps rows to TodoEntities", async () => {
    const db = mockDb()
    db.getAllAsync.mockResolvedValue([
      { id: 2, title: "Task 2", is_done: 1, priority: "high", created_at: 200, done_at: 250 },
      { id: 1, title: "Task 1", is_done: 0, priority: "medium", created_at: 100, done_at: null },
    ])
    const dao = new TodoDaoImpl(db as unknown as SQLiteDatabase)

    const todos = await dao.loadAll()

    expect(db.getAllAsync).toHaveBeenCalledWith("SELECT * FROM todo ORDER BY id DESC")
    expect(todos).toEqual([
      { id: 2, title: "Task 2", isDone: true, priority: "high", createdAt: 200, doneAt: 250 },
      { id: 1, title: "Task 1", isDone: false, priority: "medium", createdAt: 100, doneAt: null },
    ])
  })

  it("findById returns mapped todo when found", async () => {
    const db = mockDb()
    db.getFirstAsync.mockResolvedValue({
      id: 3,
      title: "Task 3",
      is_done: 0,
      priority: "low",
      created_at: 300,
      done_at: null,
    })
    const dao = new TodoDaoImpl(db as unknown as SQLiteDatabase)

    const todo = await dao.findById(3)

    expect(db.getFirstAsync).toHaveBeenCalledWith("SELECT * FROM todo WHERE id = ?", 3)
    expect(todo).toEqual({
      id: 3,
      title: "Task 3",
      isDone: false,
      priority: "low",
      createdAt: 300,
      doneAt: null,
    })
  })

  it("findById returns null when row not found", async () => {
    const db = mockDb()
    db.getFirstAsync.mockResolvedValue(null)
    const dao = new TodoDaoImpl(db as unknown as SQLiteDatabase)

    const todo = await dao.findById(99)

    expect(todo).toBeNull()
  })
})
