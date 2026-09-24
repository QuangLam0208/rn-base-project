import { ActivityIndicator, Alert, Image, ImageStyle, TextStyle, TextInput, TouchableOpacity, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useViewModel } from "@/di/useViewModel"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { showNormal, showWarning } from "@/utils/toast"

import { LoginViewModel } from "./LoginViewModel"

export const LoginScreen = observer(function LoginScreen() {
  const { themed, theme } = useAppTheme()
  const viewModel = useViewModel(LoginViewModel)
  const navigation = useNavigation<AppStackScreenProps<"Login">["navigation"]>()

  const onLoginPress = async () => {
    const success = await viewModel.handleLogin()
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      })
    }
  }

  const onQrClick = () => {
    showNormal("Chức năng quét mã QR đăng nhập đang phát triển.")
  }

  const onForgotPasswordClick = () => {
    showWarning("Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.")
  }

  return (
    <Screen
      preset="auto"
      backgroundColor={theme.colors.background}
      safeAreaEdges={["bottom"]}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($topSection)}>
        {/* Header container */}
        <View style={themed($headerContainer)}>
          <Image
            source={require("@assets/images/bg_login_top_header.png")}
            style={themed($headerBgImage)}
            resizeMode="stretch"
          />

          <View style={themed($headerContent)}>
            <Image
              source={require("@assets/images/ic_ilearning_logo.png")}
              style={themed($logo)}
              resizeMode="contain"
            />
            <Text tx="loginScreen:brandName" style={themed($brandName)} />
          </View>
        </View>

        <View style={themed($formContainer)}>
          <Text tx="loginScreen:labelUsername" style={themed($labelUsername)} />
          <TextInput
            style={themed($input)}
            value={viewModel.username}
            onChangeText={viewModel.setUsername}
            placeholder="Username"
            placeholderTextColor={theme.colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text tx="loginScreen:labelPassword" style={themed($labelPassword)} />
          <View style={themed($passwordInputContainer)}>
            <TextInput
              style={themed($passwordInput)}
              value={viewModel.password}
              onChangeText={viewModel.setPassword}
              placeholder="Password"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={!viewModel.isPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onLoginPress}
            />
            <TouchableOpacity
              onPress={viewModel.togglePasswordVisibility}
              style={themed($togglePasswordButton)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={
                  viewModel.isPasswordVisible
                    ? require("@assets/icons/ic_visibility.png")
                    : require("@assets/icons/ic_visibility_off.png")
                }
                style={themed($eyeIcon)}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* QR Code Row */}
          <TouchableOpacity
            style={themed($qrRow)}
            onPress={onQrClick}
            activeOpacity={0.7}
          >
            <Image
              source={require("@assets/icons/ic_qr_code.png")}
              style={themed($qrIcon)}
              resizeMode="contain"
            />
            <Text tx="loginScreen:loginWithQr" style={themed($qrText)} />
          </TouchableOpacity>

          {/* Hiển thị lỗi validation/API nếu có */}
          {viewModel.error === "empty-fields" && (
            <Text tx="loginScreen:validationEmpty" style={themed($errorText)} />
          )}
          {viewModel.error && viewModel.error !== "empty-fields" && (
            <Text tx="loginScreen:loginFailed" style={themed($errorText)} />
          )}
        </View>
      </View>

      {/* Bottom Container */}
      <View style={themed($bottomContainer)}>
        <TouchableOpacity
          style={[themed($loginButton), viewModel.isLoading && themed($loginButtonDisabled)]}
          onPress={onLoginPress}
          disabled={viewModel.isLoading}
          activeOpacity={0.8}
        >
          {viewModel.isLoading ? (
            <ActivityIndicator color={theme.colors.buttonPrimaryText} />
          ) : (
            <Text tx="loginScreen:loginButton" style={themed($loginButtonText)} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={themed($forgotPasswordButton)}
          onPress={onForgotPasswordClick}
          activeOpacity={0.7}
        >
          <Text tx="loginScreen:forgotPassword" style={themed($forgotPasswordText)} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
})

const $screenContent: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexGrow: 1,
  justifyContent: "space-between",
  backgroundColor: colors.background,
})

const $topSection: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})

const $headerContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  height: 220,
  backgroundColor: colors.background,
  position: "relative",
})

const $headerBgImage: ThemedStyle<ImageStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  width: "100%",
  height: 220,
})

const $headerContent: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  alignItems: "center",
  marginTop: 57,
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: 50,
  height: 50,
})

const $brandName: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.spaceGrotesk.semiBold,
  fontSize: fontSizes.display,
  lineHeight: 24,
  color: colors.white,
  marginTop: 13,
  letterSpacing: 0.96,
})

const $formContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})

const $labelUsername: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.medium,
  fontSize: fontSizes.md,
  color: colors.text,
  marginLeft: 21,
  marginTop: 36,
})

const $input: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.normal,
  fontSize: fontSizes.content,
  color: colors.text,
  backgroundColor: colors.inputBackground,
  borderWidth: 1,
  borderColor: colors.inputBorder,
  borderRadius: 13,
  height: 50,
  marginHorizontal: 21,
  marginTop: 10,
  paddingHorizontal: 18,
})

const $labelPassword: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.medium,
  fontSize: fontSizes.md,
  color: colors.text,
  marginLeft: 21,
  marginTop: 21,
})

const $passwordInputContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 50,
  marginHorizontal: 21,
  marginTop: 10,
  backgroundColor: colors.inputBackground,
  borderWidth: 1,
  borderColor: colors.inputBorder,
  borderRadius: 13,
  flexDirection: "row",
  alignItems: "center",
  position: "relative",
})

const $passwordInput: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  flex: 1,
  height: "100%",
  fontFamily: typography.primary.normal,
  fontSize: fontSizes.content,
  color: colors.text,
  paddingLeft: 18,
  paddingRight: 45,
})

const $togglePasswordButton: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  right: 15,
  width: 31,
  height: 31,
  justifyContent: "center",
  alignItems: "center",
})

const $eyeIcon: ThemedStyle<ImageStyle> = ({ colors }) => ({
  width: 24,
  height: 24,
  tintColor: colors.placeholder,
})

const $qrRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 21,
  marginTop: 21,
  marginBottom: 21,
  alignSelf: "flex-start",
})

const $qrIcon: ThemedStyle<ImageStyle> = () => ({
  width: 28,
  height: 28,
})

const $qrText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.medium,
  fontSize: fontSizes.content,
  color: colors.text,
  marginLeft: 13,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  color: colors.danger,
  fontSize: fontSizes.sm,
  textAlign: "center",
  marginHorizontal: 16,
  marginBottom: 8,
})

const $bottomContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "flex-end",
  width: "100%",
  paddingTop: 10,
  paddingBottom: 31,
})

const $loginButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 50,
  marginHorizontal: 21,
  backgroundColor: colors.buttonPrimary,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
})

const $loginButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.7,
})

const $loginButtonText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.medium,
  fontSize: fontSizes.title,
  color: colors.buttonPrimaryText,
})

const $forgotPasswordButton: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "flex-end",
  marginRight: 21,
  marginTop: 18,
  padding: 5,
})

const $forgotPasswordText: ThemedStyle<TextStyle> = ({ typography, colors, fontSizes }) => ({
  fontFamily: typography.primary.medium,
  fontSize: fontSizes.content,
  color: colors.link,
})