/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 *
 * `Splash` is the initial route. SplashScreen.tsx hides the native splash on mount
 * (both have identical visuals → seamless transition), then resets to MainTabs/Login
 * after a brief delay.
 */
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Config from "@/config"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { MentorDetailScreen } from "@/screens/MentorDetail/MentorDetailScreen"
import { SettingsScreen } from "@/screens/Settings/SettingsScreen"
import { SplashScreen } from "@/screens/Splash/SplashScreen"
import { LoginScreen } from "@/screens/Login/LoginScreen"
import { TodoListScreen } from "@/screens/TodoList/TodoListScreen"
import { useAppTheme } from "@/theme/context"
import { container } from "@/di/container"
import { AuthStore } from "@/stores/authStore"

import { MainTabNavigator } from "./MainTabNavigator"
import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = function AppStack() {
  const {
    theme: { colors },
  } = useAppTheme()

  const initialRoute = container.get(AuthStore).isAuthenticated ? "MainTabs" : "Login"

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="MentorDetail" component={MentorDetailScreen} />
      <Stack.Screen name="TodoList" component={TodoListScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      {/** 🔥 Your screens go here */}
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
