import { inject, injectable } from "inversify"
import { makeAutoObservable } from "mobx"

import { StorageService } from "@/data/local/storage/StorageService"

const AUTH_TOKEN_KEY = "authStore.token"
const AUTH_USERNAME_KEY = "authStore.username"

@injectable()
export class AuthStore {
  token: string | null = null
  username: string | null = null

  constructor(private storageService: StorageService) {
    makeAutoObservable(this)
    this.token = this.storageService.load<string>(AUTH_TOKEN_KEY)
    this.username = this.storageService.load<string>(AUTH_USERNAME_KEY)
  }

  get isAuthenticated(): boolean {
    return !!this.token
  }

  setToken(token: string, username?: string) {
    this.token = token
    this.storageService.save(AUTH_TOKEN_KEY, token)
    if (username) {
      this.username = username
      this.storageService.save(AUTH_USERNAME_KEY, username)
    }
  }

  clearToken() {
    this.token = null
    this.username = null
    this.storageService.remove(AUTH_TOKEN_KEY)
    this.storageService.remove(AUTH_USERNAME_KEY)
  }
}

