"use client"

import { useEffect } from "react"
import { useHomeStore } from "@/stores/useHomeStore"

export default function HomeDataInitializer() {
  const fetchHomeData = useHomeStore((state) => state.fetchHomeData)

  useEffect(() => {
    fetchHomeData()
  }, [fetchHomeData])

  return null
}