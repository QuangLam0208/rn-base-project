export type TodoPriority = "low" | "medium" | "high"

/**
 * Local SQLite row shape for the `todo` table.
 * Demonstrates Room DB schema with migration support.
 */
export interface TodoEntity {
  id?: number
  title: string
  isDone: boolean
  priority: TodoPriority
  createdAt: number
  doneAt?: number | null
}
