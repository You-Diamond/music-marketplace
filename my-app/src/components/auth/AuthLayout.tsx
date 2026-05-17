import Link from "next/link"

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string

  subtitle: string

  children: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[220px]" />
      </div>

      <div className="relative w-full max-w-[620px] overflow-hidden rounded-[40px] border border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="border-b border-white/10 p-10">
          <Link
            href="/"
            className="text-3xl font-black uppercase tracking-[0.35em]"
          >
            BEATSO
          </Link>

          <div className="mt-10">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Authentication
            </p>

            <h1 className="mt-5 text-5xl font-black uppercase leading-none">
              {title}
            </h1>

            <p className="mt-5 text-sm leading-relaxed text-zinc-500">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="p-10">
          {children}
        </div>
      </div>
    </main>
  )
}