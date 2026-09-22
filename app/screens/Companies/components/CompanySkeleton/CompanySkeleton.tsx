import { useEffect, useRef } from "react"
import { Animated, View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function CompanySkeleton() {
  const { themed } = useAppTheme()
  const pulseAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [pulseAnim])

  return (
    <View style={themed($card)}>
      <View style={themed($row)}>
        {/* Logo Skeleton */}
        <Animated.View style={[themed($skeletonBlock), themed($logo), { opacity: pulseAnim }]} />

        {/* Name & Subtitle Skeleton */}
        <View style={themed($textContainer)}>
          <Animated.View style={[themed($skeletonBlock), themed($nameLine), { opacity: pulseAnim }]} />
          <Animated.View style={[themed($skeletonBlock), themed($subtitleLine), { opacity: pulseAnim }]} />
        </View>
      </View>
    </View>
  )
}

const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 14,
  marginHorizontal: 12,
  marginTop: 12,
  padding: 16,
})

const $row: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $skeletonBlock: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  backgroundColor: isDark ? "#262D36" : "#E2E8F0",
  borderRadius: 6,
})

const $logo: ThemedStyle<ViewStyle> = () => ({
  width: 48,
  height: 48,
  borderRadius: 10,
})

const $textContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  marginLeft: 14,
})

const $nameLine: ThemedStyle<ViewStyle> = () => ({
  width: "60%",
  height: 18,
})

const $subtitleLine: ThemedStyle<ViewStyle> = () => ({
  width: "45%",
  height: 14,
  marginTop: 8,
})
