import { inject, injectable } from "inversify"
import { actionBound, makeObservable, observable, runInAction } from "mobx"

import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { AppLockStore, PIN_LENGTH } from "@/stores/appLockStore"
import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

/**
 * - `create`  — new PIN → confirm → lock turned on
 * - `change`  — current PIN → new PIN → confirm
 * - `disable` — current PIN → lock turned off
 */
export type PinCodeMode = "create" | "change" | "disable"
type Step = "current" | "new" | "confirm"
export type PinCodeOutcome = "pending" | "done" | "logged-out"

@injectable()
export class PinCodeViewModel extends BaseViewModel {
  @inject(AppLockStore)
  private appLockStore!: AppLockStore

  mode: PinCodeMode = "create"
  step: Step = "new"
  pin = ""
  errorText: string | null = null
  private firstPin = ""

  constructor() {
    super()
    makeObservable<PinCodeViewModel, "firstPin">(this, {
      mode: observable,
      step: observable,
      pin: observable,
      errorText: observable,
      firstPin: observable,
      isLoading: observable,
      error: observable,
      start: actionBound,
      appendDigit: actionBound,
      deleteDigit: actionBound,
    })
  }

  get titleTx(): TxKeyPath {
    if (this.step === "current") return "pinCodeScreen:currentTitle"
    if (this.step === "confirm") return "pinCodeScreen:confirmTitle"
    return this.mode === "change" ? "pinCodeScreen:newTitle" : "pinCodeScreen:createTitle"
  }

  get subtitleTx(): TxKeyPath {
    if (this.step === "current") return "pinCodeScreen:currentSubtitle"
    if (this.step === "confirm") return "pinCodeScreen:confirmSubtitle"
    return "pinCodeScreen:createSubtitle"
  }

  start(mode: PinCodeMode) {
    this.mode = mode
    this.step = mode === "create" ? "new" : "current"
    this.pin = ""
    this.firstPin = ""
    this.errorText = null
  }

  /** Returns "done" when the flow finished (screen goes back) or "logged-out" (go to Login). */
  async appendDigit(digit: string): Promise<PinCodeOutcome> {
    if (this.isLoading || this.pin.length >= PIN_LENGTH) return "pending"
    this.pin += digit
    this.errorText = null
    if (this.pin.length < PIN_LENGTH) return "pending"

    const enteredPin = this.pin
    switch (this.step) {
      case "current":
        return this.checkCurrentPin(enteredPin)
      case "new":
        this.firstPin = enteredPin
        this.pin = ""
        this.step = "confirm"
        return "pending"
      case "confirm":
        return this.confirmNewPin(enteredPin)
    }
  }

  deleteDigit() {
    this.pin = this.pin.slice(0, -1)
  }

  private async checkCurrentPin(enteredPin: string): Promise<PinCodeOutcome> {
    this.isLoading = true
    const result = await this.appLockStore.verifyPin(enteredPin)

    if (result === "locked-out") {
      await this.appLockStore.forceLogout()
      this.showErrorMessage(translate("appLock:lockedOut"))
      return "logged-out"
    }
    if (result === "wrong") {
      runInAction(() => {
        this.isLoading = false
        this.pin = ""
        this.errorText = translate("appLock:wrongPin", {
          remaining: this.appLockStore.remainingAttempts,
        })
      })
      return "pending"
    }

    if (this.mode === "disable") {
      await this.appLockStore.disable()
      this.showSuccessMessage(translate("pinCodeScreen:disabled"))
      return "done"
    }
    runInAction(() => {
      this.isLoading = false
      this.pin = ""
      this.step = "new"
    })
    return "pending"
  }

  private async confirmNewPin(enteredPin: string): Promise<PinCodeOutcome> {
    if (enteredPin !== this.firstPin) {
      this.pin = ""
      this.firstPin = ""
      this.step = "new"
      this.errorText = translate("pinCodeScreen:mismatch")
      return "pending"
    }

    this.isLoading = true
    await this.appLockStore.savePin(enteredPin)
    runInAction(() => {
      this.isLoading = false
    })
    this.showSuccessMessage(
      translate(this.mode === "change" ? "pinCodeScreen:changed" : "pinCodeScreen:created"),
    )
    return "done"
  }
}
