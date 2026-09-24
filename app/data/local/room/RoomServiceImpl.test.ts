import { AppDatabase } from "./AppDatabase"
import { RoomServiceImpl } from "./RoomServiceImpl"
import { TodoDao } from "./TodoDao"
import { UserDao } from "./UserDao"

describe("RoomServiceImpl", () => {
  it("delegates userDao() to the injected AppDatabase", () => {
    const userDao = {} as UserDao
    const appDatabase = { getUserDao: jest.fn().mockReturnValue(userDao) } as unknown as AppDatabase
    const roomService = new RoomServiceImpl(appDatabase)

    expect(roomService.userDao()).toBe(userDao)
    expect(appDatabase.getUserDao).toHaveBeenCalledTimes(1)
  })

  it("delegates todoDao() to the injected AppDatabase", () => {
    const todoDao = {} as TodoDao
    const appDatabase = { getTodoDao: jest.fn().mockReturnValue(todoDao) } as unknown as AppDatabase
    const roomService = new RoomServiceImpl(appDatabase)

    expect(roomService.todoDao()).toBe(todoDao)
    expect(appDatabase.getTodoDao).toHaveBeenCalledTimes(1)
  })
})
