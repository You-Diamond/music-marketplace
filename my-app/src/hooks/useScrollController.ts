"use client"

import { useRef, useState, useEffect } from "react"

export function useScrollController() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollBounds = () => {
    const container = scrollContainerRef.current
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      // Допускаем погрешность в 1px для субпиксельного рендеринга
      setCanScrollLeft(scrollLeft > 1)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = container.clientWidth * 0.75 // Прокручиваем на 75% экрана
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollBounds)
      // Проверяем границы при монтировании и изменении размера окна
      checkScrollBounds()
      window.addEventListener("resize", checkScrollBounds)
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollBounds)
      }
      window.removeEventListener("resize", checkScrollBounds)
    }
  }, [])

  return { scrollContainerRef, scroll, canScrollLeft, canScrollRight, checkScrollBounds }
}