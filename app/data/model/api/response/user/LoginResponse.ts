export interface LoginResponse {
  access_token: string
  token_type: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  user_id?: number
  username?: string
}