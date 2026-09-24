/**
 * Standardized font size scale across the entire application.
 * Constrains typography between 8px and 16px to ensure visual consistency:
 * - 16px: Titles, Headings, Primary button labels
 * - 15px: Subheadings, Form labels
 * - 14px: Main content, Body text, Input text
 * - 12px: Secondary text, Captions, Helpers
 * - 10px: Small tags, Micro labels
 * - 8px: Tiny badges, Fine print
 */
export const fontSizes = {
  caption: 8,
  xs: 10,
  sm: 12,
  content: 14,
  md: 15,
  title: 16,
  display: 22,
  hero: 28,
} as const

export type FontSizes = typeof fontSizes
