const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
    traceTitle: "Error from %{name} stack", // @demo remove-current-line
  },
  emptyStateComponent: {
    generic: {
      heading: "So empty... so sad",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },
  errors: {
    invalidEmail: "Invalid email address.",
  },
  splashScreen: {
    appName: "BaseApp",
  },
  homeScreen: {
    subtitle: "This is the one example tab in this base project — replace it with real screens.",
    incrementButton: "Tap me",
  },
  mainNavigator: {
    homeTab: "Home",
    coursesTab: "Courses",
  },
  coursesScreen: {
    headingOngoing: "Ongoing",
    buttonMore: "View more",
    buttonLess: "Collapse",
    syllabusTitle: "Syllabus",
    emptySyllabus: "No syllabus available",
    emptyCourses: "No courses available",
    freePrice: "Free",
    errorLoadCourses: "Failed to load courses.",
    errorLoadSyllabus: "Failed to load syllabus.",
  },
  settingsScreen: {
    title: "Settings",
    languageSection: "Language",
    languageVi: "Tiếng Việt",
    languageEn: "English",
    themeSection: "Appearance",
    darkMode: "Dark mode",
    updateSection: "Update",
    checkForUpdate: "Check for update",
    updateNow: "Download and restart",
    updateChecking: "Checking for update…",
    updateUpToDate: "You're on the latest version.",
    updateAvailable: "A new update is available.",
    updateDownloading: "Downloading update…",
    updateDisabledDev: "Update check is disabled in this development build.",
    updateError: "Couldn't check for update. Try again later.",
    logout: "Logout",
    logoutConfirmTitle: "Logout",
    logoutConfirmMessage: "Are you sure you want to log out?",
  },
  loginScreen: {
    brandName: "iLearning",
    labelUsername: "Username",
    hintUsername: "Username",
    labelPassword: "Password",
    hintPassword: "Password",
    loginWithQr: "Login with QR code",
    loginButton: "Sign In",
    forgotPassword: "Forgot password?",
    validationEmpty: "Please fill in all required information",
    loginSuccess: "Login successful!",
    loginFailed: "Login failed, please check your credentials!",
  },
}

export default en
export type Translations = typeof en
