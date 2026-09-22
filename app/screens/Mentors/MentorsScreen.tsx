import { useEffect } from "react"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useViewModel } from "@/di/useViewModel"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { MentorCard } from "./components/MentorCard/MentorCard"
import { MentorSkeleton } from "./components/MentorSkeleton/MentorSkeleton"
import { MentorsViewModel } from "./MentorsViewModel"

export const MentorsScreen = observer(function MentorsScreen() {
  const { themed, theme: { colors } } = useAppTheme()
  const viewModel = useViewModel(MentorsViewModel)
  const navigation = useNavigation<AppStackScreenProps<"MainTabs">["navigation"]>()

  useEffect(() => {
    viewModel.loadMentors()
  }, [viewModel])

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContainer)}
    >
      {/* Header Heading: "Mentor" */}
      <View style={themed($headerContainer)}>
        <Text tx="mentorsScreen:title" style={themed($headingText)} />
      </View>

      {/* Main Content */}
      {viewModel.isInitialLoading ? (
        <View style={themed($skeletonContainer)}>
          <MentorSkeleton />
          <MentorSkeleton />
          <MentorSkeleton />
        </View>
      ) : viewModel.mentors.length === 0 ? (
        <View style={themed($emptyContainer)}>
          <Icon icon="menu" size={56} color={colors.textDim} />
          <Text tx="mentorsScreen:emptyMentors" style={themed($emptyText)} />
        </View>
      ) : (
        <FlatList
          data={viewModel.mentors}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MentorCard
              mentor={item}
              onPress={() =>
                navigation.navigate("MentorDetail", {
                  mentorId: item.id,
                  initialMentor: item,
                })
              }
            />
          )}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
          onEndReached={viewModel.loadMoreMentors}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            viewModel.isLoadingMore ? (
              <View style={themed($footerLoader)}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={viewModel.isRefreshing}
              onRefresh={viewModel.refreshMentors}
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

const $footerLoader: ThemedStyle<ViewStyle> = () => ({
  paddingVertical: 16,
  alignItems: "center",
  justifyContent: "center",
})

