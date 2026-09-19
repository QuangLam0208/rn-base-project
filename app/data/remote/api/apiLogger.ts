import { ApiResponse } from "apisauce"

import { logger } from "@/utils/logger"

const TAG = "API"

function safeJson(value: unknown): string | undefined {
  if (value === undefined) return undefined
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

/**
 * Logs one apisauce call via apisauce's `addMonitor` hook — this is the
 * RN equivalent of ai-project-android's OkHttp `HttpLoggingInterceptor`
 * at `Level.BODY` (see `AppModule.getClient()`), which prints full
 * request/response headers+bodies only when `BuildConfig.DEBUG`. There's
 * no separate debug/release interceptor level here: the monitor is
 * always attached (mirrors the interceptor always being added), and
 * `logger.d` — not this function — is what's silent in a release build.
 *
 * Example output:
 * ```
 * D/API: --> GET https://api.example.com/courses
 * D/API:     body: { "page": 1 }
 * D/API: <-- 200 GET https://api.example.com/courses (142ms)
 * D/API:     body: { "data": [...] }
 * ```
 */
export function logApiCall(response: ApiResponse<unknown>): void {
  const { config, status, problem, duration, data } = response
  const method = config?.method?.toUpperCase() ?? "?"
  const url = `${config?.baseURL ?? ""}${config?.url ?? ""}`
  const requestBody = safeJson(config?.data ?? config?.params)
  const responseBody = safeJson(data)

  logger.d(TAG, `--> ${method} ${url}`)
  if (requestBody !== undefined) {
    logger.d(TAG, `    body: ${requestBody}`)
  }

  logger.d(TAG, `<-- ${status ?? problem ?? "?"} ${method} ${url} (${duration ?? "?"}ms)`)
  if (responseBody !== undefined) {
    logger.d(TAG, `    body: ${responseBody}`)
  }
}
