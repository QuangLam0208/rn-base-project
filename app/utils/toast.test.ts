import Toast from "react-native-toast-message"

import { showError, showNormal, showSuccess, showWarning } from "./toast"

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
  hide: jest.fn(),
}))

describe("toast utils", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("triggers Toast.show with type success", () => {
    showSuccess("Đăng nhập thành công!")
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text1: "Đăng nhập thành công!",
      }),
    )
  })

  it("triggers Toast.show with type error", () => {
    showError("Đăng nhập thất bại!")
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        text1: "Đăng nhập thất bại!",
      }),
    )
  })

  it("triggers Toast.show with type warning", () => {
    showWarning("Cảnh báo bảo mật!")
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "warning",
        text1: "Cảnh báo bảo mật!",
      }),
    )
  })

  it("triggers Toast.show with type normal", () => {
    showNormal("Thông báo hệ thống")
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "normal",
        text1: "Thông báo hệ thống",
      }),
    )
  })

  it("handles title and message together", () => {
    showSuccess("Thao tác hoàn tất", { title: "Thành công" })
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text1: "Thành công",
        text2: "Thao tác hoàn tất",
      }),
    )
  })
})
