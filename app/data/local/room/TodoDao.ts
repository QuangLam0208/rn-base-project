import { TodoEntity } from "@/data/model/room/TodoEntity"

/**
 * CRUD interface for the local `todo` table.
 * Mirrors Room's DAO pattern in Android.
 */
export interface TodoDao {
  insert(todo: Omit<TodoEntity, "id">): Promise<void>
  update(todo: TodoEntity): Promise<void>
  delete(id: number): Promise<void>
  loadAll(): Promise<TodoEntity[]>
  findById(id: number): Promise<TodoEntity | null>
}
