import Toast from "react-native-toast-message"

export interface ToastOptions {
  title?: string
  visibilityTime?: number
  autoHide?: boolean
  topOffset?: number
}

const DEFAULT_VISIBILITY_TIME = 2500
const DEFAULT_TOP_OFFSET = 50

export function showSuccess(message: string, options?: ToastOptions): void {
  Toast.show({
    type: "success",
    text1: options?.title ?? message,
    text2: options?.title ? message : undefined,
    visibilityTime: options?.visibilityTime ?? DEFAULT_VISIBILITY_TIME,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? DEFAULT_TOP_OFFSET,
  })
}

export function showError(message: string, options?: ToastOptions): void {
  Toast.show({
    type: "error",
    text1: options?.title ?? message,
    text2: options?.title ? message : undefined,
    visibilityTime: options?.visibilityTime ?? DEFAULT_VISIBILITY_TIME,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? DEFAULT_TOP_OFFSET,
  })
}

export function showWarning(message: string, options?: ToastOptions): void {
  Toast.show({
    type: "warning",
    text1: options?.title ?? message,
    text2: options?.title ? message : undefined,
    visibilityTime: options?.visibilityTime ?? DEFAULT_VISIBILITY_TIME,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? DEFAULT_TOP_OFFSET,
  })
}

export function showNormal(message: string, options?: ToastOptions): void {
  Toast.show({
    type: "normal",
    text1: options?.title ?? message,
    text2: options?.title ? message : undefined,
    visibilityTime: options?.visibilityTime ?? DEFAULT_VISIBILITY_TIME,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? DEFAULT_TOP_OFFSET,
  })
}

export function hideToast(): void {
  Toast.hide()
}

export const appToast = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  normal: showNormal,
  hide: hideToast,
}
