import { useEffect, useRef } from "react"
import { Animated, View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function CourseSkeleton() {
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
      {/* Banner Skeleton */}
      <Animated.View style={[themed($skeletonBlock), themed($banner), { opacity: pulseAnim }]} />

      {/* Title Line 1 */}
      <Animated.View style={[themed($skeletonBlock), themed($titleLine1), { opacity: pulseAnim }]} />

      {/* Title Line 2 */}
      <Animated.View style={[themed($skeletonBlock), themed($titleLine2), { opacity: pulseAnim }]} />

      {/* Price */}
      <Animated.View style={[themed($skeletonBlock), themed($price), { opacity: pulseAnim }]} />

      {/* Description Line 1 */}
      <Animated.View style={[themed($skeletonBlock), themed($descLine1), { opacity: pulseAnim }]} />

      {/* Description Line 2 */}
      <Animated.View style={[themed($skeletonBlock), themed($descLine2), { opacity: pulseAnim }]} />

      {/* Button */}
      <Animated.View style={[themed($skeletonBlock), themed($button), { opacity: pulseAnim }]} />
    </View>
  )
}

const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 13,
  marginHorizontal: 12,
  marginTop: 12,
  padding: 13,
})

const $skeletonBlock: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  backgroundColor: isDark ? "#262D36" : "#E2E8F0",
  borderRadius: 10,
})

const $banner: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: 203,
  borderRadius: 10,
})

const $titleLine1: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: 20,
  marginTop: 18,
})

const $titleLine2: ThemedStyle<ViewStyle> = () => ({
  width: "60%",
  height: 20,
  marginTop: 8,
})

const $price: ThemedStyle<ViewStyle> = () => ({
  width: 140,
  height: 24,
  marginTop: 17,
})

const $descLine1: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: 14,
  marginTop: 17,
})

const $descLine2: ThemedStyle<ViewStyle> = () => ({
  width: "70%",
  height: 14,
  marginTop: 8,
})

const $button: ThemedStyle<ViewStyle> = () => ({
  width: 150,
  height: 50,
  borderRadius: 10,
  marginTop: 25,
})
