import { useEffect } from "react"
import {
  FlatList,
  RefreshControl,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useViewModel } from "@/di/useViewModel"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { CourseCard } from "./components/CourseCard/CourseCard"
import { CourseSkeleton } from "./components/CourseSkeleton/CourseSkeleton"
import { CoursesViewModel } from "./CoursesViewModel"

export const CoursesScreen = observer(function CoursesScreen() {
  const { themed, theme: { colors } } = useAppTheme()
  const viewModel = useViewModel(CoursesViewModel)

  useEffect(() => {
    viewModel.loadCourses()
  }, [viewModel])

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContainer)}
    >
      {/* Header Heading: "Đang diễn ra" */}
      <View style={themed($headerContainer)}>
        <Text tx="coursesScreen:headingOngoing" style={themed($headingText)} />
      </View>

      {/* Main Content */}
      {viewModel.isInitialLoading ? (
        <View style={themed($skeletonContainer)}>
          <CourseSkeleton />
          <CourseSkeleton />
        </View>
      ) : viewModel.courses.length === 0 ? (
        <View style={themed($emptyContainer)}>
          <Icon icon="menu" size={56} color={colors.textDim} />
          <Text tx="coursesScreen:emptyCourses" style={themed($emptyText)} />
        </View>
      ) : (
        <FlatList
          data={viewModel.courses}
          extraData={{
            expandedCourseIds: viewModel.expandedCourseIds,
            syllabusMap: viewModel.syllabusMap,
            syllabusLoadingMap: viewModel.syllabusLoadingMap,
            expandedSyllabusItemIds: viewModel.expandedSyllabusItemIds,
          }}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              isExpanded={!!viewModel.expandedCourseIds[item.id]}
              isLoadingSyllabus={!!viewModel.syllabusLoadingMap[item.id]}
              syllabuses={viewModel.syllabusMap[item.id]}
              expandedSyllabusItemIds={viewModel.expandedSyllabusItemIds}
              onToggleSyllabus={() => viewModel.toggleCourseSyllabus(item.id)}
              onToggleSyllabusItem={viewModel.toggleSyllabusItem}
            />
          )}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={viewModel.isRefreshing}
              onRefresh={viewModel.refreshCourses}
              tintColor={colors.tint}
              colors={[colors.tint]}
            />
          }
        />
      )}
    </Screen>
  )
})

const $screenContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $headerContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 14,
})

const $headingText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 19,
  color: colors.text,
  textAlign: "center",
})

const $skeletonContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $listContent: ThemedStyle<ViewStyle> = () => ({
  paddingBottom: 28,
})

const $emptyContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingBottom: 60,
})

const $emptyText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 16,
  color: colors.textDim,
  marginTop: 12,
  textAlign: "center",
})
