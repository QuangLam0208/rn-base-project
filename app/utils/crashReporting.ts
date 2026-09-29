/**
 * Firebase Crashlytics: https://rnfirebase.io/crashlytics/usage
 *
 * Mirrors ai-project-android's MVVMApplication.onCreate() /
 * MyTimberReleaseTree: Crashlytics collection is only enabled outside of
 * dev (`setCrashlyticsCollectionEnabled(!__DEV__)`, matching the
 * Android side's intended-but-currently-commented-out
 * `!BuildConfig.DEBUG` check), and non-fatal errors are recorded through
 * it rather than crashing the app.
 *
 * Requires a Firebase project registered for this app's bundle
 * id/package (`com.rn3`) with `google-services.json` (Android) /
 * `GoogleService-Info.plist` (iOS) placed at the project root and a
 * native rebuild (`expo prebuild` + `expo run:ios`/`run:android`) —
 * exactly the same gap ai-project-android itself has today (its
 * Crashlytics wiring is present but disabled locally for the same
 * missing-config-file reason).
 */
import {
  getCrashlytics,
  log as crashlyticsLog,
  recordError,
  setCrashlyticsCollectionEnabled,
} from "@react-native-firebase/crashlytics"

import { isExpoGo } from "@/utils/IsExpoGo"

let crashlyticsInstance: ReturnType<typeof getCrashlytics> | null = null
if (!isExpoGo) {
  try {
    crashlyticsInstance = getCrashlytics()
  } catch {
    // Firebase native modules are not available
  }
}

/**
 *  This is where you put your crash reporting service initialization code to call in `./app/app.tsx`
 */
export const initCrashReporting = () => {
  if (crashlyticsInstance) {
    try {
      setCrashlyticsCollectionEnabled(crashlyticsInstance, !__DEV__)
    } catch {}
  }
}

/**
 * Error classifications used to sort errors on error reporting services.
 */
export enum ErrorType {
  /**
   * An error that would normally cause a red screen in dev
   * and force the user to sign out and restart.
   */
  FATAL = "Fatal",
  /**
   * An error caught by try/catch where defined using Reactotron.tron.error.
   */
  HANDLED = "Handled",
}

/**
 * Manually report a handled error.
 */
export const reportCrash = (error: Error, type: ErrorType = ErrorType.FATAL) => {
  if (__DEV__ || !crashlyticsInstance) {
    // Log to console and Reactotron in development
    const message = error.message || "Unknown"
    console.error(error)
    console.log(message, type)
  } else {
    try {
      crashlyticsLog(crashlyticsInstance, type)
      recordError(crashlyticsInstance, error)
    } catch {}
  }
}
