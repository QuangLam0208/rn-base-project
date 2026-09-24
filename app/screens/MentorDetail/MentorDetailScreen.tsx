import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"

import { Button } from "@/components/Button"
import { Header } from "@/components/Header"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useViewModel } from "@/di/useViewModel"
import type { AppStackParamList } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { getAvatarUri } from "@/utils/imageUtils"
import { cleanDescription } from "@/utils/textUtils"

import { MentorDetailViewModel } from "./MentorDetailViewModel"

export const MentorDetailScreen = observer(function MentorDetailScreen() {
  const { themed, theme: { colors } } = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const route = useRoute<RouteProp<AppStackParamList, "MentorDetail">>()
  const { mentorId, initialMentor } = route.params

  const viewModel = useViewModel(MentorDetailViewModel)
  const [imageError, setImageError] = useState(false)

  const mentor = viewModel.mentor ?? initialMentor
  const account = mentor?.account
  const fullName = account?.fullName?.trim() || ""
  const position = mentor?.position?.trim() || ""
  const avatarUri = getAvatarUri(account?.avatarPath)
  const description = cleanDescription(mentor?.description)
  const email = account?.email?.trim() || ""
  const phone = account?.phone?.trim() || ""
  const roleName = account?.group?.name?.trim() || ""

  useEffect(() => {
    viewModel.loadMentor(mentorId, initialMentor)
  }, [viewModel, mentorId, initialMentor])

  useEffect(() => {
    setImageError(false)
  }, [avatarUri])

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["bottom"]}
      contentContainerStyle={themed($screenContainer)}
    >
      {/* Fixed Header: Back button + Title always pinned at top */}
      <Header
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
        titleTx="mentorDetailScreen:title"
        titleMode="center"
      />

      {viewModel.isLoadingDetail && !mentor ? (
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : !mentor && viewModel.detailError ? (
        <View style={themed($errorContainer)}>
          <Text tx="mentorDetailScreen:errorDetail" style={themed($errorText)} />
          <Button
            tx="mentorDetailScreen:retryButton"
            onPress={() => viewModel.loadMentor(mentorId, initialMentor)}
            style={themed($retryButton)}
          />
        </View>
      ) : mentor ? (
        <ScrollView
          style={themed($scrollView)}
          contentContainerStyle={themed($content)}
          showsVerticalScrollIndicator={false}
        >
          {/* Mentor Photo Container - Circular Avatar */}
          <View style={themed($avatarWrapper)}>
            {avatarUri && !imageError ? (
              <Image
                source={{ uri: avatarUri }}
                style={themed($avatar)}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <Image
                source={require("@assets/images/default_avatar.png")}
                style={themed($avatar)}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Mentor Name & Position */}
          <View style={themed($profileInfo)}>
            <Text text={fullName} style={themed($nameText)} />
            {position.length > 0 && (
              <Text text={position} style={themed($positionText)} />
            )}
          </View>

          {/* Extra Contact & Role Info (if available from API get/{id}) */}
          {(email.length > 0 || phone.length > 0 || roleName.length > 0) && (
            <View style={themed($metaCard)}>
              {email.length > 0 && (
                <View style={themed($metaRow)}>
                  <Text tx="mentorDetailScreen:emailLabel" style={themed($metaLabel)} />
                  <Text text={email} style={themed($metaValue)} selectable />
                </View>
              )}
              {phone.length > 0 && (
                <View
                  style={themed([$metaRow, email.length > 0 && $metaRowBorderTop])}
                >
                  <Text tx="mentorDetailScreen:phoneLabel" style={themed($metaLabel)} />
                  <Text text={phone} style={themed($metaValue)} selectable />
                </View>
              )}
              {roleName.length > 0 && (
                <View
                  style={themed([
                    $metaRow,
                    (email.length > 0 || phone.length > 0) && $metaRowBorderTop,
                  ])}
                >
                  <Text tx="mentorDetailScreen:roleLabel" style={themed($metaLabel)} />
                  <Text text={roleName} style={themed($metaValue)} />
                </View>
              )}
            </View>
          )}

          {/* Quote & Bio Section */}
          <View style={themed($quoteCard)}>
            {/* Quote Icon */}
            <View style={themed($quoteIconWrapper)}>
              <Icon icon="quote" size={26} color={colors.tint} />
            </View>

            {/* Description / Testimonial content */}
            {description.length > 0 ? (
              <Text text={description} style={themed($descriptionText)} />
            ) : (
              <Text
                tx="mentorDetailScreen:noDescription"
                style={themed($emptyDescriptionText)}
              />
            )}
          </View>

          {/* Subtle spinner when refreshing in background */}
          {viewModel.isLoadingDetail && (
            <View style={themed($backgroundLoading)}>
              <ActivityIndicator size="small" color={colors.tint} />
            </View>
          )}
        </ScrollView>
      ) : null}
    </Screen>
  )
})

const $screenContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $scrollView: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minHeight: 300,
  alignItems: "center",
  justifyContent: "center",
})

const $errorContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minHeight: 300,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 24,
})

const $errorText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.normal,
  fontSize: fontSizes.title,
  color: colors.error,
  textAlign: "center",
  marginBottom: 16,
})

const $retryButton: ThemedStyle<ViewStyle> = () => ({
  minWidth: 120,
})

const $content: ThemedStyle<ViewStyle> = () => ({
  paddingHorizontal: 20,
  paddingBottom: 40,
  alignItems: "center",
})

const $avatarWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 160,
  height: 160,
  borderRadius: 80,
  backgroundColor: colors.palette.neutral200,
  overflow: "hidden",
  marginTop: 16,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 4,
})

const $avatar: ThemedStyle<ImageStyle> = () => ({
  width: "100%",
  height: "100%",
})

const $profileInfo: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  marginTop: 20,
  marginBottom: 16,
  paddingHorizontal: 12,
})

const $nameText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.bold,
  fontSize: fontSizes.title,
  lineHeight: 22,
  color: colors.text,
  textAlign: "center",
})

const $positionText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: fontSizes.md,
  lineHeight: 20,
  color: colors.tint,
  marginTop: 4,
  textAlign: "center",
})

const $metaCard: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginBottom: 16,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
})

const $metaRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  paddingVertical: 10,
})

const $metaRowBorderTop: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderTopWidth: 1,
  borderTopColor: colors.border,
})

const $metaLabel: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.medium,
  fontSize: fontSizes.content,
  lineHeight: 20,
  color: colors.textDim,
  marginRight: 16,
  flexShrink: 0,
})

const $metaValue: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  flex: 1,
  fontFamily: typography.primary.semiBold,
  fontSize: fontSizes.content,
  lineHeight: 20,
  color: colors.text,
  textAlign: "right",
})

const $quoteCard: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 18,
  padding: 20,
  marginTop: 4,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
})

const $quoteIconWrapper: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 12,
})

const $descriptionText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.normal,
  fontSize: fontSizes.content,
  lineHeight: 22,
  color: colors.text,
})

const $emptyDescriptionText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.normal,
  fontSize: fontSizes.content,
  fontStyle: "italic",
  color: colors.textDim,
  textAlign: "center",
  marginVertical: 12,
})

const $backgroundLoading: ThemedStyle<ViewStyle> = () => ({
  marginTop: 16,
})
