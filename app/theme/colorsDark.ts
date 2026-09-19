/**
 * Palette mirrors ai-project-android's brand colors (source/app/src/main/res/values/colors.xml):
 * primary_color #182029, accent_color #15CCA3, secondary_color #FFFFFF,
 * course_desc_grey #AEAEAE, input_stroke #404650, course_card_background #090C0F.
 * This is the app's original single dark UI, unchanged. colors.ts is the
 * newer light counterpart, with its own (non-inverted) ramp direction —
 * see that file's header for why the two ramps run opposite ways.
 */
const palette = {
  neutral900: "#FFFFFF",
  neutral800: "#FFFFFF",
  neutral700: "#F5F5F5",
  neutral600: "#AEAEAE",
  neutral500: "#5C6670",
  neutral400: "#404650",
  neutral300: "rgba(255, 255, 255, 0.6)",
  neutral200: "#182029",
  neutral100: "#090C0F",

  primary600: "#5EE0C4",
  primary500: "#15CCA3",
  primary400: "#11A886",
  primary300: "#0D8468",
  primary200: "#0A614C",
  primary100: "#073D31",

  secondary500: "#15CCA3",
  secondary400: "#11A886",
  secondary300: "#0D8468",
  secondary200: "#0A614C",
  secondary100: "#073D31",

  accent500: "#5EE0C4",
  accent400: "#11A886",
  accent300: "#0D8468",
  accent200: "#0A614C",
  accent100: "#15CCA3",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(9, 12, 15, 0.2)",
  overlay50: "rgba(9, 12, 15, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  /**
   * Text/icon color for content placed on top of `tint` — see colors.ts's
   * `tintText` for why this needs to be a fixed dark ink (neutral100 here)
   * rather than whichever neutral is "dark" in a given theme.
   */
  tintText: palette.neutral100,
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
  /**
   * A giáo trình stage pill's background (mirrors ai-project-android's
   * syllabus_stage_bg #202428) — distinct from any neutral shade above.
   */
  syllabusStageBg: "#202428",
} as const
