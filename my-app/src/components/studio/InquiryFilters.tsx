"use client"

import { useRouter, useSearchParams } from "next/navigation"

const statuses = [
  { label: "Все", value: "ALL" },
  { label: "Ожидают оплаты", value: "PENDING_PAYMENT" },
  { label: "Чек получен", value: "PAYMENT_SUBMITTED" },
  { label: "Оплачено", value: "PAID" },
  { label: "Завершено", value: "COMPLETED" },
  { label: "Споры", value: "DISPUTE" },
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
                ? "bg-red-600/10 text-red-400 border-red-500/30 font-bold"
                : "bg-white/[0.01] text-zinc-500 border-white/[0.04] hover:text-zinc-300 hover:border-white/[0.1]"
            }`}
          >
            {status.label}
          </button>
        )
      })}
    </div>
  )
}