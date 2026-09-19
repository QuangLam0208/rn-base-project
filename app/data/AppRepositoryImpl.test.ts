import { openDatabaseSync } from "expo-sqlite"

import { StorageService } from "@/data/local/storage/StorageService"
import { ApiServiceImpl } from "@/data/remote/api/ApiServiceImpl"

import { AppRepositoryImpl } from "./AppRepositoryImpl"

jest.mock("@/data/remote/api/ApiServiceImpl")
// expo-sqlite has no jest-expo mock — see data/local/room/AppDatabase.test.ts.
// This confirms AppRepositoryImpl.roomService really is lazy: merely
// constructing the repository (or reading .apiService) must not touch it.
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({ execSync: jest.fn() })),
}))

describe("AppRepositoryImpl", () => {
  it("exposes the injected ApiService as .apiService without touching expo-sqlite", () => {
    const repo = new AppRepositoryImpl()

    expect(repo.apiService).toBeInstanceOf(ApiServiceImpl)
    expect(openDatabaseSync).not.toHaveBeenCalled()
  })

  it("exposes the injected StorageService as .storageService", () => {
    const repo = new AppRepositoryImpl()
    expect(repo.storageService).toBeInstanceOf(StorageService)
  })

  it("only opens the local database the first time .roomService is read", () => {
    const repo = new AppRepositoryImpl()
    expect(openDatabaseSync).not.toHaveBeenCalled()

    const first = repo.roomService
    expect(openDatabaseSync).toHaveBeenCalledTimes(1)

    const second = repo.roomService
    expect(second).toBe(first)
    expect(openDatabaseSync).toHaveBeenCalledTimes(1)
  })
})
