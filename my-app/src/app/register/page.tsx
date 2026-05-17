import Link from "next/link"

import {
  ArrowRight,
  Check,
} from "lucide-react"

import AuthLayout from "@/components/auth/AuthLayout"

import AuthInput from "@/components/auth/AuthInput"

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the next generation beat marketplace platform."
    >
      <form className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <AuthInput
            label="Display Name"
            placeholder="VISION"
          />

          <AuthInput
            label="Username"
            placeholder="vision"
          />
        </div>

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

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
        />

        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex items-start gap-4">
            <Check
              size={20}
              className="mt-1"
            />

            <p className="text-sm leading-relaxed text-zinc-500">
              By creating an account you agree to future
              licensing terms, marketplace policies and
              copyright protection systems.
            </p>
          </div>
        </div>

        <button className="flex h-16 w-full items-center justify-center gap-4 rounded-2xl bg-white text-sm font-black uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]">
          Create Account

          <ArrowRight size={18} />
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-zinc-500">
          Already have an account?{" "}

          <Link
            href="/login"
            className="font-black uppercase tracking-[0.15em] text-white"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}