import { remove } from "@/data/local/storage"

import { authStore } from "./authStore"

describe("authStore", () => {
  afterEach(() => {
    authStore.clearToken()
  })

  it("starts unauthenticated", () => {
    expect(authStore.token).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it("becomes authenticated after setToken", () => {
    authStore.setToken("abc123")
    expect(authStore.token).toBe("abc123")
    expect(authStore.isAuthenticated).toBe(true)
  })

  it("stores the username alongside the token when provided", () => {
    authStore.setToken("abc123", "admin")
    expect(authStore.username).toBe("admin")
  })

  it("leaves username untouched when setToken is called without one", () => {
    authStore.setToken("abc123", "admin")
    authStore.setToken("def456")
    expect(authStore.username).toBe("admin")
  })

  it("clears the token, username, and storage on clearToken", () => {
    authStore.setToken("abc123", "admin")
    authStore.clearToken()
    expect(authStore.token).toBeNull()
    expect(authStore.username).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  afterAll(() => {
    remove("authStore.token")
    remove("authStore.username")
  })
})
