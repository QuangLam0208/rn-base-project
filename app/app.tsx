/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}
import "./utils/gestureHandler"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import * as Linking from "expo-linking"
import * as SplashScreen from "expo-splash-screen"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { useMMKVString } from "react-native-mmkv"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import * as navigationStorage from "./data/local/storage"
import { storage } from "./data/local/storage"
import { initI18n, LANGUAGE_STORAGE_KEY } from "./i18n"
import { AppNavigator } from "./navigators/AppNavigator"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { ThemeProvider } from "./theme/context"
import { customFontsToLoad } from "./theme/typography"
import { initCrashReporting } from "./utils/crashReporting"
import { loadDateFnsLocale } from "./utils/formatDate"

initCrashReporting()

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Web linking configuration
const prefix = Linking.createURL("/")
const config = {
  screens: {
    Splash: "splash",
    Login: "login",
    MainTabs: {
      path: "main",
      screens: {
        Home: "home",
      },
    },
    Settings: "settings",
  },
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(navigationStorage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)
  // Settings screen writes the user's chosen language here — Text/translate()
  // read i18n.t directly instead of subscribing via useTranslation(), so the
  // only way to actually refresh every on-screen string is to remount the
  // navigator tree (see the `key` below) once i18n.changeLanguage resolves.
  const [language] = useMMKVString(LANGUAGE_STORAGE_KEY, storage)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const isReady =
    isNavigationStateRestored && isI18nInitialized && (areFontsLoaded || Boolean(fontLoadError))

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [isReady])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything — native splash screen remains visible.
  if (!isReady) {
    return null
  }

  const linking = {
    prefixes: [prefix],
    config,
  }

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <ThemeProvider>
          <AppNavigator
            key={language}
            linking={linking}
            initialState={initialNavigationState}
            onStateChange={onNavigationStateChange}
          />
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}
