import { useEffect, useState } from "react"
import { ActivityIndicator, View, ViewStyle, TextStyle } from "react-native"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

// Import 5 Native Modules độc lập từ mono-repo
import { DeviceHelper, type HardwareInfo, type BatteryInfo } from "native-device-helper"
import { NativeToast } from "native-toast"
import { NativeAlert } from "native-alert"
import { NativeDatePicker } from "native-date-picker"
import { NetworkStatus, type NetworkState } from "native-network-status"

export function NativeBridgeDemoCard() {
  const { themed } = useAppTheme()

  // --- 1. Device Helper State ---
  const [loadingHardware, setLoadingHardware] = useState(false)
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null)
  const [batteryEvent, setBatteryEvent] = useState<BatteryInfo | null>(null)

  // --- 2. Date Picker State ---
  const [pickedDate, setPickedDate] = useState<string>("Chưa chọn")
  const [pickedRange, setPickedRange] = useState<string>("Chưa chọn")

  // --- 3. Network Status State ---
  const [currentNetwork, setCurrentNetwork] = useState<NetworkState | null>(null)

  // --- Đăng ký lắng nghe sự kiện khi Mount ---
  useEffect(() => {
    // Lắng nghe sự kiện pin thay đổi từ Native
    const unsubBattery = DeviceHelper.addBatteryListener((info) => {
      setBatteryEvent(info)
    })

    // Lắng nghe sự kiện mạng thay đổi từ Native
    const unsubNetwork = NetworkStatus.addListener((state) => {
      setCurrentNetwork(state)
      NativeToast.show(
        state.isConnected ? `Mạng: ${state.type.toUpperCase()}` : "Mất kết nối mạng!",
        state.isConnected ? NativeToast.Type.Success : NativeToast.Type.Error,
      )
    })

    // Đọc trạng thái mạng ban đầu
    NetworkStatus.getStatus().then(setCurrentNetwork)

    return () => {
      unsubBattery()
      unsubNetwork()
    }
  }, [])

  // --- Handlers: Device Helper ---
  const handleFetchHardware = async () => {
    try {
      setLoadingHardware(true)
      const data = await DeviceHelper.getHardwareInfo()
      setHardwareInfo(data)
      NativeToast.show("Đã đọc thông tin phần cứng thành công!", NativeToast.Type.Success)
    } catch (err: any) {
      NativeToast.show(`Lỗi: ${err.message}`, NativeToast.Type.Error)
    } finally {
      setLoadingHardware(false)
    }
  }

  // --- Handlers: Native Toast ---
  const handleShowToast = (type: typeof NativeToast.Type[keyof typeof NativeToast.Type]) => {
    NativeToast.show(`Thông báo Toast (${type.toUpperCase()}) hoạt động!`, type)
  }

  // --- Handlers: Native Alert ---
  const handleShowAlert = async () => {
    await NativeAlert.show({
      title: "Xác nhận thao tác",
      message: "Hộp thoại Native Alert này được gọi trực tiếp từ module native-alert!",
      confirmText: "Đồng ý",
      neutralText: "Để sau",
      cancelText: "Hủy",
      onConfirm: () => NativeToast.show("Bạn vừa bấm: ĐỒNG Ý", NativeToast.Type.Success),
      onNeutral: () => NativeToast.show("Bạn vừa bấm: ĐỂ SAU", NativeToast.Type.Warning),
      onCancel: () => NativeToast.show("Bạn vừa bấm: HỦY", NativeToast.Type.Normal),
    })
  }

  // --- Handlers: Native Date Picker ---
  const handlePickDate = async () => {
    const selected = await NativeDatePicker.show({
      mode: NativeDatePicker.Mode.Date,
      confirmText: "Xác nhận",
      cancelText: "Đóng",
      onConfirm: (date) => {
        const text = date.toLocaleDateString("vi-VN")
        setPickedDate(text)
        NativeToast.show(`Đã chọn: ${text}`, NativeToast.Type.Success)
      },
    })
    if (!selected) {
      NativeToast.show("Bạn đã hủy chọn ngày.", NativeToast.Type.Normal)
    }
  }

  const handlePickRange = async () => {
    const range = await NativeDatePicker.showRange({
      mode: NativeDatePicker.Mode.Date,
      startLabel: "Từ ngày",
      endLabel: "Đến ngày",
      confirmText: "Chọn",
      cancelText: "Hủy",
      onConfirm: ({ start, end }) => {
        const text = `${start.toLocaleDateString("vi-VN")} → ${end.toLocaleDateString("vi-VN")}`
        setPickedRange(text)
        NativeToast.show("Đã chọn khoảng thời gian!", NativeToast.Type.Success)
      },
    })
    if (!range) {
      NativeToast.show("Bạn đã hủy chọn khoảng thời gian.", NativeToast.Type.Normal)
    }
  }

  return (
    <View style={themed($container)}>
      {/* Header */}
      <View style={themed($headerRow)}>
        <Text text="Demo Bộ 5 Native Modules" preset="subheading" style={themed($title)} />
        <View style={themed(DeviceHelper.isAvailable ? $badgeSuccess : $badgeWarning)}>
          <Text
            text={DeviceHelper.isAvailable ? "Modules Sẵn Sàng" : "Chưa Link Native"}
            style={themed($badgeText)}
          />
        </View>
      </View>

      <Text
        text="Tất cả các chức năng dưới đây đều được bóc tách từ Mono-repo QuangLam0208/native-module qua cú pháp #path:/"
        style={themed($description)}
      />

      {/* ============================================================== */}
      {/* 1. NATIVE-DEVICE-HELPER */}
      {/* ============================================================== */}
      <View style={themed($section)}>
        <Text text="1. Module: native-device-helper" preset="bold" style={themed($subTitle)} />
        <View style={themed($infoBox)}>
          <Text text={`• Model máy: ${DeviceHelper.model ?? "N/A"}`} />
          <Text text={`• Hệ điều hành: ${DeviceHelper.osVersion ?? "N/A"}`} />
          {batteryEvent && (
            <Text
              text={`• Pin (Real-time Event): ${batteryEvent.batteryLevel}% ${batteryEvent.isCharging ? "⚡ (Đang sạc)" : ""}`}
              style={themed($eventText)}
            />
          )}
        </View>

        <Button
          text={loadingHardware ? "Đang đọc phần cứng..." : "Đọc RAM & Trạng Thái Pin"}
          onPress={handleFetchHardware}
          disabled={loadingHardware}
          style={themed($button)}
        />
        {loadingHardware && <ActivityIndicator style={themed($loadingSpinner)} />}
        {hardwareInfo && (
          <View style={themed($infoBox)}>
            <Text
              text={`• RAM khả dụng: ${hardwareInfo.availableRamMb} MB / ${hardwareInfo.totalRamMb} MB`}
            />
            <Text
              text={`• Mức pin: ${hardwareInfo.batteryLevel}% (${hardwareInfo.isCharging ? "Đang sạc" : "Dùng pin"})`}
            />
          </View>
        )}
      </View>

      {/* ============================================================== */}
      {/* 2. NATIVE-TOAST */}
      {/* ============================================================== */}
      <View style={themed($section)}>
        <Text text="2. Module: native-toast" preset="bold" style={themed($subTitle)} />
        <View style={themed($buttonRow)}>
          <Button
            text="Success Toast"
            onPress={() => handleShowToast(NativeToast.Type.Success)}
            style={themed($halfButton)}
          />
          <Button
            text="Warning Toast"
            onPress={() => handleShowToast(NativeToast.Type.Warning)}
            style={themed($halfButton)}
          />
        </View>
        <View style={themed($buttonRow)}>
          <Button
            text="Error Toast"
            onPress={() => handleShowToast(NativeToast.Type.Error)}
            style={themed($halfButton)}
          />
          <Button
            text="Normal Toast"
            onPress={() => handleShowToast(NativeToast.Type.Normal)}
            style={themed($halfButton)}
          />
        </View>
      </View>

      {/* ============================================================== */}
      {/* 3. NATIVE-ALERT */}
      {/* ============================================================== */}
      <View style={themed($section)}>
        <Text text="3. Module: native-alert" preset="bold" style={themed($subTitle)} />
        <Button
          text="Mở Native Dialog 3 Nút (Alert)"
          onPress={handleShowAlert}
          style={themed($button)}
        />
      </View>

      {/* ============================================================== */}
      {/* 4. NATIVE-DATE-PICKER */}
      {/* ============================================================== */}
      <View style={themed($section)}>
        <Text text="4. Module: native-date-picker" preset="bold" style={themed($subTitle)} />
        <View style={themed($infoBox)}>
          <Text text={`• Ngày đã chọn: ${pickedDate}`} />
          <Text text={`• Khoảng ngày: ${pickedRange}`} />
        </View>
        <View style={themed($buttonRow)}>
          <Button
            text="Chọn 1 Ngày"
            onPress={handlePickDate}
            style={themed($halfButton)}
          />
          <Button
            text="Chọn Khoảng Ngày"
            onPress={handlePickRange}
            style={themed($halfButton)}
          />
        </View>
      </View>

      {/* ============================================================== */}
      {/* 5. NATIVE-NETWORK-STATUS */}
      {/* ============================================================== */}
      <View style={themed($section)}>
        <Text text="5. Module: native-network-status" preset="bold" style={themed($subTitle)} />
        <View style={themed($infoBox)}>
          <Text
            text={`• Trạng thái mạng: ${currentNetwork?.isConnected ? "ĐANG KẾT NỐI 🟢" : "MẤT MẠNG 🔴"}`}
          />
          <Text text={`• Loại kết nối: ${currentNetwork?.type?.toUpperCase() ?? "N/A"}`} />
          <Text text={`• Mạng tốn phí (3G/4G): ${currentNetwork?.isExpensive ? "Có" : "Không"}`} />
        </View>
        <Button
          text="Kiểm Tra Mạng Ngay"
          onPress={async () => {
            const net = await NetworkStatus.getStatus()
            setCurrentNetwork(net)
            NativeToast.show(`Đang dùng mạng: ${net?.type}`, NativeToast.Type.Normal)
          }}
          style={themed($button)}
        />
      </View>
    </View>
  )
}

// --- Styles ---
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  marginTop: spacing.md,
  marginBottom: spacing.xl,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.xs,
})

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 17,
  fontWeight: "700",
  flex: 1,
})

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 13,
  marginBottom: spacing.md,
  lineHeight: 18,
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

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  paddingTop: spacing.sm,
  borderTopWidth: 1,
  borderTopColor: "#E5E7EB",
})

const $subTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 14,
  marginBottom: spacing.xs,
  color: "#2563EB",
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
  minHeight: 40,
})

const $buttonRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.xs,
  marginVertical: spacing.xxs,
})

const $halfButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minHeight: 38,
})

const $infoBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  padding: spacing.sm,
  borderRadius: 8,
  marginVertical: spacing.xs,
  gap: 3,
})

const $eventText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "600",
  fontSize: 13,
})

const $loadingSpinner: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
})
