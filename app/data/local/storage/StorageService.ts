import { injectable } from "inversify"

import { load, remove, save } from "./index"

/**
 * Injectable wrapper around the MMKV-backed storage functions in
 * `./index.ts`. Exists so stateful stores (like AuthStore) receive
 * storage through their constructor instead of importing the free
 * functions directly, keeping them consistent with the rest of the DI
 * graph — see app/di/container.ts.
 */
@injectable()
export class StorageService {
  load<T>(key: string): T | null {
    return load<T>(key)
  }

  save(key: string, value: unknown): boolean {
    return save(key, value)
  }

  remove(key: string): void {
    remove(key)
  }
}
