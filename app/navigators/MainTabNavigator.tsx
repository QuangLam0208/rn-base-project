import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { translate } from "@/i18n/translate"
import { HomeScreen } from "@/screens/Home/HomeScreen"
import { useAppTheme } from "@/theme/context"

import type { MainTabParamList } from "./navigationTypes"

const Tab = createBottomTabNavigator<MainTabParamList>()

/**
 * The main navigator: a bottom tab bar with the app's tabs. Just one
 * example tab (Home) in this base project — add more `Tab.Screen`s
 * here as real screens are built, following the "Registering a new
 * screen" steps in CLAUDE.md.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `MainTabNavigator`.
 */
export function MainTabNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { height: bottom + 70, backgroundColor: colors.background },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: translate("mainNavigator:homeTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="menu" color={focused ? colors.tint : colors.tintInactive} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
