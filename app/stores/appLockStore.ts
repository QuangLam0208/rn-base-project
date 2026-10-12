import { injectable } from "inversify"
import { makeAutoObservable, runInAction } from "mobx"

import { BiometricService } from "@/data/local/biometric/BiometricService"
import { SecureStorageService } from "@/data/local/secure/SecureStorageService"
import { StorageService } from "@/data/local/storage/StorageService"
import { PinHasher, pinHasher } from "@/utils/pinHasher"

import { AuthStore } from "./authStore"

/** Non-secret flags → MMKV (read synchronously at startup). */
const LOCK_ENABLED_KEY = "appLock.enabled"
const BIOMETRIC_ENABLED_KEY = "appLock.biometricEnabled"
const FAILED_ATTEMPTS_KEY = "appLock.failedAttempts"
/** The secret → Keychain / Keystore via SecureStorageService. */
const PIN_HASH_KEY = "appLock.pinHash"

export const PIN_LENGTH = 6
export const MAX_PIN_ATTEMPTS = 5

export type VerifyPinResult = "success" | "wrong" | "locked-out"

type Collaborators = "storageService" | "secureStorage" | "biometricService" | "authStore" | "hasher"

/**
 * App-wide "lock on cold start" state, like a banking app's PIN screen.
 *
 * `isLocked` is computed once in the constructor — this store is a DI
 * singleton created when the JS runtime boots, so "constructed" == "cold
 * start". `AppLockGate` (app/navigators/AppLockGate.tsx) renders the lock
 * screen over the whole navigator while `isLocked` is true.
 *
 * Only locks when the user is actually logged in — there's nothing to
 * protect on the Login screen.
 */
@injectable()
export class AppLockStore {
  isEnabled = false
  isBiometricEnabled = false
  isLocked = false
  failedAttempts = 0

  constructor(
    private storageService: StorageService,
    private secureStorage: SecureStorageService,
    private biometricService: BiometricService,
    private authStore: AuthStore,
    private hasher: PinHasher = pinHasher,
  ) {
    makeAutoObservable<AppLockStore, Collaborators>(this, {
      storageService: false,
      secureStorage: false,
      biometricService: false,
      authStore: false,
      hasher: false,
    })
    this.isEnabled = this.storageService.load<boolean>(LOCK_ENABLED_KEY) ?? false
    this.isBiometricEnabled = this.storageService.load<boolean>(BIOMETRIC_ENABLED_KEY) ?? false
    this.failedAttempts = this.storageService.load<number>(FAILED_ATTEMPTS_KEY) ?? 0
    this.isLocked = this.isEnabled && this.authStore.isAuthenticated
  }

  get remainingAttempts(): number {
    return Math.max(0, MAX_PIN_ATTEMPTS - this.failedAttempts)
  }

  /** Turns the lock on (or replaces the PIN, for "change PIN"). */
  async savePin(pin: string): Promise<void> {
    const hash = await this.hasher.hash(pin)
    await this.secureStorage.setItem(PIN_HASH_KEY, hash)
    runInAction(() => {
      this.isEnabled = true
      this.storageService.save(LOCK_ENABLED_KEY, true)
      this.setFailedAttempts(0)
    })
  }

  /**
   * Checks a PIN against the stored hash. Wrong attempts are persisted, so
   * killing the app doesn't reset the counter. Reaching
   * `MAX_PIN_ATTEMPTS` returns `"locked-out"` — the caller should then
   * call `forceLogout()` and send the user to Login.
   */
  async verifyPin(pin: string): Promise<VerifyPinResult> {
    const stored = await this.secureStorage.getItem(PIN_HASH_KEY)
    // Enabled but the hash vanished (keychain wiped…) — can't verify, make them log in again.
    if (!stored) return "locked-out"

    const isMatch = await this.hasher.verify(pin, stored)
    return runInAction(() => {
      if (isMatch) {
        this.setFailedAttempts(0)
        return "success"
      }
      this.setFailedAttempts(this.failedAttempts + 1)
      return this.failedAttempts >= MAX_PIN_ATTEMPTS ? "locked-out" : "wrong"
    })
  }

  unlock() {
    this.isLocked = false
    this.setFailedAttempts(0)
  }

  lock() {
    if (this.isEnabled) {
      this.isLocked = true
    }
  }

  /** Biometric unlock from the lock screen. Returns false if not enabled / failed / cancelled. */
  async unlockWithBiometric(promptMessage: string, cancelLabel: string): Promise<boolean> {
    if (!this.isBiometricEnabled) return false
    const isSuccess = await this.biometricService.authenticate(promptMessage, cancelLabel)
    if (isSuccess) this.unlock()
    return isSuccess
  }

  /** Settings toggle: turning it on requires one successful scan first. */
  async setBiometricEnabled(
    isEnabled: boolean,
    promptMessage: string,
    cancelLabel: string,
  ): Promise<boolean> {
    if (isEnabled) {
      const isSuccess = await this.biometricService.authenticate(promptMessage, cancelLabel)
      if (!isSuccess) return false
    }
    runInAction(() => {
      this.isBiometricEnabled = isEnabled
      this.storageService.save(BIOMETRIC_ENABLED_KEY, isEnabled)
    })
    return true
  }

  getBiometricSupport() {
    return this.biometricService.getSupport()
  }

  /** Turns the lock off and wipes the PIN. Also called on logout. */
  async disable(): Promise<void> {
    await this.secureStorage.removeItem(PIN_HASH_KEY)
    runInAction(() => {
      this.isEnabled = false
      this.isBiometricEnabled = false
      this.isLocked = false
      this.storageService.remove(LOCK_ENABLED_KEY)
      this.storageService.remove(BIOMETRIC_ENABLED_KEY)
      this.setFailedAttempts(0)
    })
  }

  /** Too many wrong PINs / "forgot PIN": drop the session and the lock. */
  async forceLogout(): Promise<void> {
    await this.disable()
    this.authStore.clearToken()
  }

  private setFailedAttempts(count: number) {
    this.failedAttempts = count
    if (count === 0) this.storageService.remove(FAILED_ATTEMPTS_KEY)
    else this.storageService.save(FAILED_ATTEMPTS_KEY, count)
  }
}
