import { AppLockStore } from "@/stores/appLockStore"

import { AppLockViewModel } from "./AppLockViewModel"

const assignStore = (vm: AppLockViewModel, store: Partial<AppLockStore>) => {
  ;(vm as unknown as { appLockStore: Partial<AppLockStore> }).appLockStore = store
}

describe("AppLockViewModel", () => {
  it("verifies after 6 digits and unlocks on success", async () => {
    const vm = new AppLockViewModel()
    const store = {
      verifyPin: jest.fn(async () => "success" as const),
      unlock: jest.fn(),
      remainingAttempts: 5,
    }
    assignStore(vm, store)

    for (const d of ["1", "2", "3", "4", "5"]) {
      expect(await vm.appendDigit(d)).toBe("pending")
    }
    expect(await vm.appendDigit("6")).toBe("unlocked")
    expect(store.verifyPin).toHaveBeenCalledWith("123456")
    expect(store.unlock).toHaveBeenCalled()
  })

  it("clears the PIN and shows remaining attempts on wrong PIN", async () => {
    const vm = new AppLockViewModel()
    const store = {
      verifyPin: jest.fn(async () => "wrong" as const),
      remainingAttempts: 4,
    }
    assignStore(vm, store)

    for (const d of ["1", "1", "1", "1", "1", "1"]) {
      await vm.appendDigit(d)
    }

    expect(vm.pin).toBe("")
    expect(vm.errorText).toBe("appLock:wrongPin")
  })

  it("forces logout when locked out after too many failed attempts", async () => {
    const vm = new AppLockViewModel()
    const store = {
      verifyPin: jest.fn(async () => "locked-out" as const),
      forceLogout: jest.fn(async () => {}),
    }
    assignStore(vm, store)

    let outcome = "pending"
    for (const d of ["1", "1", "1", "1", "1", "1"]) {
      outcome = await vm.appendDigit(d)
    }

    expect(outcome).toBe("logged-out")
    expect(store.forceLogout).toHaveBeenCalled()
  })
})
