/**
 * In-memory Key-Value storage used when running inside Expo Go,
 * replacing native MMKV which requires custom TurboModules.
 */
export class ExpoGoKVStorage {
  private map = new Map<string, string | number | boolean | ArrayBuffer | Uint8Array>()
  private listeners = new Set<(key: string) => void>()

  set(key: string, value: boolean | string | number | ArrayBuffer | Uint8Array): void {
    this.map.set(key, value)
    this.listeners.forEach((listener) => {
      try {
        listener(key)
      } catch {}
    })
  }

  getString(key: string): string | undefined {
    const val = this.map.get(key)
    return typeof val === "string" ? val : undefined
  }

  getNumber(key: string): number | undefined {
    const val = this.map.get(key)
    return typeof val === "number" ? val : undefined
  }

  getBoolean(key: string): boolean | undefined {
    const val = this.map.get(key)
    return typeof val === "boolean" ? val : undefined
  }

  getBuffer(key: string): Uint8Array | undefined {
    const val = this.map.get(key)
    return val instanceof Uint8Array ? val : undefined
  }

  delete(key: string): void {
    this.map.delete(key)
    this.listeners.forEach((listener) => {
      try {
        listener(key)
      } catch {}
    })
  }

  clearAll(): void {
    this.map.clear()
  }

  getAllKeys(): string[] {
    return Array.from(this.map.keys())
  }

  contains(key: string): boolean {
    return this.map.has(key)
  }

  addOnValueChangedListener(listener: (key: string) => void): { remove: () => void } {
    this.listeners.add(listener)
    return {
      remove: () => {
        this.listeners.delete(listener)
      },
    }
  }

  recrypt(): void {}
  trim(): void {}
  size = 0
  isReadOnly = false
}
