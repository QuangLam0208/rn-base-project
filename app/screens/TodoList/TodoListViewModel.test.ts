import { TodoListViewModel } from "./TodoListViewModel"

describe("TodoListViewModel", () => {
  let vm: TodoListViewModel
  let mockTodoDao: {
    loadAll: jest.Mock
    insert: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }

  beforeEach(() => {
    mockTodoDao = {
      loadAll: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    }

    vm = new TodoListViewModel()
    ;(
      vm as unknown as {
        repository: { roomService: { todoDao: () => typeof mockTodoDao } }
      }
    ).repository = {
      roomService: {
        todoDao: () => mockTodoDao,
      },
    }
  })

  it("initializes with empty state", () => {
    expect(vm.todos).toEqual([])
    expect(vm.filteredTodos).toEqual([])
    expect(vm.filter).toBe("all")
    expect(vm.newTitle).toBe("")
    expect(vm.newPriority).toBe("medium")
    expect(vm.isLoading).toBe(false)
    expect(vm.error).toBeNull()
  })

  it("loadTodos populates todos from DAO", async () => {
    const mockList = [
      { id: 1, title: "Task 1", isDone: false, priority: "high" as const, createdAt: 100 },
    ]
    mockTodoDao.loadAll.mockResolvedValueOnce(mockList)

    await vm.loadTodos()

    expect(mockTodoDao.loadAll).toHaveBeenCalledTimes(1)
    expect(vm.todos).toEqual(mockList)
  })

  it("addTodo inserts a new todo and reloads list", async () => {
    vm.setNewTitle("Buy groceries")
    vm.setNewPriority("high")

    const updatedList = [
      { id: 1, title: "Buy groceries", isDone: false, priority: "high" as const, createdAt: 100 },
    ]
    mockTodoDao.loadAll.mockResolvedValueOnce(updatedList)

    await vm.addTodo()

    expect(mockTodoDao.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Buy groceries",
        isDone: false,
        priority: "high",
      }),
    )
    expect(vm.newTitle).toBe("")
    expect(vm.newPriority).toBe("medium")
    expect(vm.todos).toEqual(updatedList)
  })

  it("addTodo does nothing if title is empty", async () => {
    vm.setNewTitle("   ")

    await vm.addTodo()

    expect(mockTodoDao.insert).not.toHaveBeenCalled()
  })

  it("toggleTodo calls update with toggled isDone and sets doneAt timestamp", async () => {
    const todo = {
      id: 2,
      title: "Clean room",
      isDone: false,
      priority: "low" as const,
      createdAt: 200,
      doneAt: null,
    }

    const before = Date.now()
    await vm.toggleTodo(todo)
    const after = Date.now()

    expect(mockTodoDao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: todo.id,
        title: todo.title,
        priority: todo.priority,
        createdAt: todo.createdAt,
        isDone: true,
      }),
    )
    const updatedPayload = mockTodoDao.update.mock.calls[0][0]
    expect(updatedPayload.doneAt).toBeGreaterThanOrEqual(before)
    expect(updatedPayload.doneAt).toBeLessThanOrEqual(after)
    expect(mockTodoDao.loadAll).toHaveBeenCalled()
  })

  it("toggleTodo resets doneAt to null when unchecking a completed todo", async () => {
    const completedTodo = {
      id: 3,
      title: "Do workout",
      isDone: true,
      priority: "medium" as const,
      createdAt: 100,
      doneAt: 500,
    }

    await vm.toggleTodo(completedTodo)

    expect(mockTodoDao.update).toHaveBeenCalledWith({
      ...completedTodo,
      isDone: false,
      doneAt: null,
    })
  })

  it("setFilter updates filter and filteredTodos correctly filters and sorts done items by doneAt desc", () => {
    const t1 = { id: 1, title: "Task 1", isDone: false, priority: "low" as const, createdAt: 100 }
    const t2 = {
      id: 2,
      title: "Task 2 (done first)",
      isDone: true,
      priority: "medium" as const,
      createdAt: 200,
      doneAt: 1000,
    }
    const t3 = {
      id: 3,
      title: "Task 3 (done later)",
      isDone: true,
      priority: "high" as const,
      createdAt: 300,
      doneAt: 2000,
    }

    vm.todos = [t1, t2, t3]

    // Default "all"
    expect(vm.filter).toBe("all")
    expect(vm.filteredTodos).toEqual([t1, t2, t3])

    // "active" filter
    vm.setFilter("active")
    expect(vm.filter).toBe("active")
    expect(vm.filteredTodos).toEqual([t1])

    // "done" filter (sorted by doneAt desc: t3 then t2)
    vm.setFilter("done")
    expect(vm.filter).toBe("done")
    expect(vm.filteredTodos).toEqual([t3, t2])
  })

  it("deleteTodo removes the item by id", async () => {
    await vm.deleteTodo(5)

    expect(mockTodoDao.delete).toHaveBeenCalledWith(5)
    expect(mockTodoDao.loadAll).toHaveBeenCalled()
  })
})
