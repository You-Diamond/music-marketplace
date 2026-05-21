"use client"

import Link from "next/link"

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-white/[0.02] bg-[#0c0d12]/20 backdrop-blur-md py-10 px-4 sm:px-6 lg:px-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Копирайт и брендинг */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[10px] font-semibold tracking-widest uppercase text-zinc-500 text-center sm:text-left">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} <span className="text-white font-black tracking-tighter">AURA.</span>
          </p>
          <span className="hidden sm:inline text-zinc-700">//</span>
          <span className="text-zinc-600 font-medium tracking-normal">RF SOUND MARKET SaaS PLATFORM.</span>
        </div>

        {/* Ссылки навигации по сайту */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[9px] font-bold tracking-widest uppercase text-zinc-400">
          <Link href="/beats" className="hover:text-white transition-colors">Биты</Link>
          <Link href="/packs" className="hover:text-white transition-colors">Сэмпл-паки</Link>
          <Link href="/playlists" className="hover:text-white transition-colors">Плейлисты</Link>
          <Link href="/premium" className="hover:text-white transition-colors text-purple-400">PRO Тарифы</Link>
        </div>

        {/* Юридическая / Техническая информация */}
        <div className="flex items-center gap-6 text-[9px] font-bold tracking-widest uppercase text-zinc-500">
          <a href="#" className="hover:text-white transition-colors">Условия</a>
          <a href="#" className="hover:text-white transition-colors">Поддержка</a>
        </div>

      </div>
    </footer>
  )
}