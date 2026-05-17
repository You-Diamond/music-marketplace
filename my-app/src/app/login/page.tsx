import Link from "next/link"

import {
  ArrowRight,
} from "lucide-react"
import {
  FaGithub,
} from "react-icons/fa"
import AuthLayout from "@/components/auth/AuthLayout"

import AuthInput from "@/components/auth/AuthInput"

export default function LoginPage() {
  return (
    <AuthLayout
      title="Login"
      subtitle="Access your producer account, licenses, analytics and marketplace tools."
    >
      <form className="space-y-6">
        <AuthInput
          label="E-Mail"
          type="email"
          placeholder="vision@gmail.com"
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 text-sm text-zinc-500">
            <input type="checkbox" />

            Remember Me
          </label>

          <Link
            href="/forgot-password"
            className="text-sm uppercase tracking-[0.15em] text-zinc-500 transition hover:text-white"
          >
            Forgot Password
          </Link>
        </div>

        <button className="flex h-16 w-full items-center justify-center gap-4 rounded-2xl bg-white text-sm font-black uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]">
          Login

          <ArrowRight size={18} />
        </button>
      </form>

      <div className="mt-10">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-black px-5 text-xs uppercase tracking-[0.25em] text-zinc-500">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button className="flex h-16 items-center justify-center gap-3 rounded-2xl border border-white/10 transition hover:border-white/20">
            <FaGithub size={20} />

            <span className="text-sm font-black uppercase tracking-[0.15em]">
              GitHub
            </span>
          </button>

          <button className="flex h-16 items-center justify-center gap-3 rounded-2xl border border-white/10 transition hover:border-white/20">
            <span className="text-sm font-black uppercase tracking-[0.15em]">
              Google
            </span>
          </button>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-zinc-500">
          Don’t have an account?{" "}

          <Link
            href="/register"
            className="font-black uppercase tracking-[0.15em] text-white"
          >
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}