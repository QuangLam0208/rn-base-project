import { useEffect } from "react"
import { View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { PressableIcon } from "@/components/Icon"
import { PinPad } from "@/components/PinPad/PinPad"
import { Screen } from "@/components/Screen"
import { useViewModel } from "@/di/useViewModel"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { PIN_LENGTH } from "@/stores/appLockStore"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { PinCodeOutcome, PinCodeViewModel } from "./PinCodeViewModel"

/** Create / change / disable the app-lock PIN — pushed from Settings with `{ mode }`. */
export const PinCodeScreen = observer(function PinCodeScreen({
  navigation,
  route,
}: AppStackScreenProps<"PinCode">) {
  const { themed } = useAppTheme()
  const viewModel = useViewModel(PinCodeViewModel)
  const { mode } = route.params

  useEffect(() => {
    viewModel.start(mode)
  }, [viewModel, mode])

  const handleOutcome = (outcome: PinCodeOutcome) => {
    if (outcome === "done") navigation.goBack()
    if (outcome === "logged-out") navigation.reset({ index: 0, routes: [{ name: "Login" }] })
  }

  const onDigit = async (digit: string) => handleOutcome(await viewModel.appendDigit(digit))

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($content)}>
      <View style={themed($header)}>
        <PressableIcon icon="back" size={28} onPress={() => navigation.goBack()} />
      </View>
      <PinPad
        value={viewModel.pin}
        length={PIN_LENGTH}
        onDigit={onDigit}
        onDelete={viewModel.deleteDigit}
        titleTx={viewModel.titleTx}
        subtitleTx={viewModel.subtitleTx}
        errorText={viewModel.errorText}
        disabled={viewModel.isLoading}
      />
    </Screen>
  )
})

const $content: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})
