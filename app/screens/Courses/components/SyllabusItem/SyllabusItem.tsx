import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { SyllabusResponse } from "@/data/model/api/response/course/SyllabusResponse"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface SyllabusItemProps {
  syllabus: SyllabusResponse
  isExpanded: boolean
  onToggle: () => void
}

export const SyllabusItem = observer(function SyllabusItem({ syllabus, isExpanded, onToggle }: SyllabusItemProps) {
  const { themed } = useAppTheme()
  const hasDescription = !!syllabus.description && syllabus.description.trim().length > 0

  return (
    <TouchableOpacity
      style={themed($container)}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={themed($row)}>
        <View style={themed($contentContainer)}>
          <Text text={syllabus.name} style={themed($title)} />
          {isExpanded && hasDescription && (
            <Text text={syllabus.description ?? ""} style={themed($description)} />
          )}
        </View>
        <View style={themed($iconContainer)}>
          <Icon icon={isExpanded ? "minus" : "plus"} size={19} />
        </View>
      </View>
    </TouchableOpacity>
  )
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.syllabusStageBg,
  borderRadius: 10,
  marginTop: 21,
  paddingHorizontal: 16,
  paddingVertical: 16,
})

const $row: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
})

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $title: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 16,
  lineHeight: 24,
  color: colors.text,
})

const $iconContainer: ThemedStyle<ViewStyle> = () => ({
  width: 24,
  height: 24,
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 10,
})

const $description: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 26,
  color: colors.textDim,
  marginTop: 13,
})
