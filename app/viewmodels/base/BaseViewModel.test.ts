import { BaseViewModel } from "./BaseViewModel"

class TestViewModel extends BaseViewModel {
  value: string | null = null

  triggerSuccess(result: string): Promise<void> {
    return this.runAction(async () => {
      await Promise.resolve()
      this.value = result
    })
  }

  triggerFailure(message: string): Promise<void> {
    return this.runAction(async () => {
      await Promise.resolve()
      throw new Error(message)
    })
  }
}

describe("BaseViewModel", () => {
  it("starts with isLoading false and no error", () => {
    const vm = new TestViewModel()
    expect(vm.isLoading).toBe(false)
    expect(vm.error).toBeNull()
  })

  it("sets isLoading true during the action and false after success", async () => {
    const vm = new TestViewModel()
    const promise = vm.triggerSuccess("done")
    expect(vm.isLoading).toBe(true)
    await promise
    expect(vm.isLoading).toBe(false)
    expect(vm.value).toBe("done")
    expect(vm.error).toBeNull()
  })

  it("captures a thrown error and clears isLoading", async () => {
    const vm = new TestViewModel()
    await vm.triggerFailure("boom")
    expect(vm.isLoading).toBe(false)
    expect(vm.error).toBe("boom")
  })

  it("clears a previous error at the start of a new action", async () => {
    const vm = new TestViewModel()
    await vm.triggerFailure("first error")
    expect(vm.error).toBe("first error")

    await vm.triggerSuccess("second")
    expect(vm.error).toBeNull()
    expect(vm.value).toBe("second")
  })

  it("delegates toast methods to toast utility", () => {
    const vm = new TestViewModel()
    const toastSpy = jest.spyOn(require("@/utils/toast"), "showSuccess")
    vm.showSuccessMessage("Hello")
    expect(toastSpy).toHaveBeenCalledWith("Hello", undefined)
  })
})
