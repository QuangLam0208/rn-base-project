import { useEffect } from "react"
import { Alert, BackHandler, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { PinPad } from "@/components/PinPad/PinPad"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useViewModel } from "@/di/useViewModel"
import { translate } from "@/i18n/translate"
import { resetRoot } from "@/navigators/navigationUtilities"
import { PIN_LENGTH } from "@/stores/appLockStore"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { AppLockViewModel, UnlockOutcome } from "./AppLockViewModel"

const goToLogin = () => resetRoot({ index: 0, routes: [{ name: "Login" }] })

/**
 * Full-screen PIN / biometric lock shown on cold start. Not a navigation
 * route — `AppLockGate` renders it *over* the navigator, so whatever screen
 * was restored underneath stays mounted and simply appears once unlocked.
 */
export const AppLockScreen = observer(function AppLockScreen() {
  const { themed } = useAppTheme()
  const viewModel = useViewModel(AppLockViewModel)

  useEffect(() => {
    viewModel.init()
    // Android back button must not reach the navigator underneath — leave the app instead.
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      BackHandler.exitApp()
      return true
    })
    return () => sub.remove()
  }, [viewModel])

  const handleOutcome = (outcome: UnlockOutcome) => {
    if (outcome === "logged-out") goToLogin()
  }

  const onDigit = async (digit: string) => handleOutcome(await viewModel.appendDigit(digit))

  const onForgotPin = () => {
    Alert.alert(translate("appLock:forgotPinConfirmTitle"), translate("appLock:forgotPinConfirmMessage"), [
      { text: translate("common:cancel"), style: "cancel" },
      {
        text: translate("appLock:signInAgain"),
        style: "destructive",
        onPress: async () => {
          await viewModel.forceLogout()
          goToLogin()
        },
      },
    ])
  }

  const biometricKey = viewModel.biometricLabel ? (
    <TouchableOpacity
      onPress={viewModel.unlockWithBiometric}
      style={themed($biometricKey)}
      accessibilityRole="button"
    >
      <Text
        text={translate("appLock:useBiometric", { method: viewModel.biometricLabel })}
        size="xs"
        style={themed($linkText)}
      />
    </TouchableOpacity>
  ) : null

  return (
    <View style={themed($overlay)}>
      <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($content)}>
        <PinPad
          value={viewModel.pin}
          length={PIN_LENGTH}
          onDigit={onDigit}
          onDelete={viewModel.deleteDigit}
          titleTx="appLock:title"
          subtitleTx="appLock:subtitle"
          errorText={viewModel.errorText}
          disabled={viewModel.isLoading}
          leftKey={biometricKey}
        />
        <TouchableOpacity onPress={onForgotPin} style={themed($forgot)} accessibilityRole="button">
          <Text tx="appLock:forgotPin" style={themed($linkText)} />
        </TouchableOpacity>
      </Screen>
    </View>
  )
})

const $overlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1000,
  elevation: 1000,
  backgroundColor: colors.background,
})

const $content: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $biometricKey: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
})

const $forgot: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "center",
  padding: spacing.sm,
  marginBottom: spacing.md,
})

const $linkText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  textAlign: "center",
})
