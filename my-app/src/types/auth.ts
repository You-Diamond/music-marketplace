export type UserRole =
  | "listener"
  | "producer"
  | "admin"

export type AuthUser = {
  id: string

  username: string

  displayName: string

  email: string

  avatar?: string

  role: UserRole
}