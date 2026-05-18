export type UserRole = "USER" | "PRODUCER" | "ADMIN"

export interface AuthUser {
  id: string
  email: string
  username: string
  displayName?: string
  avatar?: string
  role: UserRole
  verified: boolean
}

export interface RegisterFormData {
  email: string
  username: string
  displayName: string
  password: string
  confirmPassword: string
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}