import { useEffect } from "react"
import { Image, ImageStyle, TextStyle, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

// Mirrors ai-project-android's SplashActivity.SPLASH_DELAY_MS — a brief,
// deliberate pause so the splash branding is actually visible, not just
// a flash.
const SPLASH_DELAY_MS = 1500

/**
 * The first screen on cold start. No auth gate in this base project, and
 * no ViewModel — it has no state, just a fixed delay before resetting
 * straight to MainTabs. `navigation.reset`, not `navigate`, so MainTabs
 * doesn't end up behind Splash in the back stack.
 */
export function SplashScreen() {
  const { themed } = useAppTheme()
  const navigation = useNavigation<AppStackScreenProps<"Splash">["navigation"]>()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      })
    }, SPLASH_DELAY_MS)

    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
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

const $appName: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})
