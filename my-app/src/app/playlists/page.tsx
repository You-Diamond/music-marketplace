import { Suspense } from "react";
import PlaylistsContent from "@/components/playlists/playlists-content";

export default function PlaylistsPage() {
  return (
    // Suspense обязателен, так как PlaylistsContent использует useSearchParams
    <Suspense fallback={<div className="min-h-screen p-20 text-center text-zinc-500">Загрузка плейлистов...</div>}>
      <PlaylistsContent />
    </Suspense>
  );
}