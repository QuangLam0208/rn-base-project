import { authStore } from "@/stores/authStore";
import { BaseViewModel } from "@/viewmodels/base/BaseViewModel";
import { injectable } from "inversify";
import { actionBound, makeObservable, observable } from "mobx";

@injectable()
export class LoginViewModel extends BaseViewModel {
  username = ""
  password = ""
  isPasswordVisible = false

  constructor() {
    super()
    
    makeObservable(this, {
      username: observable,
      password: observable,
      isPasswordVisible: observable,
      isLoading: observable,
      error: observable,
      setUsername: actionBound,
      setPassword: actionBound,
      togglePasswordVisibility: actionBound,
      handleLogin: actionBound,
    })
  }

  setUsername(value: string) {
    this.username = value
  }

  setPassword(value: string) {
    this.password = value
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible
  }

  async handleLogin(): Promise<boolean> {
    const trimmedUsername = this.username.trim()
    const rawPassword = this.password

    if (!trimmedUsername || !rawPassword) {
      this.error = "empty-fields"
      return false
    }

    let isSuccess = false

    await this.runAction(async () => {
      const response = await this.repository.apiService.login({
        grant_type: "password",
        username: trimmedUsername,
        password: rawPassword,
      })

      if (response && response.access_token) {
        authStore.setToken(response.access_token, response.username ?? trimmedUsername)
        isSuccess = true
      } else {
        throw new Error("invalid-response")
      }
    })

    return isSuccess
  }
}