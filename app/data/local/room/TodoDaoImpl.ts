import { SQLiteDatabase } from "expo-sqlite"

import { TodoEntity, TodoPriority } from "@/data/model/room/TodoEntity"

import { TodoDao } from "./TodoDao"

interface TodoRow {
  id: number
  title: string
  is_done: number
  priority: string
  created_at: number
  done_at: number | null
}

function toEntity(row: TodoRow): TodoEntity {
  return {
    id: row.id,
    title: row.title,
    isDone: Boolean(row.is_done),
    priority: (row.priority as TodoPriority) || "medium",
    createdAt: row.created_at ?? 0,
    doneAt: row.done_at ?? null,
  }
}

/**
 * expo-sqlite-backed implementation of TodoDao.
 * Executes SQLite queries and maps row data to TodoEntity.
 */
export class TodoDaoImpl implements TodoDao {
  constructor(private db: SQLiteDatabase) {}

  async insert(todo: Omit<TodoEntity, "id">): Promise<void> {
    await this.db.runAsync(
      "INSERT INTO todo (title, is_done, priority, created_at, done_at) VALUES (?, ?, ?, ?, ?)",
      todo.title,
      todo.isDone ? 1 : 0,
      todo.priority,
      todo.createdAt,
      todo.doneAt ?? null,
    )
  }

  async update(todo: TodoEntity): Promise<void> {
    if (todo.id === undefined) return
    await this.db.runAsync(
      "UPDATE todo SET title = ?, is_done = ?, priority = ?, done_at = ? WHERE id = ?",
      todo.title,
      todo.isDone ? 1 : 0,
      todo.priority,
      todo.doneAt ?? null,
      todo.id,
    )
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync("DELETE FROM todo WHERE id = ?", id)
  }

  async loadAll(): Promise<TodoEntity[]> {
    const rows = await this.db.getAllAsync<TodoRow>("SELECT * FROM todo ORDER BY id DESC")
    return rows.map(toEntity)
  }

  async findById(id: number): Promise<TodoEntity | null> {
    const row = await this.db.getFirstAsync<TodoRow>("SELECT * FROM todo WHERE id = ?", id)
    return row ? toEntity(row) : null
  }
}
