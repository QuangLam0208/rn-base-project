import * as Updates from "expo-updates"

import { logger } from "./logger"

const TAG = "AppUpdates"

export type CheckForUpdateResult =
  | { status: "disabled" }
  | { status: "up-to-date" }
  | { status: "available" }
  | { status: "error"; error: unknown }

/**
 * Checks EAS Update's server for a newer JS bundle than the one this
 * build is currently running — this is an OTA (JS-only) update, not a
 * new native build; see CLAUDE.md's "OTA update" section for what it
 * can and can't change.
 *
 * Two distinct ways this can be a no-op rather than a real check, both
 * mapped to "disabled" instead of "error" so the caller can show
 * something sensible:
 * - `Updates.isEnabled` is false when there's no valid update config at
 *   all (no `updates.url`, no runtimeVersion) — calling the native
 *   check would just throw.
 * - Even with `isEnabled` true, `checkForUpdateAsync()` itself throws
 *   `ERR_NOT_AVAILABLE_IN_DEV_CLIENT` on a dev client build (what `expo
 *   run:ios`/`run:android` install) — that's expected there too, only
 *   a genuine EAS/production-style build can actually check.
 */
export async function checkForUpdate(): Promise<CheckForUpdateResult> {
  if (!Updates.isEnabled) {
    logger.d(TAG, "expo-updates is disabled (no update config) — skipping check")
    return { status: "disabled" }
  }

  try {
    const result = await Updates.checkForUpdateAsync()
    logger.d(TAG, `checkForUpdateAsync -> isAvailable=${result.isAvailable}`)
    return result.isAvailable ? { status: "available" } : { status: "up-to-date" }
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ERR_NOT_AVAILABLE_IN_DEV_CLIENT"
    ) {
      logger.d(TAG, "checkForUpdateAsync unsupported in this dev client build — skipping check")
      return { status: "disabled" }
    }
    logger.e(TAG, "checkForUpdateAsync failed", error)
    return { status: "error", error }
  }
}

/**
 * Downloads the update found by `checkForUpdate()` and reloads the app
 * to apply it right away, instead of waiting for expo-updates' own
 * default (apply on next cold start).
 */
export async function downloadAndApplyUpdate(): Promise<void> {
  await Updates.fetchUpdateAsync()
  await Updates.reloadAsync()
}
