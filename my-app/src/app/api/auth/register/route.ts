import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { hashPassword } from "@/lib/auth-utils"
import { db } from "@/lib/db"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
  displayName: z.string().min(1, "Display name is required").max(50),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, username, displayName, password } = validation.data

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email },
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username },
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        username,
        displayName,
        password: hashedPassword,
        role: "USER",
        verified: false, // Email verification needed
      },
    })

    // TODO: Send verification email

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
