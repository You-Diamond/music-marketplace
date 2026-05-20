"use client"

export default function AppFooter() {
  return (
    // ИСПРАВЛЕНО: Минималистичное прозрачное стекло для футера
    <footer className="w-full border-t border-white/[0.02] bg-[#0c0d12]/20 backdrop-blur-md py-8 px-6 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-semibold tracking-widest uppercase text-zinc-500">
        <p className="flex items-center gap-2">
          © {new Date().getFullYear()} <span className="text-white font-black tracking-tighter">AURA.</span> 
          <span className="text-zinc-500 font-medium tracking-normal">// NEON HUB SYSTEM.</span>
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Условия</a>
          <a href="#" className="hover:text-white transition-colors">Поддержка</a>
        </div>
      </div>
    </footer>
  )
}