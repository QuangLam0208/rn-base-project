import { useState } from "react"
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

import { observer } from "mobx-react-lite"

import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { CourseResponse } from "@/data/model/api/response/course/CourseResponse"
import { SyllabusResponse } from "@/data/model/api/response/course/SyllabusResponse"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { getAvatarUri } from "@/utils/imageUtils"
import { parseBulletLines } from "@/utils/textUtils"

import { SyllabusItem } from "../SyllabusItem/SyllabusItem"

export interface CourseCardProps {
  course: CourseResponse
  isExpanded: boolean
  isLoadingSyllabus: boolean
  syllabuses?: SyllabusResponse[]
  expandedSyllabusItemIds: Record<number, boolean>
  onToggleSyllabus: () => void
  onToggleSyllabusItem: (id: number) => void
  onPressCard?: () => void
}

export const CourseCard = observer(function CourseCard({
  course,
  isExpanded,
  isLoadingSyllabus,
  syllabuses,
  expandedSyllabusItemIds,
  onToggleSyllabus,
  onToggleSyllabusItem,
  onPressCard,
}: CourseCardProps) {
  const { themed } = useAppTheme()
  const [imageError, setImageError] = useState(false)

  const avatarUri = getAvatarUri(course.avatar)
  const bulletLines = parseBulletLines(course.shortDescription)

  // Price formatting
  const formattedPrice =
    course.price && course.price > 0
      ? `${Number(course.price).toLocaleString("en-US")} đ`
      : null

  return (
    <View style={themed($wrapper)}>
      {/* Main Course Card */}
      <View style={themed($card)}>
        {/* Banner Image */}
        <TouchableOpacity
          style={themed($bannerContainer)}
          onPress={onPressCard}
          disabled={!onPressCard}
          activeOpacity={0.85}
        >
          {avatarUri && !imageError ? (
            <Image
              source={{ uri: avatarUri }}
              style={themed($bannerImage)}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Image
              source={require("@assets/images/ic_course_placeholder.png")}
              style={themed($bannerImage)}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>

        {/* Course Name */}
        <Text text={course.name} style={themed($courseName)} />

        {/* Course Price */}
        {formattedPrice ? (
          <Text text={formattedPrice} style={themed($price)} />
        ) : (
          <Text tx="coursesScreen:freePrice" style={themed($price)} />
        )}

        {/* Short Description (Bullet List) */}
        {bulletLines.length > 0 && (
          <View style={themed($bulletList)}>
            {bulletLines.map((line, index) => (
              <View key={index} style={themed($bulletRow)}>
                <View style={themed($bulletDot)} />
                <Text text={line} style={themed($bulletText)} />
              </View>
            ))}
          </View>
        )}

        {/* View More / Collapse Button */}
        <TouchableOpacity
          style={themed($viewMoreButton)}
          onPress={onToggleSyllabus}
          activeOpacity={0.7}
        >
          <Text
            tx={isExpanded ? "coursesScreen:buttonLess" : "coursesScreen:buttonMore"}
            style={themed($viewMoreText)}
          />
          <View style={[themed($arrowIcon), isExpanded && themed($arrowIconRotated)]}>
            <Icon icon="arrowDropDown" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Syllabus Card (Collapsible) */}
      {isExpanded && (
        <View style={themed($syllabusCard)}>
          <Text tx="coursesScreen:syllabusTitle" style={themed($syllabusHeading)} />

          {isLoadingSyllabus && (
            <View style={themed($syllabusLoadingContainer)}>
              <ActivityIndicator color="#15CCA3" />
            </View>
          )}

          {!isLoadingSyllabus && (!syllabuses || syllabuses.length === 0) && (
            <Text tx="coursesScreen:emptySyllabus" style={themed($emptySyllabusText)} />
          )}

          {!isLoadingSyllabus &&
            syllabuses &&
            syllabuses.length > 0 &&
            syllabuses.map((item) => (
              <SyllabusItem
                key={item.id}
                syllabus={item}
                isExpanded={!!expandedSyllabusItemIds[item.id]}
                onToggle={() => onToggleSyllabusItem(item.id)}
              />
            ))}
        </View>
      )}
    </View>
  )
})

const $wrapper: ThemedStyle<ViewStyle> = () => ({
  marginHorizontal: 12,
  marginTop: 12,
})

const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 13,
  padding: 13,
})

const $bannerContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: 203,
  borderRadius: 10,
  overflow: "hidden",
  backgroundColor: "#202428",
})

const $bannerImage: ThemedStyle<ImageStyle> = () => ({
  width: "100%",
  height: "100%",
})

const $courseName: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 20,
  lineHeight: 23,
  color: colors.text,
  marginTop: 18,
})

const $price: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 25,
  lineHeight: 25,
  color: "#15CCA3",
  marginTop: 17,
})

const $bulletList: ThemedStyle<ViewStyle> = () => ({
  marginTop: 17,
})

const $bulletRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "flex-start",
  marginTop: 6,
})

const $bulletDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 5,
  height: 5,
  borderRadius: 2.5,
  backgroundColor: colors.textDim,
  marginTop: 12,
  marginRight: 8,
})

const $bulletText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 28,
  color: colors.textDim,
})

const $viewMoreButton: ThemedStyle<ViewStyle> = () => ({
  width: 150,
  height: 50,
  backgroundColor: "#15CCA3",
  borderRadius: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 25,
  marginLeft: 3,
  marginBottom: 3,
})

const $viewMoreText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: "#FFFFFF",
  textDecorationLine: "underline",
})

const $arrowIcon: ThemedStyle<ViewStyle> = () => ({
  marginLeft: 7,
  width: 12,
  height: 12,
  alignItems: "center",
  justifyContent: "center",
})

const $arrowIconRotated: ThemedStyle<ViewStyle> = () => ({
  transform: [{ rotate: "180deg" }],
})

const $syllabusCard: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 13,
  padding: 13,
  marginTop: 12,
})

const $syllabusHeading: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 20,
  lineHeight: 28,
  color: colors.text,
  marginTop: 2,
})

const $syllabusLoadingContainer: ThemedStyle<ViewStyle> = () => ({
  paddingVertical: 20,
  alignItems: "center",
  justifyContent: "center",
})

const $emptySyllabusText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  marginVertical: 13,
})
