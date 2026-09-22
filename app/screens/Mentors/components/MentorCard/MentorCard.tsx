import { useEffect, useState } from "react"
import { Image, ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { MentorResponse } from "@/data/model/api/response/mentor/MentorResponse"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { getAvatarUri } from "@/utils/imageUtils"
import { cleanDescription } from "@/utils/textUtils"

export interface MentorCardProps {
  mentor: MentorResponse
  onPress?: () => void
}

export const MentorCard = observer(function MentorCard({ mentor, onPress }: MentorCardProps) {
  const { themed, theme: { colors } } = useAppTheme()
  const [imageError, setImageError] = useState(false)

  const account = mentor.account
  const fullName = account?.fullName?.trim() || ""
  const position = mentor.position?.trim() || ""
  const description = cleanDescription(mentor.description)
  const avatarUri = getAvatarUri(account?.avatarPath)

  useEffect(() => {
    setImageError(false)
  }, [avatarUri])

  return (
    <TouchableOpacity
      style={themed($card)}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Top Header Row: Avatar + Name & Position + Chevron */}
      <View style={themed($headerRow)}>
        <View style={themed($avatarContainer)}>
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

        <View style={themed($headerTextContainer)}>
          <Text text={fullName} style={themed($mentorName)} numberOfLines={1} />
          {position.length > 0 && (
            <Text text={position} style={themed($mentorPosition)} numberOfLines={1} />
          )}
        </View>

        <Icon icon="caretRight" size={18} color={colors.textDim} style={themed($chevronIcon)} />
      </View>

      {/* Description Preview (Cleaned, max 2 lines with ellipsis) */}
      {description.length > 0 && (
        <Text
          text={description.replace(/\n+/g, " ")}
          style={themed($mentorDescription)}
          numberOfLines={2}
          ellipsizeMode="tail"
        />
      )}
    </TouchableOpacity>
  )
})

const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 14,
  marginHorizontal: 12,
  marginTop: 12,
  padding: 16,
})

const $headerRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $avatarContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.palette.neutral200,
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
})

const $avatar: ThemedStyle<ImageStyle> = () => ({
  width: "100%",
  height: "100%",
})

const $headerTextContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  marginLeft: 14,
})

const $mentorName: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 18,
  fontWeight: "500",
  color: colors.text,
})

const $mentorPosition: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  fontWeight: "600",
  color: colors.tint,
  marginTop: 2,
})

const $mentorDescription: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 22,
  color: colors.textDim,
  marginTop: 10,
})

const $chevronIcon: ThemedStyle<ImageStyle> = () => ({
  marginLeft: 8,
})

