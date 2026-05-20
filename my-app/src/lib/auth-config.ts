import { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"
import { loginSchema } from "@/lib/validations"
import { User as PrismaUser } from "@prisma/client"

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)

        if (!parsed.success) {
          throw new Error("Неверный формат данных")
        }

        const { identifier, password } = parsed.data

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier.toLowerCase() },
              { username: identifier.toLowerCase() }
            ]
          }
        }) as PrismaUser | null

        if (!user || !user.password) {
          throw new Error("Неверный Email/Имя пользователя или пароль")
        }

        const isPasswordValid = await verifyPassword(password, user.password)

        if (!isPasswordValid) {
          throw new Error("Неверный Email/Имя пользователя или пароль")
        }

        // Возвращаем все необходимые поля для сессии, включая подписку из Prisma
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          avatar: user.avatar || undefined,
          verified: user.verified,
          subscriptionStatus: user.subscriptionStatus, // <-- ДОБАВЛЕНО
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.avatar = user.avatar
        token.verified = user.verified
        token.subscriptionStatus = user.subscriptionStatus // <-- ДОБАВЛЕНО
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as any
        session.user.avatar = token.avatar as string
        session.user.verified = token.verified as boolean
        session.user.subscriptionStatus = token.subscriptionStatus as any // <-- ДОБАВЛЕНО
      }
      return session
    },
  },
} satisfies NextAuthConfig