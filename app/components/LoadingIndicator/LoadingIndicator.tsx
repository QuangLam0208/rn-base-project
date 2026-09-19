import { ActivityIndicator, ActivityIndicatorProps, View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface LoadingIndicatorProps {
  /**
   * Spinner size, forwarded to ActivityIndicator. Defaults to "small".
   */
  size?: ActivityIndicatorProps["size"]
}

/**
 * A centered loading spinner tinted with the app's accent color, meant for
 * a screen's initial "loading, no data yet" state. Shared across screens —
 * see CLAUDE.md's sub-component convention for when to keep something local
 * instead.
 */
export const LoadingIndicator = ({ size = "small" }: LoadingIndicatorProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={themed($container)}>
      <ActivityIndicator size={size} color={colors.tint} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.lg,
})
