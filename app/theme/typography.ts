// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from "react-native"
import {
  SpaceGrotesk_300Light as spaceGroteskLight,
  SpaceGrotesk_400Regular as spaceGroteskRegular,
  SpaceGrotesk_500Medium as spaceGroteskMedium,
  SpaceGrotesk_600SemiBold as spaceGroteskSemiBold,
  SpaceGrotesk_700Bold as spaceGroteskBold,
} from "@expo-google-fonts/space-grotesk"

export const customFontsToLoad = {
  spaceGroteskLight,
  spaceGroteskRegular,
  spaceGroteskMedium,
  spaceGroteskSemiBold,
  spaceGroteskBold,
  "SFPro-Regular": require("@assets/fonts/sf_regular.otf"),
  "SFPro-Medium": require("@assets/fonts/sf_pro_display_medium.otf"),
  "SFPro-SemiBold": require("@assets/fonts/sf_pro_display_semibold.otf"),
  "SFPro-Bold": require("@assets/fonts/sf_bold.otf"),
  "SFPro-Italic": require("@assets/fonts/sf_italic.otf"),
  "SFPro-BoldItalic": require("@assets/fonts/sf_bold_italic.otf"),
}

const fonts = {
  sfPro: {
    light: "SFPro-Regular",
    normal: "SFPro-Regular",
    medium: "SFPro-Medium",
    semiBold: "SFPro-SemiBold",
    bold: "SFPro-Bold",
    italic: "SFPro-Italic",
    boldItalic: "SFPro-BoldItalic",
  },
  spaceGrotesk: {
    // Cross-platform Google font.
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places (matches Android application_font: SF Pro).
   */
  primary: fonts.sfPro,
  /**
   * Space Grotesk alternative font.
   */
  spaceGrotesk: fonts.spaceGrotesk,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: fonts.helveticaNeue, android: fonts.sansSerif }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
