"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, User, Lock, ArrowRight, ShieldCheck } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, confirmPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Произошла ошибка при регистрации")
      }

      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0c0d12] p-6 overflow-hidden">
      {/* Фоновые градиенты */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Карточка */}
      <div className="w-full max-w-[400px] relative z-10 bg-[#0c0d12]/60 backdrop-blur-2xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl">
        
        <div className="mb-8 text-center">
          <div className="mx-auto w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase">Регистрация</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Создайте аккаунт в системе AURA</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: "Email", icon: Mail, type: "email", value: email, setter: setEmail, placeholder: "name@domain.com" },
            { label: "Никнейм", icon: User, type: "text", value: username, setter: setUsername, placeholder: "username" },
            { label: "Пароль", icon: Lock, type: "password", value: password, setter: setPassword, placeholder: "••••••••" },
            { label: "Подтверждение", icon: Lock, type: "password", value: confirmPassword, setter: setConfirmPassword, placeholder: "••••••••" },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5 ml-1">
                {field.label}
              </label>
              <div className="relative group">
                <field.icon className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-white transition-colors" />
                <input
                  type={field.type}
                  required
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-zinc-700 focus:border-white/20 focus:bg-white/[0.04] transition-all outline-none"
                  placeholder={field.placeholder}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 h-10 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLoading ? "Загрузка..." : "Создать аккаунт"}
            {!isLoading && <ArrowRight className="h-3 w-3" />}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-medium text-zinc-600">
          Уже есть доступ?{" "}
          <Link href="/login" className="text-white font-bold hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  )
}