/**
 * Parses and cleans bullet-pointed or multi-line text into a list of trimmed strings.
 * Strips leading bullet markers (•, -, *) and ignores empty lines.
 */
export function parseBulletLines(rawText?: string | null): string[] {
  if (!rawText) return []
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        return line.substring(1).trim()
      }
      return line
    })
    .filter((line) => line.length > 0)
}

/**
 * Cleans and standardizes raw description text from the backend:
 * - Unescapes escaped characters (`\"` -> `"`).
 * - Strips erratic tab characters (`\t` or `\\t`).
 * - Unescapes literal newlines (`\\n`, `\\r\\n`).
 * - Joins accidental line breaks in the middle of words/sentences (e.g. "hỗ\n trợ").
 * - Trims each paragraph and removes empty lines.
 * - Standardizes paragraph breaks with double newlines (`\n\n`).
 *
 * NOTE: Preserves all content paragraphs as-is without deduplication.
 */
export function cleanDescription(rawText?: string | null): string {
  if (!rawText) return ""

  // 1. Unescape escaped characters (quotes, literal \n, \r, \t)
  let text = rawText
    .replace(/\\"/g, '"')
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, " ")

  // 2. Replace actual tab characters with space
  text = text.replace(/\t+/g, " ")

  // 3. Fix soft wraps where newline breaks a word or sentence mid-flow (e.g. "hỗ\n trợ")
  text = text.replace(/([a-zà-ỹA-ZÀ-Ỹ0-9,])\r?\n\s*([a-zà-ỹ])/gu, "$1 $2")

  // 4. Split by newlines, trim each paragraph, and filter empty strings
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // 5. Join all paragraphs with standard double newlines (preserving full data)
  return lines.join("\n\n")
}
