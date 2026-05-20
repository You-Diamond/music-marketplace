import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-utils"
import { registerSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 1. Валидация данных через Zod
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message }, 
        { status: 400 }
      )
    }

    const { email, username, password } = parsed.data

    // 2. Проверка дубликата Email
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: "Пользователь с таким Email уже зарегистрирован" },
        { status: 409 }
      )
    }

    // 3. Проверка дубликата Username
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: "Это имя пользователя уже занято" },
        { status: 409 }
      )
    }

    // 4. Хэширование пароля
    const hashedPassword = await hashPassword(password)

    // 5. Сохранение в БД (displayName дублирует username)
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        displayName: username, // Автоматическое дублирование!
        password: hashedPassword,
        role: "USER", // Обычный покупатель по умолчанию
      },
    })

    return NextResponse.json(
      { message: "Пользователь успешно создан", userId: newUser.id }, 
      { status: 201 }
    )

  } catch (error) {
    console.error("Ошибка при регистрации:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}