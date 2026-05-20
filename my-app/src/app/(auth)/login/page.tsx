"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { User, Lock, LogIn, KeyRound } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Аккаунт создан! Войдите в систему.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Неверный логин или пароль")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Ошибка соединения с сервером")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0c0d12] p-6 overflow-hidden">
      {/* Фоновые градиенты */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Карточка */}
      <div className="w-full max-w-[400px] relative z-10 bg-[#0c0d12]/60 backdrop-blur-2xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl">
        
        <div className="mb-8 text-center">
          <div className="mx-auto w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
            <KeyRound className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase">Вход</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Добро пожаловать в AURA</p>
        </div>

        {/* Сообщения */}
        {(error || success) && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-center ${
            error ? "border-red-500/20 bg-red-500/5 text-red-400" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
          }`}>
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / ID */}
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 ml-1">Идентификатор</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-zinc-700 focus:border-white/20 focus:bg-white/[0.04] transition-all outline-none"
                placeholder="Email или Username"
              />
            </div>
          </div>

          {/* Пароль */}
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 ml-1">Пароль</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-white transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-zinc-700 focus:border-white/20 focus:bg-white/[0.04] transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 h-10 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLoading ? "Авторизация..." : "Войти в систему"}
            {!isLoading && <LogIn className="h-3 w-3" />}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-medium text-zinc-600">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-white font-bold hover:underline">Регистрация</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0d12]" />}>
      <LoginContent />
    </Suspense>
  )
}