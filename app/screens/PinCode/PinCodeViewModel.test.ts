import { AppLockStore } from "@/stores/appLockStore"

import { PinCodeViewModel } from "./PinCodeViewModel"

const assignStore = (vm: PinCodeViewModel, store: Partial<AppLockStore>) => {
  ;(vm as unknown as { appLockStore: Partial<AppLockStore> }).appLockStore = store
}

const enterPin = async (vm: PinCodeViewModel, digits: string) => {
  let outcome = "pending"
  for (const ch of digits) {
    outcome = await vm.appendDigit(ch)
  }
  return outcome
}

describe("PinCodeViewModel", () => {
  it("creates a new PIN after matching confirmation", async () => {
    const vm = new PinCodeViewModel()
    const store = { savePin: jest.fn(async () => {}) }
    assignStore(vm, store)

    vm.start("create")
    expect(await enterPin(vm, "123456")).toBe("pending")
    expect(vm.step).toBe("confirm")

    expect(await enterPin(vm, "123456")).toBe("done")
    expect(store.savePin).toHaveBeenCalledWith("123456")
  })

  it("resets back to new step if confirmation PIN does not match", async () => {
    const vm = new PinCodeViewModel()
    const store = { savePin: jest.fn(async () => {}) }
    assignStore(vm, store)

    vm.start("create")
    await enterPin(vm, "123456")
    expect(await enterPin(vm, "654321")).toBe("pending")
    expect(vm.step).toBe("new")
    expect(vm.errorText).toBeTruthy()
    expect(store.savePin).not.toHaveBeenCalled()
  })

  it("verifies current PIN before disabling app lock", async () => {
    const vm = new PinCodeViewModel()
    const store = {
      verifyPin: jest.fn(async () => "success" as const),
      disable: jest.fn(async () => {}),
    }
    assignStore(vm, store)

    vm.start("disable")
    expect(await enterPin(vm, "123456")).toBe("done")
    expect(store.verifyPin).toHaveBeenCalledWith("123456")
    expect(store.disable).toHaveBeenCalled()
  })

  it("verifies current PIN then saves new PIN in change mode", async () => {
    const vm = new PinCodeViewModel()
    const store = {
      verifyPin: jest.fn(async () => "success" as const),
      savePin: jest.fn(async () => {}),
    }
    assignStore(vm, store)

    vm.start("change")
    expect(await enterPin(vm, "111111")).toBe("pending")
    expect(vm.step).toBe("new")

    expect(await enterPin(vm, "222222")).toBe("pending")
    expect(vm.step).toBe("confirm")

    expect(await enterPin(vm, "222222")).toBe("done")
    expect(store.savePin).toHaveBeenCalledWith("222222")
  })
})
