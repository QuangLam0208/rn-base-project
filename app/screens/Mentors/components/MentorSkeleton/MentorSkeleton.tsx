import { useEffect, useRef } from "react"
import { Animated, View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function MentorSkeleton() {
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
      <View style={themed($headerRow)}>
        {/* Avatar Skeleton */}
        <Animated.View style={[themed($skeletonBlock), themed($avatar), { opacity: pulseAnim }]} />

        {/* Name & Position Skeleton */}
        <View style={themed($headerTextContainer)}>
          <Animated.View style={[themed($skeletonBlock), themed($nameLine), { opacity: pulseAnim }]} />
          <Animated.View style={[themed($skeletonBlock), themed($positionLine), { opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Description Skeleton */}
      <Animated.View style={[themed($skeletonBlock), themed($descLine1), { opacity: pulseAnim }]} />
      <Animated.View style={[themed($skeletonBlock), themed($descLine2), { opacity: pulseAnim }]} />
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

const $headerRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $skeletonBlock: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  backgroundColor: isDark ? "#262D36" : "#E2E8F0",
  borderRadius: 6,
})

const $avatar: ThemedStyle<ViewStyle> = () => ({
  width: 48,
  height: 48,
  borderRadius: 24,
})

const $headerTextContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  marginLeft: 14,
})

const $nameLine: ThemedStyle<ViewStyle> = () => ({
  width: "60%",
  height: 18,
})

const $positionLine: ThemedStyle<ViewStyle> = () => ({
  width: "40%",
  height: 14,
  marginTop: 8,
})

const $descLine1: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: 14,
  marginTop: 14,
})

const $descLine2: ThemedStyle<ViewStyle> = () => ({
  width: "75%",
  height: 14,
  marginTop: 6,
})
