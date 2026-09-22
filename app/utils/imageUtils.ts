import Config from "@/config"

/**
 * Normalizes an image or avatar path into a full reachable URL.
 * Matches Android's `ImageUtils.getFullImageUrl(imagePath)` behavior.
 *
 * - Returns `null` if the input is empty, null, undefined, or "null".
 * - Returns the input as-is if it's already an absolute URL (http:// or https://).
 * - Appends to the base API URL download endpoint otherwise.
 */
export function getFullImageUrl(imagePath?: string | null): string | null {
  if (!imagePath || imagePath.trim() === "" || imagePath.trim().toLowerCase() === "null") {
    return null
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  const baseUrl = Config.API_URL
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`
  return `${cleanBase}/v1/file/download${cleanPath}`
}

/**
 * Convenient alias for avatar images across cards and screens.
 */
export const getAvatarUri = getFullImageUrl
