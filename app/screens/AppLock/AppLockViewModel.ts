import { inject, injectable } from "inversify"
import { actionBound, makeObservable, observable, runInAction } from "mobx"

import type { BiometricKind } from "@/data/local/biometric/BiometricService"
import { translate } from "@/i18n/translate"
import { AppLockStore, PIN_LENGTH } from "@/stores/appLockStore"
import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

/** What the screen should do after a PIN/biometric attempt. */
export type UnlockOutcome = "pending" | "unlocked" | "logged-out"

@injectable()
export class AppLockViewModel extends BaseViewModel {
  @inject(AppLockStore)
  private appLockStore!: AppLockStore

  pin = ""
  errorText: string | null = null
  /** Set only when biometric unlock is both enabled in Settings and currently usable. */
  biometricKind: BiometricKind | null = null

  constructor() {
    super()
    makeObservable(this, {
      pin: observable,
      errorText: observable,
      biometricKind: observable,
      isLoading: observable,
      error: observable,
      appendDigit: actionBound,
      deleteDigit: actionBound,
      unlockWithBiometric: actionBound,
      forceLogout: actionBound,
    })
  }

  get biometricLabel(): string | null {
    return this.biometricKind ? translate(`appLock:method_${this.biometricKind}`) : null
  }

  /** Called once on mount: auto-shows the biometric prompt, like banking apps do. */
  async init(): Promise<void> {
    if (!this.appLockStore.isBiometricEnabled) return
    const support = await this.appLockStore.getBiometricSupport()
    if (!support.isAvailable) return
    runInAction(() => {
      this.biometricKind = support.kind
    })
    await this.unlockWithBiometric()
  }

  async unlockWithBiometric(): Promise<void> {
    if (this.isLoading) return
    runInAction(() => {
      this.isLoading = true
    })
    // On failure/cancel the OS prompt just closes — the PIN pad stays as the fallback.
    await this.appLockStore.unlockWithBiometric(
      translate("appLock:biometricPrompt"),
      translate("appLock:usePin"),
    )
    runInAction(() => {
      this.isLoading = false
    })
  }

  /** Returns "logged-out" when the attempt limit is hit, so the screen can go to Login. */
  async appendDigit(digit: string): Promise<UnlockOutcome> {
    if (this.isLoading || this.pin.length >= PIN_LENGTH) return "pending"
    this.pin += digit
    this.errorText = null
    if (this.pin.length < PIN_LENGTH) return "pending"

    this.isLoading = true
    const result = await this.appLockStore.verifyPin(this.pin)

    if (result === "success") {
      runInAction(() => {
        this.isLoading = false
      })
      this.appLockStore.unlock()
      return "unlocked"
    }
    if (result === "locked-out") {
      await this.forceLogout()
      this.showErrorMessage(translate("appLock:lockedOut"))
      return "logged-out"
    }

    runInAction(() => {
      this.isLoading = false
      this.pin = ""
      this.errorText = translate("appLock:wrongPin", {
        remaining: this.appLockStore.remainingAttempts,
      })
    })
    return "pending"
  }

  deleteDigit() {
    this.pin = this.pin.slice(0, -1)
  }

  async forceLogout(): Promise<void> {
    await this.appLockStore.forceLogout()
    runInAction(() => {
      this.pin = ""
      this.isLoading = false
    })
  }
}
