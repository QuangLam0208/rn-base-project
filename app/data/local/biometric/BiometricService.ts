import * as LocalAuthentication from "expo-local-authentication"
import { injectable } from "inversify"
import { Alert, Platform } from "react-native"

/**
 * Which biometric the device offers, used only to pick a label/icon:
 * - `faceId` / `touchId` — iOS (an iPhone has one or the other, never both)
 * - `fingerprint` — Android with only a fingerprint sensor
 * - `biometric` — Android with several strong biometrics (fingerprint + 3D face, iris…)
 */
export type BiometricKind = "faceId" | "touchId" | "fingerprint" | "biometric"

export interface BiometricSupport {
  /** Hardware present, something enrolled, and it's Class 3 ("strong") on Android. */
  isAvailable: boolean
  kind: BiometricKind | null
}

/**
 * Injectable wrapper around `expo-local-authentication` (iOS
 * `LocalAuthentication` / Android `BiometricPrompt`). The app never sees
 * any biometric data — the OS shows its own prompt and just answers
 * success / failure.
 */
@injectable()
export class BiometricService {
  async getSupport(): Promise<BiometricSupport> {
    try {
      const [hasHardware, isEnrolled, level, types] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.getEnrolledLevelAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ])

      // Allow BIOMETRIC_WEAK (Class 2) as well as BIOMETRIC_STRONG (Class 3) so
      // Android 2D camera Face Unlock works alongside fingerprint and iOS Face ID / Touch ID.
      const isAvailable =
        hasHardware && isEnrolled && level >= LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK

      return { isAvailable, kind: isAvailable ? this.resolveKind(types) : null }
    } catch {
      return { isAvailable: false, kind: null }
    }
  }

  /**
   * Shows the OS biometric prompt. `disableDeviceFallback: true` keeps the
   * OS from offering the *device* passcode — on failure/cancel the app
   * always falls back to its own PIN instead.
   *
   * Note for Expo Go on iOS: Expo Go's App Store binary does not include
   * `NSFaceIDUsageDescription`, so iOS refuses to open the TrueDepth Face ID
   * camera inside Expo Go and returns `error: "missing_usage_description"`
   * (see https://docs.expo.dev/versions/latest/sdk/local-authentication/#known-limitation).
   * In that case we present a simulated Face ID prompt so the full unlock /
   * fallback-to-app-PIN flow can still be tested in Expo Go on Windows.
   */
  async authenticate(promptMessage: string, cancelLabel: string): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        disableDeviceFallback: true,
        fallbackLabel: "",
        biometricsSecurityLevel: "weak",
      })
      if (!result.success && (result.error as string) === "missing_usage_description") {
        return this.simulateExpoGoFaceId(promptMessage, cancelLabel)
      }
      return result.success
    } catch {
      return false
    }
  }

  private simulateExpoGoFaceId(promptMessage: string, cancelLabel: string): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Face ID (Mô phỏng trên Expo Go)",
        `${promptMessage}\n\n(Lưu ý: App Expo Go trên iOS không hỗ trợ gọi camera Face ID thật; cần bản Development/Production build để quét Face ID thật)`,
        [
          {
            text: cancelLabel,
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Quét Face ID thành công",
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false },
      )
    })
  }

  private resolveKind(types: LocalAuthentication.AuthenticationType[]): BiometricKind {
    if (Platform.OS === "ios") {
      const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      return hasFace ? "faceId" : "touchId"
    }
    // On Android, PackageManager only reports which hardware sensors exist on
    // the device (and many OEMs don't declare FEATURE_FACE even when face
    // unlock is enrolled), never which specific biometric the user turned on.
    return "biometric"
  }
}
