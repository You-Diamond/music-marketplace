import { auth } from "@/lib/auth-config"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Protected routes that require authentication
  const protectedRoutes = [
    "/studio",
    "/dashboard",
    "/settings",
    "/cart",
    "/orders",
  ]

  // Admin-only routes
  const adminRoutes = ["/admin"]

  const pathname = request.nextUrl.pathname

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if ((isProtected || isAdminRoute) && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if accessing admin route without admin role
  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect authenticated users away from login/register pages
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected routes
    "/studio/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
    "/cart/:path*",
    "/orders/:path*",
    "/admin/:path*",
    // Auth pages
    "/login",
    "/register",
  ],
}
