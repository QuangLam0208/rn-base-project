import * as Crypto from "expo-crypto"

/**
 * Salted SHA-256 hashing for the app-lock PIN — the raw PIN is never
 * persisted, only `"<saltHex>:<hashHex>"`. Kept as a plain object (not a
 * class) so `AppLockStore` can take it as a constructor default and tests
 * can swap in a synchronous fake.
 */
export interface PinHasher {
  hash(pin: string): Promise<string>
  verify(pin: string, stored: string): Promise<boolean>
}

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")

const digest = (salt: string, pin: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`)

export const pinHasher: PinHasher = {
  async hash(pin) {
    const salt = toHex(Crypto.getRandomBytes(16))
    return `${salt}:${await digest(salt, pin)}`
  },

  async verify(pin, stored) {
    const [salt, expected] = stored.split(":")
    if (!salt || !expected) return false
    return (await digest(salt, pin)) === expected
  },
}
