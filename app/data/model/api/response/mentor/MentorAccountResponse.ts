export interface MentorGroupResponse {
  id: number
  status?: number
  name?: string
  description?: string
  kind?: number
  subKind?: number
  isSystemRole?: boolean
}

export interface MentorAccountResponse {
  id: number
  kind?: number | null
  username?: string | null
  phone?: string | null
  email?: string | null
  fullName?: string | null
  avatarPath?: string | null
  group?: MentorGroupResponse | null
  isSuperAdmin?: boolean | null
}
