import Constants, { AppOwnership, ExecutionEnvironment } from "expo-constants"

/**
 * Returns true if the app is currently running inside Expo Go.
 * In Expo Go, native custom modules (MMKV, custom Firebase, Reactotron, edge-to-edge)
 * are bypassed or replaced with JS fallbacks.
 */
export const isExpoGo: boolean =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === AppOwnership.Expo
