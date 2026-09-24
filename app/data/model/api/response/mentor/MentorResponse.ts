import { MentorAccountResponse } from "./MentorAccountResponse"

export interface MentorResponse {
  id: number
  position?: string | null
  description?: string | null
  account?: MentorAccountResponse | null
}
