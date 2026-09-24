import React from "react"
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { ToastConfig, ToastConfigParams } from "react-native-toast-message"

import { Icon, IconTypes } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { Colors, ThemedStyle } from "@/theme/types"

type ToastVariant = "success" | "error" | "warning" | "normal"

interface ToastVariantData {
  bg: string
  stroke: string
  iconColor: string
  icon: IconTypes
}

function getToastVariant(colors: Colors, variant: ToastVariant): ToastVariantData {
  switch (variant) {
    case "success":
      return {
        bg: colors.toastSuccessBg,
        stroke: colors.toastSuccessStroke,
        iconColor: colors.toastSuccessStroke,
        icon: "check",
      }
    case "error":
      return {
        bg: colors.toastErrorBg,
        stroke: colors.toastErrorStroke,
        iconColor: colors.toastErrorStroke,
        icon: "x",
      }
    case "warning":
      return {
        bg: colors.toastWarningBg,
        stroke: colors.toastWarningStroke,
        iconColor: colors.toastWarningStroke,
        icon: "bell",
      }
    case "normal":
    default:
      return {
        bg: colors.toastNormalBg,
        stroke: colors.toastNormalStroke,
        iconColor: colors.link,
        icon: "bell",
      }
  }
}

interface CustomToastProps extends ToastConfigParams<any> {
  variant: ToastVariant
}

function CustomToastItem({ text1, text2, onPress, variant }: CustomToastProps) {
  const { theme, themed } = useAppTheme()
  const config = getToastVariant(theme.colors, variant)
  const hasSubtitle = Boolean(text2)

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        themed($container),
        {
          backgroundColor: config.bg,
          borderColor: config.stroke,
        },
      ]}
    >
      <View style={themed($iconWrapper)}>
        <Icon icon={config.icon} color={config.iconColor} size={18} />
      </View>
      <View style={themed($textContainer)}>
        {hasSubtitle ? (
          <>
            <Text text={text1} style={themed($titleText)} numberOfLines={1} />
            <Text text={text2} style={themed($subtitleText)} numberOfLines={2} />
          </>
        ) : (
          <Text text={text1} style={themed($singleText)} numberOfLines={2} />
        )}
      </View>
    </TouchableOpacity>
  )
}

export const toastConfig: ToastConfig = {
  success: (props) => <CustomToastItem {...props} variant="success" />,
  error: (props) => <CustomToastItem {...props} variant="error" />,
  warning: (props) => <CustomToastItem {...props} variant="warning" />,
  normal: (props) => <CustomToastItem {...props} variant="normal" />,
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "center",
  maxWidth: "92%",
  minHeight: 44,
  paddingStart: 14,
  paddingEnd: 18,
  paddingVertical: 10,
  borderRadius: 24,
  borderWidth: 1.2,
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 5,
  elevation: 6,
})

const $iconWrapper: ThemedStyle<ViewStyle> = () => ({
  marginRight: 10,
  justifyContent: "center",
  alignItems: "center",
})

const $textContainer: ThemedStyle<ViewStyle> = () => ({
  flexShrink: 1,
  justifyContent: "center",
})

const $singleText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  color: colors.toastText,
  fontSize: fontSizes.content,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

const $titleText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  color: colors.toastText,
  fontSize: fontSizes.content,
  lineHeight: 18,
  fontFamily: typography.primary.bold,
  marginBottom: 2,
})

const $subtitleText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  color: colors.toastTextDim,
  fontSize: fontSizes.sm,
  lineHeight: 18,
  fontFamily: typography.primary.normal,
})
