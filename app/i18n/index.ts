import { I18nManager } from "react-native"
import * as Localization from "expo-localization"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import "intl-pluralrules"

import { storage } from "@/data/local/storage"
import { loadDateFnsLocale } from "@/utils/formatDate"

// if English isn't your default language, move Translations to the appropriate language file.
import en, { Translations } from "./en"
import vi from "./vi"

const fallbackLocale = "vi-VN"

const systemLocales = Localization.getLocales()

const resources = { en, vi }
const supportedTags = Object.keys(resources)

export type SupportedLanguageTag = keyof typeof resources

// The user's manually-picked language (see SettingsScreen), persisted so it
// survives app restarts and takes priority over the device's own locale.
export const LANGUAGE_STORAGE_KEY = "ignite.language"

const isSupportedLanguageTag = (tag: string | undefined): tag is SupportedLanguageTag =>
  !!tag && supportedTags.includes(tag)

const persistedLanguage = storage.getString(LANGUAGE_STORAGE_KEY)

// Checks to see if the device locale matches any of the supported locales
// Device locale may be more specific and still match (e.g., en-US matches en)
const systemTagMatchesSupportedTags = (deviceTag: string) => {
  const primaryTag = deviceTag.split("-")[0]
  return supportedTags.includes(primaryTag)
}

const pickSupportedLocale: () => Localization.Locale | undefined = () => {
  return systemLocales.find((locale) => systemTagMatchesSupportedTags(locale.languageTag))
}

const locale = pickSupportedLocale()

export let isRTL = false

// Need to set RTL ASAP to ensure the app is rendered correctly. Waiting for i18n to init is too late.
if (locale?.languageTag && locale?.textDirection === "rtl") {
  I18nManager.allowRTL(true)
  isRTL = true
} else {
  I18nManager.allowRTL(false)
}

export const initI18n = async () => {
  i18n.use(initReactI18next)

  await i18n.init({
    resources,
    lng: persistedLanguage ?? locale?.languageTag ?? fallbackLocale,
    fallbackLng: fallbackLocale,
    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

/**
 * Switches the app's language at runtime (see SettingsScreen) and persists
 * the choice so it's picked up by `initI18n` on the next app launch too.
 * `i18n.changeLanguage` alone doesn't re-render anything, since `Text`/
 * `translate()` read `i18n.t` directly instead of subscribing through
 * `useTranslation()` — the caller is expected to force a remount (app.tsx
 * keys `AppNavigator` off `LANGUAGE_STORAGE_KEY`) to actually refresh
 * on-screen text.
 */
export const changeLanguage = async (tag: SupportedLanguageTag) => {
  storage.set(LANGUAGE_STORAGE_KEY, tag)
  await i18n.changeLanguage(tag)
  loadDateFnsLocale()
}

/**
 * Reads the language actually in effect right now. Unlike `persistedLanguage`
 * (captured once at module load), `i18n.language` is updated live by
 * `changeLanguage`, so this stays correct without needing a fresh import.
 */
export const getCurrentLanguage = (): SupportedLanguageTag => {
  const primaryTag = i18n.language?.split("-")[0]
  return isSupportedLanguageTag(primaryTag) ? primaryTag : "vi"
}

/**
 * Builds up valid keypaths for translations.
 */

export type TxKeyPath = RecursiveKeyOf<Translations>

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, true>
}[keyof TObj & (string | number)]

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, false>
}[keyof TObj & (string | number)]

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean,
> = TValue extends any[]
  ? Text
  : TValue extends object
    ? IsFirstLevel extends true
      ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
      : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
    : Text
