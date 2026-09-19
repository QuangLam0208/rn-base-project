/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApisauceInstance, create } from "apisauce"
import { inject, injectable, unmanaged } from "inversify"

import Config from "@/config"
import { authStore as defaultAuthStore, AuthStore } from "@/stores/authStore"

import { logApiCall } from "./apiLogger"
import type { ApiConfig } from "./types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
@injectable()
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(
    @inject(AuthStore) private authStore: AuthStore = defaultAuthStore,
    @unmanaged() config: ApiConfig = DEFAULT_API_CONFIG,
  ) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })

    // Attach the auth token to every outgoing request, mirroring
    // ai-project-android's AuthInterceptor. authStore has no token
    // until something in your app calls authStore.setToken() — there's
    // no Login screen in this base project, just the plumbing that a
    // real one would plug into (see CLAUDE.md's DI section on why
    // authStore is a plain imported singleton, not a second property
    // injection alongside repository).
    this.apisauce.addAsyncRequestTransform(async (request) => {
      const token = this.authStore.token
      if (token) {
        request.headers = request.headers ?? {}
        request.headers.Authorization = `Bearer ${token}`
      }
    })

    // Logs every request/response, mirroring ai-project-android's
    // HttpLoggingInterceptor — see apiLogger.ts for why this is always
    // attached rather than only in __DEV__.
    this.apisauce.addMonitor(logApiCall)
  }
}
