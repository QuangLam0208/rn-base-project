import { useState } from "react"
import { Alert, ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Button } from "@/components/Button"
import { Icon, PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Radio } from "@/components/Toggle/Radio"
import { Switch } from "@/components/Toggle/Switch"
import { changeLanguage, getCurrentLanguage, SupportedLanguageTag, TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { container } from "@/di/container"
import { AuthStore } from "@/stores/authStore"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { checkForUpdate, downloadAndApplyUpdate } from "@/utils/appUpdates"

type UpdateStatus =
  "idle" | "checking" | "up-to-date" | "available" | "downloading" | "disabled" | "error"

const updateStatusTx: Partial<Record<UpdateStatus, TxKeyPath>> = {
  "checking": "settingsScreen:updateChecking",
  "up-to-date": "settingsScreen:updateUpToDate",
  "available": "settingsScreen:updateAvailable",
  "downloading": "settingsScreen:updateDownloading",
  "disabled": "settingsScreen:updateDisabledDev",
  "error": "settingsScreen:updateError",
}

export function SettingsScreen() {
  const { themed, themeContext, setThemeContextOverride } = useAppTheme()
  const navigation = useNavigation<AppStackScreenProps<"Settings">["navigation"]>()

  const handleLogout = () => {
    Alert.alert(
      translate("settingsScreen:logoutConfirmTitle"),
      translate("settingsScreen:logoutConfirmMessage"),
      [
        { text: translate("common:cancel"), style: "cancel" },
        {
          text: translate("settingsScreen:logout"),
          style: "destructive",
          onPress: () => {
            container.get(AuthStore).clearToken()
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          },
        },
      ],
    )
  }

  // Local state so the radio selection reacts immediately — changeLanguage()
  // itself doesn't trigger a re-render here (see app/i18n/index.ts).
  const [language, setLanguage] = useState<SupportedLanguageTag>(getCurrentLanguage())

  const selectLanguage = (tag: SupportedLanguageTag) => {
    setLanguage(tag)
    changeLanguage(tag)
  }

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle")

  const handleCheckForUpdate = async () => {
    setUpdateStatus("checking")
    const result = await checkForUpdate()
    setUpdateStatus(result.status)
  }

  const handleApplyUpdate = async () => {
    setUpdateStatus("downloading")
    try {
      // reloadAsync() restarts the app on success — this line is only
      // reached if fetching/applying the update itself fails.
      await downloadAndApplyUpdate()
    } catch {
      setUpdateStatus("error")
    }
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($container)}>
      <View style={themed($header)}>
        <PressableIcon icon="back" size={28} onPress={() => navigation.goBack()} />
        <Text tx="settingsScreen:title" preset="heading" style={themed($headerTitle)} />
      </View>

      <View style={themed($section)}>
        <Text
          tx="settingsScreen:languageSection"
          preset="formLabel"
          style={themed($sectionLabel)}
        />
        <Radio
          value={language === "vi"}
          onValueChange={() => selectLanguage("vi")}
          labelTx="settingsScreen:languageVi"
          containerStyle={themed($row)}
        />
        <Radio
          value={language === "en"}
          onValueChange={() => selectLanguage("en")}
          labelTx="settingsScreen:languageEn"
          containerStyle={themed($row)}
        />
      </View>

      <View style={themed($section)}>
        <Text tx="settingsScreen:themeSection" preset="formLabel" style={themed($sectionLabel)} />
        <Switch
          value={themeContext === "dark"}
          onValueChange={(value) => setThemeContextOverride(value ? "dark" : "light")}
          labelTx="settingsScreen:darkMode"
          containerStyle={themed($row)}
        />
      </View>

      <View style={themed($section)}>
        <Text tx="settingsScreen:updateSection" preset="formLabel" style={themed($sectionLabel)} />
        {updateStatusTx[updateStatus] && (
          <Text tx={updateStatusTx[updateStatus]} size="xs" style={themed($updateStatusText)} />
        )}
        {updateStatus === "available" ? (
          <Button tx="settingsScreen:updateNow" onPress={handleApplyUpdate} style={themed($row)} />
        ) : (
          <Button
            tx="settingsScreen:checkForUpdate"
            onPress={handleCheckForUpdate}
            disabled={updateStatus === "checking" || updateStatus === "downloading"}
            style={themed($row)}
          />
        )}
      </View>

      <View style={themed($footer)}>
        <TouchableOpacity
          style={themed($logoutButton)}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon icon="logout" size={20} color="#FFFFFF" style={themed($logoutIcon)} />
          <Text tx="settingsScreen:logout" style={themed($logoutText)} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  // Screen's "fixed" preset defaults contentContainerStyle to
  // justifyContent: "flex-end" — harmless for other screens here since
  // their content is a flex:1 FlatList, but this screen's rows are fixed
  // height, so without this override they'd all sink to the bottom.
  justifyContent: "flex-start",
})

const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $headerTitle: ThemedStyle<TextStyle> = () => ({
  textAlign: "left",
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.lg,
})

const $sectionLabel: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $updateStatusText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.sm,
})

const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: "auto",
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.lg,
})

const $logoutButton: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#E53935",
  borderRadius: 10,
  height: 52,
})

const $logoutIcon: ThemedStyle<ImageStyle> = () => ({
  marginRight: 8,
})

const $logoutText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  fontWeight: "600",
  color: "#FFFFFF",
})
