import { cleanDescription, parseBulletLines } from "./textUtils"

describe("textUtils", () => {
  describe("parseBulletLines", () => {
    it("returns empty array for empty, null, or undefined input", () => {
      expect(parseBulletLines(null)).toEqual([])
      expect(parseBulletLines(undefined)).toEqual([])
      expect(parseBulletLines("")).toEqual([])
      expect(parseBulletLines("   \n   \n")).toEqual([])
    })

    it("parses lines and strips bullet characters (•, -, *)", () => {
      const input = `
        • Dòng thứ nhất
        - Dòng thứ hai
        * Dòng thứ ba
        Dòng bình thường
      `
      expect(parseBulletLines(input)).toEqual([
        "Dòng thứ nhất",
        "Dòng thứ hai",
        "Dòng thứ ba",
        "Dòng bình thường",
      ])
    })

    it("handles Windows (\\r\\n) and Unix (\\n) line breaks cleanly", () => {
      const input = "• Điểm 1\r\n- Điểm 2\n* Điểm 3"
      expect(parseBulletLines(input)).toEqual(["Điểm 1", "Điểm 2", "Điểm 3"])
    })
  })

  describe("cleanDescription", () => {
    it("returns empty string for null, undefined, or empty input", () => {
      expect(cleanDescription(null)).toBe("")
      expect(cleanDescription(undefined)).toBe("")
      expect(cleanDescription("")).toBe("")
      expect(cleanDescription("   \n   \t  ")).toBe("")
    })

    it("unescapes quotes and strips tabs", () => {
      const input = 'Dự án \\"chạy\\" thành công.\t\t\t\t\t\n'
      expect(cleanDescription(input)).toBe('Dự án "chạy" thành công.')
    })

    it("fixes accidental soft breaks within words/phrases", () => {
      const input = "nhiệt tình trong việc hỗ\n trợ học viên."
      expect(cleanDescription(input)).toBe("nhiệt tình trong việc hỗ trợ học viên.")
    })

    it("preserves all paragraphs formatted with double newlines without deduplication", () => {
      const sample =
        'Mình đến với ngành từ những năm 2024. Với việc \\"chạy\\" dự án, mentor cho rất nhiều nơi.\\n' +
        "Bên cạnh đó, là một Backend Developer, mình tự tin.\\n" +
        'Mình đến với ngành từ những năm 2024. Với việc \\"chạy\\" dự án, mentor cho rất nhiều nơi.\\n\\t\\t\\t\\t\\t\\n' +
        "Bên cạnh đó, là một Backend Developer, mình tự tin.\\n"

      const cleaned = cleanDescription(sample)
      expect(cleaned).toBe(
        'Mình đến với ngành từ những năm 2024. Với việc "chạy" dự án, mentor cho rất nhiều nơi.\n\n' +
          "Bên cạnh đó, là một Backend Developer, mình tự tin.\n\n" +
          'Mình đến với ngành từ những năm 2024. Với việc "chạy" dự án, mentor cho rất nhiều nơi.\n\n' +
          "Bên cạnh đó, là một Backend Developer, mình tự tin.",
      )
    })
  })
})
