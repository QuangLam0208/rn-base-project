import { SyllabusResponse } from "./SyllabusResponse"

/**
 * Course DTO mirroring Android's CourseResponse.java
 */
export interface CourseResponse {
  id: number
  status?: number
  createdDate?: string
  modifiedDate?: string
  name: string
  avatar?: string | null
  price?: number | null
  shortDescription?: string | null
  totalTimeline?: number | null
  syllabuses?: SyllabusResponse[]
}
