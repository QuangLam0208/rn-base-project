import { ReactNode } from "react"
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

import { Text, TextProps } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const

export interface PinPadProps {
  /** Digits entered so far — rendered as filled dots, never as text. */
  value: string
  length: number
  onDigit: (digit: string) => void
  onDelete: () => void
  titleTx: TextProps["tx"]
  subtitleTx?: TextProps["tx"]
  /** Already-translated error line under the dots (e.g. "Wrong PIN, 3 attempts left"). */
  errorText?: string | null
  disabled?: boolean
  /** Optional content for the bottom-left key (the lock screen puts the biometric button here). */
  leftKey?: ReactNode
}

/**
 * Title + PIN dots + 3×4 numeric keypad. Purely presentational — whoever
 * renders it owns the PIN string (AppLockScreen, PinCodeScreen). Uses its
 * own keypad instead of a TextInput so the system keyboard / autofill /
 * keyboard-learning never sees the PIN.
 */
export function PinPad(props: PinPadProps) {
  const { value, length, onDigit, onDelete, titleTx, subtitleTx, errorText, disabled, leftKey } =
    props
  const { themed } = useAppTheme()

  const renderKey = (digit: string) => (
    <TouchableOpacity
      key={digit}
      style={themed($key)}
      onPress={() => onDigit(digit)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={digit}
    >
      <Text text={digit} style={themed($keyText)} />
    </TouchableOpacity>
  )

  return (
    <View style={themed($container)}>
      <View style={themed($header)}>
        <Text tx={titleTx} preset="subheading" style={themed($title)} />
        {subtitleTx && <Text tx={subtitleTx} size="xs" style={themed($subtitle)} />}

        <View style={themed($dotsRow)} accessibilityLabel={`${value.length}/${length}`}>
          {Array.from({ length }, (_, i) => (
            <View key={i} style={[themed($dot), i < value.length && themed($dotFilled)]} />
          ))}
        </View>

        <Text text={errorText ?? " "} size="xs" style={themed($error)} />
      </View>

      <View style={themed($keypad)}>
        {KEYS.map(renderKey)}
        <View style={themed($key)}>{leftKey}</View>
        {renderKey("0")}
        <TouchableOpacity
          style={themed($key)}
          onPress={onDelete}
          disabled={disabled || value.length === 0}
          accessibilityRole="button"
          accessibilityLabel="delete"
        >
          <Text text="⌫" style={themed($keyText)} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const KEY_SIZE = 72

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "space-between",
  paddingVertical: spacing.xl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
})

const $title: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginTop: spacing.xs,
})

const $dotsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  marginTop: spacing.xl,
})

const $dot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 1.5,
  borderColor: colors.tint,
})

const $dotFilled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
})

const $error: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginTop: spacing.md,
  minHeight: 18,
})

const $keypad: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignSelf: "center",
  width: KEY_SIZE * 3 + spacing.xl * 2,
  rowGap: spacing.md,
})

const $key: ThemedStyle<ViewStyle> = () => ({
  width: KEY_SIZE,
  height: KEY_SIZE,
  borderRadius: KEY_SIZE / 2,
  alignItems: "center",
  justifyContent: "center",
})

const $keyText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 28,
  lineHeight: 34,
  color: colors.text,
})
