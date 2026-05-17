"use client"

import * as React from "react"
import Link from "next/link"
import { 
  X, User, Settings, FolderHeart, CreditCard, 
  Plus, LogOut, Disc, ShieldCheck, Wallet 
} from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function AppSidebar({ isOpen, onClose }: Props) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-zinc-950/20 dark:bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Сайдбар по канонам системного UI: чистый, структурированный, контрастный */}
      <div className="relative w-full max-w-[350px] h-full bg-zinc-50 dark:bg-[#121214] border-l border-zinc-200/80 dark:border-zinc-900 p-6 flex flex-col justify-between shadow-xl animate-slide-in text-zinc-950 dark:text-zinc-50 transition-colors duration-200">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-zinc-200/60 dark:border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-black text-xs">VI</div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide">Vision Studio</h4>
                <span className="text-[9px] text-brand-red font-bold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck size={10} /> Pro Producer
                </span>
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition">
              <X size={14} />
            </button>
          </div>

          {/* Виджет баланса (В стиле Stripe/Paypal) */}
          <div className="mt-5 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/50 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Wallet size={16} className="text-zinc-400" />
              <div>
                <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Balance</span>
                <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50">$1,450.25</span>
              </div>
            </div>
            <button className="text-[10px] font-bold uppercase text-brand-red bg-brand-red/5 px-3 py-1.5 rounded-lg hover:bg-brand-red hover:text-white transition">
              Payout
            </button>
          </div>

          {/* Навигация */}
          <div className="mt-6 space-y-0.5">
            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block px-2.5 mb-2">Personal</span>
            {[
              { href: "/vision", icon: User, label: "My Studio Profile" },
              { href: "/dashboard", icon: Disc, label: "Tracks & Kits Manager" },
              { href: "/purchases", icon: FolderHeart, label: "Purchased Beats" },
              { href: "/billing", icon: CreditCard, label: "Sales & Billing" },
              { href: "/settings", icon: Settings, label: "Account Settings" }
            ].map((link) => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href} onClick={onClose} className="flex items-center gap-3.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900/60 rounded-lg px-2.5 py-2.5 text-xs font-semibold transition shadow-sm shadow-transparent hover:shadow-zinc-100 dark:hover:shadow-none">
                  <Icon size={15} className="text-zinc-400" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Подвал действий */}
        <div className="space-y-2 pt-4 border-t border-zinc-200/60 dark:border-zinc-900">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-4 py-3 text-xs font-bold transition hover:bg-zinc-50 dark:hover:bg-zinc-850">
            <Plus size={14} />
            <span>New Playlist</span>
          </button>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 hover:bg-brand-red/5 dark:hover:bg-brand-red/10 text-zinc-500 hover:text-brand-red px-4 py-3 text-xs font-bold transition">
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>

      </div>
    </div>
  )
}