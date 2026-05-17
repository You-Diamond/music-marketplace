import clsx from "clsx"

type Props = {
  label: string

  active?: boolean
}

export default function FilterChip({
  label,
  active,
}: Props) {
  return (
    <button
      className={clsx(
        "rounded-full border px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition",
        active
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      )}
    >
      {label}
    </button>
  )
}