/**
 * The light theme. ai-project-android only has one (dark) UI, so this palette
 * has no 1:1 Android source to mirror — it reuses the same brand teal
 * (accent_color #15CCA3) and error color as colorsDark.ts, but with an
 * actual light neutral ramp (100 = lightest ... 900 = darkest) instead of
 * colorsDark.ts's inverted one. Previously this file just copied
 * colorsDark.ts's dark literal values under light-sounding names (e.g.
 * neutral200, the screen background, was #182029 — the same dark navy as
 * colorsDark.ts) — that's why toggling the Settings screen's dark/light
 * switch used to barely change anything. Every neutralXXX here must
 * actually get lighter as the number goes down, or that bug comes back.
 */
const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F2F4F5",
  neutral300: "rgba(9, 12, 15, 0.35)",
  neutral400: "#D6DBDF",
  neutral500: "#9AA3AC",
  neutral600: "#6B7280",
  neutral700: "#47505A",
  neutral800: "#182029",
  neutral900: "#090C0F",

  primary100: "#073D31",
  primary200: "#0A614C",
  primary300: "#0D8468",
  primary400: "#11A886",
  primary500: "#15CCA3",
  primary600: "#5EE0C4",

  secondary100: "#073D31",
  secondary200: "#0A614C",
  secondary300: "#0D8468",
  secondary400: "#11A886",
  secondary500: "#15CCA3",

  accent100: "#15CCA3",
  accent200: "#11A886",
  accent300: "#0D8468",
  accent400: "#0A614C",
  accent500: "#073D31",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(9, 12, 15, 0.2)",
  overlay50: "rgba(9, 12, 15, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * Text/icon color for content placed on top of `tint` (e.g. the "Xem
   * thêm" pill's label) — `tint` is a fixed mid-brightness teal in both
   * themes, so this needs to be a fixed dark ink here too, not whichever
   * neutral happens to be dark in a given theme (that's neutral900 here,
   * not neutral100 — the opposite of colorsDark.ts's dark-ink slot).
   */
  tintText: palette.neutral900,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
  /**
   * A giáo trình stage pill's background. colorsDark.ts uses
   * ai-project-android's syllabus_stage_bg (#202428) directly since that's a
   * dark UI value; this light theme has no Android source for it, so it's a
   * light neutral instead — distinct from `background` so the pill still
   * reads as a pill, not a lighter shade of neutral above.
   */
  syllabusStageBg: "#E4E7EA",
} as const
