import { Suspense } from "react"
import BeatsCatalogContent from "@/components/beats/beats-catalog-content"

export default function BeatsPage() {
  return (
    // Suspense нужен для того, чтобы Next.js мог отрендерить 
    // статический каркас страницы, пока параметры поиска загружаются
    <Suspense fallback={<div className="p-20 text-center">Загрузка каталога...</div>}>
      <BeatsCatalogContent />
    </Suspense>
  )
}