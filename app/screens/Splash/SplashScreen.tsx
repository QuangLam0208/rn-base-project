import { useEffect } from "react"
import { Image, ImageStyle, TextStyle, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { container } from "@/di/container"
import { AuthStore } from "@/stores/authStore"

const SPLASH_DELAY_MS = 1500

/**
 * Fallback splash screen component (retained for backward compatibility).
 */
export function SplashScreen() {
  const { themed } = useAppTheme()
  const navigation = useNavigation<AppStackScreenProps<"Splash">["navigation"]>()

  useEffect(() => {
    const timer = setTimeout(() => {
      const initialRoute = container.get(AuthStore).isAuthenticated ? "MainTabs" : "Login"
      navigation.reset({
        index: 0,
        routes: [{ name: initialRoute }],
      })
    }, SPLASH_DELAY_MS)

    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <Screen
      preset="fixed"
      backgroundColor="#182029"
      contentContainerStyle={themed($container)}
    >
      <Image
        source={require("../../../assets/images/app-icon-android-adaptive-foreground.png")}
        style={themed($logo)}
        resizeMode="contain"
      />
      <Text tx="splashScreen:appName" preset="heading" style={themed($appName)} />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: 140,
  height: 140,
})

const $appName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  color: colors.white,
})
