/**
 * The pagination envelope used by list endpoints (mirrors
 * ai-project-android's data/model/api/response/course/PageResponse.java).
 */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
}
