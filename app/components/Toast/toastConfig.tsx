import React from "react"
import { TouchableOpacity, View, ViewStyle, TextStyle } from "react-native"
import { ToastConfig, ToastConfigParams } from "react-native-toast-message"

import { Icon, IconTypes } from "@/components/Icon"
import { Text } from "@/components/Text"
import { typography } from "@/theme/typography"

interface ToastVariantConfig {
  bg: string
  stroke: string
  iconColor: string
  icon: IconTypes
}

const TOAST_VARIANTS: Record<"success" | "error" | "warning" | "normal", ToastVariantConfig> = {
  success: {
    bg: "#1A2622",
    stroke: "#15CCA3",
    iconColor: "#15CCA3",
    icon: "check",
  },
  error: {
    bg: "#29181B",
    stroke: "#FF4D4F",
    iconColor: "#FF4D4F",
    icon: "x",
  },
  warning: {
    bg: "#292215",
    stroke: "#FFA726",
    iconColor: "#FFA726",
    icon: "bell",
  },
  normal: {
    bg: "#1D222A",
    stroke: "#3D4654",
    iconColor: "#4AA3BA",
    icon: "bell",
  },
}

interface CustomToastProps extends ToastConfigParams<any> {
  variant: keyof typeof TOAST_VARIANTS
}

function CustomToastItem({ text1, text2, onPress, variant }: CustomToastProps) {
  const config = TOAST_VARIANTS[variant]
  const hasSubtitle = Boolean(text2)

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        $container,
        {
          backgroundColor: config.bg,
          borderColor: config.stroke,
        },
      ]}
    >
      <View style={$iconWrapper}>
        <Icon icon={config.icon} color={config.iconColor} size={18} />
      </View>
      <View style={$textContainer}>
        {hasSubtitle ? (
          <>
            <Text text={text1} style={$titleText} numberOfLines={1} />
            <Text text={text2} style={$subtitleText} numberOfLines={2} />
          </>
        ) : (
          <Text text={text1} style={$singleText} numberOfLines={2} />
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

const $container: ViewStyle = {
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
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 5,
  elevation: 6,
}

const $iconWrapper: ViewStyle = {
  marginRight: 10,
  justifyContent: "center",
  alignItems: "center",
}

const $textContainer: ViewStyle = {
  flexShrink: 1,
  justifyContent: "center",
}

const $singleText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
}

const $titleText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 14,
  lineHeight: 18,
  fontFamily: typography.primary.bold,
  marginBottom: 2,
}

const $subtitleText: TextStyle = {
  color: "#CBD5E1",
  fontSize: 13,
  lineHeight: 18,
  fontFamily: typography.primary.normal,
}
