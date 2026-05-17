type Props = {
  title: string

  value: string

  description: string
}

export default function AnalyticsCard({
  title,
  value,
  description,
}: Props) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        {title}
      </p>

      <h2 className="mt-5 text-5xl font-black">
        {value}
      </h2>

      <p className="mt-4 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  )
}