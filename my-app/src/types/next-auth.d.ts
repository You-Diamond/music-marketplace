import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
// Импортируем оба перечисления для типизации ролей и подписок напрямую из Prisma
import { Role, SubscriptionStatus } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    username: string
    role: Role
    avatar?: string
    verified: boolean
    subscriptionStatus: SubscriptionStatus // <-- Добавлено для авторизации
  }

  interface Session {
    user: {
      id: string
      username: string
      role: Role
      avatar?: string
      verified: boolean
      subscriptionStatus: SubscriptionStatus // <-- Добавлено для использования на фронтенде через useSession()
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: Role
    avatar?: string
    verified: boolean
    subscriptionStatus: SubscriptionStatus // <-- Добавлено для сохранения в JWT токене
  }
}