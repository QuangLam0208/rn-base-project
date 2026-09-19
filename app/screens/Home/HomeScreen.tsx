import { View, TextStyle, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useViewModel } from "@/di/useViewModel"
import type { MainTabScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { HomeViewModel } from "./HomeViewModel"

/**
 * The app's one example tab — replace with real screens. Shows the
 * minimal MVVM/DI wiring in action (see HomeViewModel), and the gear
 * icon that opens the stack-pushed Settings screen (language/theme/OTA
 * update) — mirroring where that icon used to live before the base
 * extraction removed the business tabs.
 */
export const HomeScreen = observer(function HomeScreen() {
  const { themed } = useAppTheme()
  const viewModel = useViewModel(HomeViewModel)
  const navigation = useNavigation<MainTabScreenProps<"Home">["navigation"]>()

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={themed($container)}>
      <View style={themed($header)}>
        <Text tx="mainNavigator:homeTab" preset="heading" style={themed($headerTitle)} />
        <PressableIcon icon="settings" size={28} onPress={() => navigation.navigate("Settings")} />
      </View>

      <View style={themed($body)}>
        <Text tx="homeScreen:subtitle" style={themed($subtitle)} />
        <Text text={String(viewModel.count)} preset="heading" style={themed($count)} />
        <Button tx="homeScreen:incrementButton" onPress={viewModel.increment} />
      </View>
    </Screen>
  )
})

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
})

const $headerTitle: ThemedStyle<TextStyle> = () => ({})

const $body: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
})

const $subtitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.lg,
  color: colors.textDim,
  textAlign: "center",
})

const $count: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})
