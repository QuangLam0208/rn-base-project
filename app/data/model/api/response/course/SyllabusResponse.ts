/**
 * Syllabus DTO mirroring Android's SyllabusResponse.java
 */
export interface SyllabusResponse {
  id: number
  status?: number
  createdDate?: string
  modifiedDate?: string
  courseId?: number
  kind?: number
  name: string
  avatar?: string | null
  description?: string | null
  ordering?: number | null
  timeline?: number | null
}
