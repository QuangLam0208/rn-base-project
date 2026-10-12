import { BiometricService } from "@/data/local/biometric/BiometricService"
import { SecureStorageService } from "@/data/local/secure/SecureStorageService"
import { clear } from "@/data/local/storage"
import { StorageService } from "@/data/local/storage/StorageService"
import type { PinHasher } from "@/utils/pinHasher"

import { AppLockStore, MAX_PIN_ATTEMPTS } from "./appLockStore"
import { AuthStore } from "./authStore"

const createFakeSecureStorage = (): SecureStorageService => {
  const map = new Map<string, string>()
  return {
    getItem: jest.fn(async (key: string) => map.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      map.set(key, value)
    }),
    removeItem: jest.fn(async (key: string) => {
      map.delete(key)
    }),
  }
}

const createFakeBiometricService = (
  authenticateResult = true,
): jest.Mocked<BiometricService> =>
  ({
    getSupport: jest.fn(async () => ({ isAvailable: true, kind: "faceId" as const })),
    authenticate: jest.fn(async () => authenticateResult),
  }) as unknown as jest.Mocked<BiometricService>

const fakeHasher: PinHasher = {
  hash: async (pin) => `hashed:${pin}`,
  verify: async (pin, stored) => stored === `hashed:${pin}`,
}

describe("AppLockStore", () => {
  let storageService: StorageService
  let secureStorage: SecureStorageService
  let biometricService: jest.Mocked<BiometricService>
  let authStore: AuthStore

  beforeEach(() => {
    clear()
    storageService = new StorageService()
    secureStorage = createFakeSecureStorage()
    biometricService = createFakeBiometricService()
    authStore = new AuthStore(storageService)
  })

  afterAll(() => {
    clear()
  })

  it("starts disabled and unlocked on fresh install", () => {
    const store = new AppLockStore(
      storageService,
      secureStorage,
      biometricService,
      authStore,
      fakeHasher,
    )
    expect(store.isEnabled).toBe(false)
    expect(store.isLocked).toBe(false)
    expect(store.isBiometricEnabled).toBe(false)
  })

  it("locks on cold start only when both enabled and authenticated", async () => {
    authStore.setToken("jwt-token", "user1")
    const setupStore = new AppLockStore(
      storageService,
      secureStorage,
      biometricService,
      authStore,
      fakeHasher,
    )
    await setupStore.savePin("123456")

    // Simulate cold start while logged in -> locked
    const coldStartLoggedIn = new AppLockStore(
      storageService,
      secureStorage,
      biometricService,
      authStore,
      fakeHasher,
    )
    expect(coldStartLoggedIn.isEnabled).toBe(true)
    expect(coldStartLoggedIn.isLocked).toBe(true)

    // Simulate cold start while logged out -> not locked
    authStore.clearToken()
    const coldStartLoggedOut = new AppLockStore(
      storageService,
      secureStorage,
      biometricService,
      authStore,
      fakeHasher,
    )
    expect(coldStartLoggedOut.isLocked).toBe(false)
  })

  it("verifies the PIN and tracks failed attempts until locked-out", async () => {
    authStore.setToken("jwt-token")
    const store = new AppLockStore(
      storageService,
      secureStorage,
      biometricService,
      authStore,
      fakeHasher,
    )
    await store.savePin("123456")

    expect(await store.verifyPin("000000")).toBe("wrong")
    expect(store.failedAttempts).toBe(1)
    expect(store.remainingAttempts).toBe(MAX_PIN_ATTEMPTS - 1)

    expect(await store.verifyPin("123456")).toBe("success")
    expect(store.failedAttempts).toBe(0)

    for (let i = 1; i < MAX_PIN_ATTEMPTS; i++) {
      expect(await store.verifyPin("999999")).toBe("wrong")
    }
    expect(await store.verifyPin("999999")).toBe("locked-out")
  })

  it("requires a successful biometric scan before enabling biometric unlock", async () => {
    const failingBio = createFakeBiometricService(false)
    const store = new AppLockStore(
      storageService,
      secureStorage,
      failingBio,
      authStore,
      fakeHasher,
    )

    const ok = await store.setBiometricEnabled(true, "Unlock", "Cancel")
    expect(ok).toBe(false)
    expect(store.isBiometricEnabled).toBe(false)

    failingBio.authenticate.mockResolvedValueOnce(true)
    const ok2 = await store.setBiometricEnabled(true, "Unlock", "Cancel")
    expect(ok2).toBe(true)
    expect(store.isBiometricEnabled).toBe(true)
  })

  it("wipes PIN, lock state, and auth token on forceLogout", async () => {
    authStore.setToken("jwt-token")
    const store = new AppLockStore(
      storageService,
      secureStorage,
      biometricService,
      authStore,
      fakeHasher,
    )
    await store.savePin("123456")
    await store.setBiometricEnabled(true, "Unlock", "Cancel")

    await store.forceLogout()

    expect(store.isEnabled).toBe(false)
    expect(store.isBiometricEnabled).toBe(false)
    expect(store.isLocked).toBe(false)
    expect(authStore.isAuthenticated).toBe(false)
    expect(await secureStorage.getItem("appLock.pinHash")).toBeNull()
  })
})
