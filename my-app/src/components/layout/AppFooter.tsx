"use client"

import Link from "next/link"

export default function AppFooter() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Marketplace",
      links: [
        { label: "Trending Beats", href: "/beats" },
        { label: "Top Producers", href: "/producers" },
        { label: "Curated Playlists", href: "/playlists" },
        { label: "Licensing Info", href: "/licensing" },
      ],
    },
    {
      title: "For Producers",
      links: [
        { label: "Sell Your Beats", href: "/sell" },
        { label: "Studio Dashboard", href: "/dashboard" },
        { label: "Features & Pricing", href: "/pricing" },
        { label: "Pro Creator Tools", href: "/tools" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About BEATSO", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Help & Support", href: "/support" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
  ]

  return (
    /* ЭФФЕКТ ЖИДКОГО СТЕКЛА ДЛЯ ФУТЕРА:
       Тонкая верхняя рамка, сильное размытие backdrop-blur-xl и прозрачные фоны.
       На мобилках добавляем дополнительный отступ pb-24, чтобы футер не перекрывался нижней навигацией.
    */
    <footer className="w-full border-t border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] backdrop-blur-xl transition-colors duration-300 relative z-10 pb-24 xl:pb-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6">
          
          {/* Блок бренда */}
          <div className="lg:col-span-2 space-y-5">
            <Link
              href="/"
              className="text-xl font-black uppercase tracking-[0.25em] text-zinc-950 dark:text-white hover:text-brand-red dark:hover:text-brand-red transition-colors"
            >
              BEATSO
            </Link>
            <p className="text-xs font-bold leading-relaxed text-zinc-400 dark:text-zinc-500 uppercase tracking-wider max-w-sm">
              The premium marketplace for industry-ready instrumentals. Buy, license, and collaborate with top global music producers.
            </p>
          </div>

          {/* Навигационные секции */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-950 dark:text-white">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest hover:text-brand-red dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Нижняя плашка копирайта */}
        <div className="mt-16 pt-8 border-t border-white/10 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          <p>© {currentYear} BEATSO. All studio rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-brand-red transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-brand-red transition-colors">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}