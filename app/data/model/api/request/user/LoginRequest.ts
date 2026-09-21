export interface LoginRequest {
    grant_type: "password"
    username: string
    password: string
}