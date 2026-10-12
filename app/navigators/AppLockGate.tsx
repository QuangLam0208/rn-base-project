import { observer } from "mobx-react-lite"

import { container } from "@/di/container"
import { AppLockScreen } from "@/screens/AppLock/AppLockScreen"
import { AppLockStore } from "@/stores/appLockStore"

const appLockStore = container.get(AppLockStore)

/**
 * Renders the PIN / biometric lock over the whole app while
 * `AppLockStore.isLocked` is true (set once at cold start). Mounted in
 * app.tsx as a sibling *after* `<AppNavigator>` so it paints on top and its
 * BackHandler listener takes priority over the navigator's.
 */
export const AppLockGate = observer(function AppLockGate() {
  return appLockStore.isLocked ? <AppLockScreen /> : null
})
