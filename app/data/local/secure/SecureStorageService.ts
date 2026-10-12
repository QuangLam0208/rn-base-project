import * as SecureStore from "expo-secure-store"
import { injectable } from "inversify"

/**
 * Injectable wrapper around `expo-secure-store` — values land in the iOS
 * Keychain / Android Keystore-encrypted storage instead of MMKV's plain
 * file. Use this (not `StorageService`) for anything secret, e.g. the
 * app-lock PIN hash in `AppLockStore`. Same "thin wrapper so stores get it
 * through their constructor" reason as `StorageService`.
 */
@injectable()
export class SecureStorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      // Only readable while the device is unlocked, never synced/restored to another device.
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    })
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch {
      // already gone — nothing to do
    }
  }
}
