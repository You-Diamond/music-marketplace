"use client"

import { useRouter, useSearchParams } from "next/navigation"

// Строгое соответствие enum InquiryStatus из schema.prisma
const statuses = [
  { label: "Все лиды", value: "ALL" },
  { label: "Новые запросы", value: "PENDING" },
  { label: "В работе (Связался)", value: "CONTACTED" },
  { label: "Успешная сделка", value: "COMPLETED" },
  { label: "Отклонено", value: "DECLINED" },
  { label: "Архив", value: "ARCHIVED" },
]

export default function InquiryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get("status") || "ALL"

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === "ALL") {
      params.delete("status")
    } else {
      params.set("status", status)
    }
    router.push(`/studio/inquiries?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 border-b border-white/[0.04] pb-4">
      {statuses.map((status) => {
        const isActive = currentStatus === status.value
        return (
          <button
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider border transition-all ${
              isActive
                ? "bg-red-600 border-transparent text-white shadow-[0_0_15px_rgba(220,38,38,0.15)]"
                : "bg-white/[0.01] border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            {status.label}
          </button>
        )
      })}
    </div>
  )
}