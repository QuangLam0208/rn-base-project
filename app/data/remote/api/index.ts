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

export const AUTH_CONFIG = {
  CLIENT_ID: "abc_client",
  CLIENT_SECRET: "abc123",
  TENANT: "moviehub",
} as const

/**
 * Tạo header Basic Auth từ Client ID và Client Secret động.
 */
export function getBasicAuthHeader(
  clientId: string = AUTH_CONFIG.CLIENT_ID,
  clientSecret: string = AUTH_CONFIG.CLIENT_SECRET,
): string {
  const credentials = `${clientId}:${clientSecret}`
  return `Basic ${btoa(credentials)}`
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
        "X-tenant": AUTH_CONFIG.TENANT,
      },
    })

    this.apisauce.addAsyncRequestTransform(async (request) => {
      request.headers = request.headers ?? {}
      request.headers["X-tenant"] = AUTH_CONFIG.TENANT

      const ignoreAuth = request.headers.IgnoreAuth === "1" || request.headers.ignoreauth === "1"
      if (ignoreAuth) {
        delete request.headers.IgnoreAuth
        delete request.headers.ignoreauth
        return
      }

      const useBasicAuth =
        request.headers.UseBasicAuth === "1" || request.headers.usebasicauth === "1"
      if (useBasicAuth) {
        delete request.headers.UseBasicAuth
        delete request.headers.usebasicauth
        request.headers.Authorization = getBasicAuthHeader()
        return
      }

      const token = this.authStore.token
      if (token) {
        request.headers.Authorization = `Bearer ${token}`
      }
    })

    // Logs every request/response, mirroring ai-project-android's
    // HttpLoggingInterceptor — see apiLogger.ts for why this is always
    // attached rather than only in __DEV__.
    this.apisauce.addMonitor(logApiCall)
  }
}
