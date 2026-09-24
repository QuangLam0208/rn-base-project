import { useEffect } from "react"
import {
  FlatList,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { Button } from "@/components/Button"
import { Icon, PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { TodoEntity, TodoPriority } from "@/data/model/room/TodoEntity"
import { useViewModel } from "@/di/useViewModel"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { TodoFilter, TodoListViewModel } from "./TodoListViewModel"

const PRIORITIES: TodoPriority[] = ["low", "medium", "high"]
const FILTERS: TodoFilter[] = ["all", "active", "done"]

function formatTime(timestamp?: number | null): string {
  if (!timestamp) return ""
  const d = new Date(timestamp)
  const h = d.getHours().toString().padStart(2, "0")
  const m = d.getMinutes().toString().padStart(2, "0")
  const s = d.getSeconds().toString().padStart(2, "0")
  return `${h}:${m}:${s}`
}

export const TodoListScreen = observer(function TodoListScreen() {
  const { themed, theme } = useAppTheme()
  const viewModel = useViewModel(TodoListViewModel)
  const navigation = useNavigation<AppStackScreenProps<"TodoList">["navigation"]>()

  useEffect(() => {
    viewModel.loadTodos()
  }, [viewModel])

  const renderTodoItem = ({ item }: { item: TodoEntity }) => {
    const isDone = item.isDone
    const priorityColor =
      item.priority === "high"
        ? theme.colors.danger
        : item.priority === "medium"
          ? theme.colors.warning
          : theme.colors.success

    return (
      <View style={themed($todoCard)}>
        <TouchableOpacity
          style={[themed($checkbox), isDone && themed($checkboxChecked)]}
          onPress={() => viewModel.toggleTodo(item)}
          activeOpacity={0.7}
        >
          {isDone && <Icon icon="check" size={16} color={theme.colors.white} />}
        </TouchableOpacity>

        <View style={themed($todoContent)}>
          <Text
            text={item.title}
            style={[themed($todoTitle), isDone && themed($todoTitleDone)]}
            numberOfLines={2}
          />
          <View style={themed($tagRow)}>
            <View style={[themed($priorityBadge), { borderColor: priorityColor }]}>
              <Text
                tx={`todoListScreen:priority_${item.priority}` as any}
                size="xs"
                style={{ color: priorityColor, fontWeight: "600" }}
              />
            </View>
            {isDone && item.doneAt ? (
              <View style={themed($doneBadge)}>
                <Text
                  text={`${translate("todoListScreen:doneAtLabel")} ${formatTime(item.doneAt)}`}
                  size="xs"
                  style={themed($doneText)}
                />
              </View>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={themed($deleteButton)}
          onPress={() => item.id !== undefined && viewModel.deleteTodo(item.id)}
          activeOpacity={0.7}
        >
          <Icon icon="x" size={18} color={theme.colors.textDim} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <View style={themed($header)}>
        <PressableIcon icon="back" size={28} onPress={() => navigation.goBack()} />
        <Text tx="todoListScreen:title" preset="heading" style={themed($headerTitle)} />
      </View>

      <View style={themed($formSection)}>
        <Text tx="todoListScreen:description" size="xs" style={themed($descText)} />

        <TextField
          value={viewModel.newTitle}
          onChangeText={viewModel.setNewTitle}
          placeholderTx="todoListScreen:inputPlaceholder"
          containerStyle={themed($inputContainer)}
        />

        <View style={themed($prioritySelectRow)}>
          <Text tx="todoListScreen:priorityLabel" size="sm" style={themed($priorityLabel)} />
          <View style={themed($priorityButtonGroup)}>
            {PRIORITIES.map((p) => {
              const isSelected = viewModel.newPriority === p
              return (
                <TouchableOpacity
                  key={p}
                  style={[themed($priorityChip), isSelected && themed($priorityChipSelected)]}
                  onPress={() => viewModel.setNewPriority(p)}
                >
                  <Text
                    tx={`todoListScreen:priority_${p}` as any}
                    size="xs"
                    style={[
                      themed($priorityChipText),
                      isSelected && themed($priorityChipTextSelected),
                    ]}
                  />
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <Button
          tx="todoListScreen:addButton"
          onPress={viewModel.addTodo}
          disabled={!viewModel.newTitle.trim()}
          style={themed($addButton)}
        />
      </View>

      <View style={themed($filterSection)}>
        {FILTERS.map((f) => {
          const isSelected = viewModel.filter === f
          return (
            <TouchableOpacity
              key={f}
              style={[themed($filterTab), isSelected && themed($filterTabSelected)]}
              onPress={() => viewModel.setFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                tx={`todoListScreen:filter_${f}` as any}
                size="sm"
                style={[
                  themed($filterTabText),
                  isSelected && themed($filterTabTextSelected),
                ]}
              />
            </TouchableOpacity>
          )
        })}
      </View>

      <FlatList
        data={viewModel.filteredTodos}
        keyExtractor={(item) => String(item.id ?? Math.random())}
        renderItem={renderTodoItem}
        contentContainerStyle={themed($listContent)}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Text tx="todoListScreen:empty" style={themed($emptyText)} />
          </View>
        }
      />
    </Screen>
  )
})

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
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

const $formSection: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $descText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.sm,
})

const $inputContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $prioritySelectRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginVertical: spacing.xs,
})

const $priorityLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $priorityButtonGroup: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
})

const $priorityChip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
})

const $priorityChipSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $priorityChipText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $priorityChipTextSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.white,
  fontWeight: "bold",
})

const $addButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  gap: spacing.sm,
})

const $todoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.surface,
  padding: spacing.sm,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
})

const $checkbox: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 24,
  height: 24,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: colors.textDim,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
})

const $checkboxChecked: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $todoContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $todoTitle: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: fontSizes.content,
  color: colors.text,
})

const $todoTitleDone: ThemedStyle<TextStyle> = ({ colors }) => ({
  textDecorationLine: "line-through",
  color: colors.textDim,
})

const $tagRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginTop: spacing.xxs,
})

const $priorityBadge: ThemedStyle<ViewStyle> = () => ({
  paddingHorizontal: 6,
  paddingVertical: 1,
  borderRadius: 4,
  borderWidth: 1,
})

const $deleteButton: ThemedStyle<ViewStyle> = () => ({
  padding: 6,
  marginLeft: 8,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  alignItems: "center",
  justifyContent: "center",
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  color: colors.textDim,
  fontSize: fontSizes.content,
})

const $filterSection: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  backgroundColor: colors.background,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  gap: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $filterTab: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  paddingVertical: spacing.xs,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.surface,
})

const $filterTabSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $filterTabText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontWeight: "500",
})

const $filterTabTextSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.white,
  fontWeight: "bold",
})

const $doneBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 6,
  paddingVertical: 1,
  borderRadius: 4,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  marginLeft: spacing.xs,
})

const $doneText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

