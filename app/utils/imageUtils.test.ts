import Config from "@/config"
import { getAvatarUri, getFullImageUrl } from "./imageUtils"

describe("imageUtils", () => {
  it("returns null for null, undefined, empty, or 'null' string", () => {
    expect(getFullImageUrl(null)).toBeNull()
    expect(getFullImageUrl(undefined)).toBeNull()
    expect(getFullImageUrl("")).toBeNull()
    expect(getFullImageUrl("   ")).toBeNull()
    expect(getFullImageUrl("null")).toBeNull()
    expect(getFullImageUrl("NULL")).toBeNull()
    expect(getFullImageUrl("  null  ")).toBeNull()
  })

  it("returns full URLs unchanged if they start with http:// or https://", () => {
    expect(getFullImageUrl("http://example.com/avatar.png")).toBe("http://example.com/avatar.png")
    expect(getFullImageUrl("https://cdn.example.com/images/pic.jpg")).toBe(
      "https://cdn.example.com/images/pic.jpg",
    )
  })

  it("constructs full image download URL for relative paths", () => {
    const expectedBase = Config.API_URL.replace(/\/$/, "")
    expect(getFullImageUrl("/uploads/avatar.png")).toBe(`${expectedBase}/v1/file/download/uploads/avatar.png`)
    expect(getFullImageUrl("uploads/avatar.png")).toBe(`${expectedBase}/v1/file/download/uploads/avatar.png`)
  })

  it("getAvatarUri is an alias of getFullImageUrl", () => {
    expect(getAvatarUri).toBe(getFullImageUrl)
  })
})
