import { useState } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { Text } from "@/components/Text"
import { CompanyResponse } from "@/data/model/api/response/company/CompanyResponse"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { getAvatarUri } from "@/utils/imageUtils"

export interface CompanyCardProps {
  company: CompanyResponse
}

export const CompanyCard = observer(function CompanyCard({ company }: CompanyCardProps) {
  const { themed } = useAppTheme()
  const [imageError, setImageError] = useState(false)

  const name = company.name?.trim() || ""
  const avatarUri = getAvatarUri(company.avatar)

  return (
    <View style={themed($card)}>
      <View style={themed($row)}>
        {/* Company Logo */}
        <View style={themed($logoContainer)}>
          {avatarUri && !imageError ? (
            <Image
              source={{ uri: avatarUri }}
              style={themed($logo)}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Image
              source={require("@assets/icons/ic_company.png")}
              style={themed($logoFallback)}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Company Name & Subtitle */}
        <View style={themed($textContainer)}>
          <Text text={name} style={themed($companyName)} numberOfLines={1} />
          <Text tx="companiesScreen:subtitlePartner" style={themed($subtitle)} numberOfLines={1} />
        </View>
      </View>
    </View>
  )
})

const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 14,
  marginHorizontal: 12,
  marginTop: 12,
  padding: 16,
})

const $row: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $logoContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 48,
  height: 48,
  borderRadius: 10,
  backgroundColor: colors.palette.neutral200,
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: "100%",
  height: "100%",
})

const $logoFallback: ThemedStyle<ImageStyle> = ({ colors }) => ({
  width: 28,
  height: 28,
  tintColor: colors.textDim,
})

const $textContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  marginLeft: 14,
})

const $companyName: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 18,
  fontWeight: "500",
  color: colors.text,
})

const $subtitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  fontWeight: "600",
  color: colors.tint,
  marginTop: 2,
})
