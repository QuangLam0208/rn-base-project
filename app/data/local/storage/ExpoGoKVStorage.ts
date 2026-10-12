import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite"

import { isExpoGo } from "@/utils/IsExpoGo"

/**
 * Key-Value storage used when running inside Expo Go (or Jest),
 * replacing native MMKV which requires custom TurboModules.
 * In Expo Go on a real device, values are mirrored into a local SQLite
 * table so auth tokens and app-lock flags survive reloads / cold starts.
 */
export class ExpoGoKVStorage {
  private map = new Map<string, string | number | boolean | ArrayBuffer | Uint8Array>()
  private listeners = new Set<(key: string) => void>()
  private db: SQLiteDatabase | null = null

  constructor() {
    if (isExpoGo) {
      try {
        this.db = openDatabaseSync("expogo_kv.db")
        this.db.execSync(
          "CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)",
        )
        const rows = this.db.getAllSync<{ key: string; value: string }>(
          "SELECT key, value FROM kv",
        )
        for (const row of rows) {
          this.map.set(row.key, row.value)
        }
      } catch {
        this.db = null
      }
    }
  }

  set(key: string, value: boolean | string | number | ArrayBuffer | Uint8Array): void {
    this.map.set(key, value)
    if (this.db && typeof value === "string") {
      try {
        this.db.runSync("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", key, value)
      } catch {}
    }
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
    if (this.db) {
      try {
        this.db.runSync("DELETE FROM kv WHERE key = ?", key)
      } catch {}
    }
    this.listeners.forEach((listener) => {
      try {
        listener(key)
      } catch {}
    })
  }

  clearAll(): void {
    this.map.clear()
    if (this.db) {
      try {
        this.db.execSync("DELETE FROM kv")
      } catch {}
    }
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
