import { ErrorType, reportCrash } from "./crashReporting"

type LogTag = string

function timestamp(): string {
  return new Date().toISOString().slice(11, 23)
}

function print(level: "D" | "I" | "W" | "E", tag: LogTag, message: string, extra?: unknown) {
  const line = `${timestamp()} ${level}/${tag}: ${message}`
  const args = extra === undefined ? [line] : [line, extra]
  // eslint-disable-next-line no-console
  if (level === "E") console.error(...args)
  // eslint-disable-next-line no-console
  else if (level === "W") console.warn(...args)
  // eslint-disable-next-line no-console
  else console.log(...args)
}

/**
 * A tagged, leveled console logger mirroring ai-project-android's
 * LogService/Timber setup: `MyTimberDebugTree` is only planted when
 * `BuildConfig.DEBUG`, so nothing prints in a release build there — here
 * `__DEV__` is that same gate, checked per call instead of by swapping
 * which tree is planted. `error()` also forwards to the crash-reporting
 * service outside of dev, mirroring `MyTimberReleaseTree` forwarding
 * non-VERBOSE/DEBUG logs to Crashlytics (see `crashReporting.ts`).
 *
 * Tag convention matches the Android side's call sites (a short
 * screen/module name, e.g. "API", "CoursesViewModel") rather than
 * LogService's auto class/method/line prefix — recovering an exact
 * caller class+line from a JS stack trace on every call isn't worth the
 * overhead this needs to stay cheap to call from a render path.
 */
export const logger = {
  d: (tag: LogTag, message: string, extra?: unknown) => {
    if (__DEV__) print("D", tag, message, extra)
  },
  i: (tag: LogTag, message: string, extra?: unknown) => {
    if (__DEV__) print("I", tag, message, extra)
  },
  w: (tag: LogTag, message: string, extra?: unknown) => {
    if (__DEV__) print("W", tag, message, extra)
  },
  e: (tag: LogTag, message: string, error?: unknown) => {
    if (__DEV__) {
      print("E", tag, message, error)
    } else if (error instanceof Error) {
      reportCrash(error, ErrorType.HANDLED)
    }
  },
}
