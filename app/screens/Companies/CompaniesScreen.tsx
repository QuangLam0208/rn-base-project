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

import { CompanyCard } from "./components/CompanyCard/CompanyCard"
import { CompanySkeleton } from "./components/CompanySkeleton/CompanySkeleton"
import { CompaniesViewModel } from "./CompaniesViewModel"

export const CompaniesScreen = observer(function CompaniesScreen() {
  const { themed, theme: { colors } } = useAppTheme()
  const viewModel = useViewModel(CompaniesViewModel)

  useEffect(() => {
    viewModel.loadCompanies()
  }, [viewModel])

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContainer)}
    >
      {/* Header Heading: "Doanh nghiệp" */}
      <View style={themed($headerContainer)}>
        <Text tx="companiesScreen:title" style={themed($headingText)} />
      </View>

      {/* Main Content */}
      {viewModel.isInitialLoading ? (
        <View style={themed($skeletonContainer)}>
          <CompanySkeleton />
          <CompanySkeleton />
          <CompanySkeleton />
        </View>
      ) : viewModel.companies.length === 0 ? (
        <View style={themed($emptyContainer)}>
          <Icon icon="menu" size={56} color={colors.textDim} />
          <Text tx="companiesScreen:emptyCompanies" style={themed($emptyText)} />
        </View>
      ) : (
        <FlatList
          data={viewModel.companies}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <CompanyCard company={item} />}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={viewModel.isRefreshing}
              onRefresh={viewModel.refreshCompanies}
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

const $headingText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: fontSizes.title,
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

const $emptyText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.normal,
  fontSize: fontSizes.content,
  color: colors.textDim,
  marginTop: 12,
  textAlign: "center",
})
