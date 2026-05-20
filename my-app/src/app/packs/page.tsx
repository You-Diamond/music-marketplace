import { Suspense } from "react";
import PacksContent from "@/components/packs/packs-content";

export default function PacksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-20 text-center text-zinc-500">Загрузка каталога...</div>}>
      <PacksContent />
    </Suspense>
  );
}