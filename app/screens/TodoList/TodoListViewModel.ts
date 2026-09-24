import { injectable } from "inversify"
import { actionBound, computed, makeObservable, observable, runInAction } from "mobx"

import { TodoEntity, TodoPriority } from "@/data/model/room/TodoEntity"
import { translate } from "@/i18n/translate"
import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

export type TodoFilter = "all" | "active" | "done"

/**
 * ViewModel for the TodoList screen.
 * Demonstrates interacting with SQLite/Room DB through this.repository.roomService.
 */
@injectable()
export class TodoListViewModel extends BaseViewModel {
  todos: TodoEntity[] = []
  newTitle = ""
  newPriority: TodoPriority = "medium"
  filter: TodoFilter = "all"

  constructor() {
    super()
    makeObservable(this, {
      todos: observable,
      newTitle: observable,
      newPriority: observable,
      filter: observable,
      filteredTodos: computed,
      isLoading: observable,
      error: observable,
      loadTodos: actionBound,
      setNewTitle: actionBound,
      setNewPriority: actionBound,
      setFilter: actionBound,
      addTodo: actionBound,
      toggleTodo: actionBound,
      deleteTodo: actionBound,
    })
  }

  get filteredTodos(): TodoEntity[] {
    if (this.filter === "active") {
      return this.todos.filter((t) => !t.isDone)
    }
    if (this.filter === "done") {
      return this.todos
        .filter((t) => t.isDone)
        .slice()
        .sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))
    }
    return this.todos
  }

  async loadTodos(): Promise<void> {
    await this.runAction(async () => {
      const items = await this.repository.roomService.todoDao().loadAll()
      runInAction(() => {
        this.todos = items
      })
    })
  }

  setNewTitle(title: string): void {
    this.newTitle = title
  }

  setNewPriority(priority: TodoPriority): void {
    this.newPriority = priority
  }

  setFilter(filter: TodoFilter): void {
    this.filter = filter
  }

  async addTodo(): Promise<void> {
    const trimmedTitle = this.newTitle.trim()
    if (!trimmedTitle) return

    await this.runAction(async () => {
      await this.repository.roomService.todoDao().insert({
        title: trimmedTitle,
        isDone: false,
        priority: this.newPriority,
        createdAt: Date.now(),
      })
      const items = await this.repository.roomService.todoDao().loadAll()
      runInAction(() => {
        this.newTitle = ""
        this.newPriority = "medium"
        this.todos = items
      })
      this.showSuccessMessage(translate("todoListScreen:toastAdded"))
    })
  }

  async toggleTodo(todo: TodoEntity): Promise<void> {
    if (todo.id === undefined) return

    const nextIsDone = !todo.isDone
    const nextDoneAt = nextIsDone ? Date.now() : null

    await this.runAction(async () => {
      await this.repository.roomService.todoDao().update({
        ...todo,
        isDone: nextIsDone,
        doneAt: nextDoneAt,
      })
      const items = await this.repository.roomService.todoDao().loadAll()
      runInAction(() => {
        this.todos = items
      })
    })
  }

  async deleteTodo(id: number): Promise<void> {
    await this.runAction(async () => {
      await this.repository.roomService.todoDao().delete(id)
      const items = await this.repository.roomService.todoDao().loadAll()
      runInAction(() => {
        this.todos = items
      })
      this.showNormalMessage(translate("todoListScreen:toastDeleted"))
    })
  }
}
