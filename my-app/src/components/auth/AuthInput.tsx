type Props = {
  label: string

  type?: string

  placeholder?: string
}

export default function AuthInput({
  label,
  type = "text",
  placeholder,
}: Props) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="mt-3 h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-6 outline-none transition focus:border-white/20"
      />
    </div>
  )
}