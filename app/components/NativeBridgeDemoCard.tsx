import { useEffect, useState } from "react"
import { ActivityIndicator, View, ViewStyle, TextStyle } from "react-native"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import {
  getDeviceConstants,
  getHardwareInfo,
  showToast,
  subscribeToDevicePing,
  triggerNativePing,
  type HardwareInfo,
} from "react-native-device-helper"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function NativeBridgeDemoCard() {
  const { themed } = useAppTheme()

  const constants = getDeviceConstants()
  const isAvailable = Boolean(constants)

  const [loadingHardware, setLoadingHardware] = useState(false)
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null)
  const [lastNativeEvent, setLastNativeEvent] = useState<{ message: string; time: string } | null>(
    null,
  )

  useEffect(() => {
    if (!isAvailable) return

    // Đăng ký lắng nghe sự kiện từ Android Native gửi lên
    const unsubscribe = subscribeToDevicePing((data) => {
      setLastNativeEvent({
        message: data.message,
        time: new Date(data.timestamp).toLocaleTimeString(),
      })
    })

    return () => {
      unsubscribe()
    }
  }, [isAvailable])

  const handleFetchHardware = async () => {
    try {
      setLoadingHardware(true)
      const data = await getHardwareInfo()
      setHardwareInfo(data)
    } catch (err: any) {
      alert(`Lỗi khi gọi Native: ${err.message}`)
    } finally {
      setLoadingHardware(false)
    }
  }

  const handleShowToast = () => {
    showToast("Xin chào từ Thư Viện Dùng Chung (react-native-device-helper)!", true)
  }

  const handleTriggerEvent = () => {
    triggerNativePing("Yêu cầu gửi event từ App chính")
  }

  return (
    <View style={themed($container)}>
      <View style={themed($headerRow)}>
        <Text text="Demo Thư Viện Dùng Chung" preset="subheading" style={themed($title)} />
        <View style={themed(isAvailable ? $badgeSuccess : $badgeWarning)}>
          <Text
            text={isAvailable ? "Thư Viện Sẵn Sàng" : "Chưa Link / Non-Android"}
            style={themed($badgeText)}
          />
        </View>
      </View>

      <Text
        text="Được gọi trực tiếp từ package độc lập: react-native-device-helper qua Autolinking."
        style={themed($description)}
      />

      {/* 1. Sync Constants */}
      <View style={themed($subSection)}>
        <Text text="1. Hằng số tĩnh (Sync Constants):" preset="bold" style={themed($subTitle)} />
        {constants ? (
          <View style={themed($infoBox)}>
            <Text text={`• Thiết bị: ${constants.MANUFACTURER} ${constants.MODEL}`} />
            <Text text={`• Android OS: v${constants.ANDROID_VERSION} (API ${constants.SDK_INT})`} />
          </View>
        ) : (
          <Text text="Chưa có thông tin (chỉ đọc được khi chạy trên máy Android đã build Native)." />
        )}
      </View>

      {/* 2. Async Call (Promise) */}
      <View style={themed($subSection)}>
        <Text
          text="2. Gọi hàm Native lấy RAM & Pin (Async Promise):"
          preset="bold"
          style={themed($subTitle)}
        />
        <Button
          text={loadingHardware ? "Đang đọc từ OS..." : "Đọc RAM & Pin từ Thư Viện"}
          onPress={handleFetchHardware}
          disabled={!isAvailable || loadingHardware}
          style={themed($button)}
        />
        {loadingHardware && <ActivityIndicator style={themed($loadingSpinner)} />}
        {hardwareInfo && (
          <View style={themed($infoBox)}>
            <Text
              text={`• RAM khả dụng: ${hardwareInfo.availRamMb} MB / ${hardwareInfo.totalRamMb} MB`}
            />
            <Text
              text={`• Pin: ${hardwareInfo.batteryLevel}% (${hardwareInfo.isCharging ? "Đang sạc ⚡" : "Không sạc"})`}
            />
          </View>
        )}
      </View>

      {/* 3. Native Action (Android Toast) */}
      <View style={themed($subSection)}>
        <Text
          text="3. Ra lệnh thực thi Action Native (Android Toast):"
          preset="bold"
          style={themed($subTitle)}
        />
        <Button
          text="Bắn Android Native Toast"
          onPress={handleShowToast}
          disabled={!isAvailable}
          style={themed($button)}
        />
      </View>

      {/* 4. Native Event Emitter */}
      <View style={themed($subSection)}>
        <Text
          text="4. Native gửi Event ngược về JS (2 chiều):"
          preset="bold"
          style={themed($subTitle)}
        />
        <Button
          text="Kích hoạt Event từ Native"
          onPress={handleTriggerEvent}
          disabled={!isAvailable}
          style={themed($button)}
        />
        {lastNativeEvent && (
          <View style={themed($infoBox)}>
            <Text text={`• Nhận lúc: ${lastNativeEvent.time}`} style={themed($eventTime)} />
            <Text text={`• Nội dung: ${lastNativeEvent.message}`} />
          </View>
        )}
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  marginTop: spacing.md,
  marginBottom: spacing.md,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.xs,
})

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  flex: 1,
})

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 13,
  marginBottom: spacing.sm,
})

const $badgeSuccess: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#10B981",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
})

const $badgeWarning: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#F59E0B",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
})

const $badgeText: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
  fontSize: 11,
  fontWeight: "700",
})

const $subSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $subTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 13,
  marginBottom: spacing.xs,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
  minHeight: 40,
})

const $infoBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  padding: spacing.sm,
  borderRadius: 8,
  marginTop: spacing.xs,
  gap: 2,
})

const $eventTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "600",
  fontSize: 12,
})

const $loadingSpinner: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
})
