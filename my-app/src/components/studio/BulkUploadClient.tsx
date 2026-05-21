"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadDropzone } from "@/lib/uploadthing"
import { createBulkTracks } from "@/app/actions/bulk"
import { deleteFileFromCloud } from "@/app/actions/delete-file"
import { Loader2, CheckCircle, ArrowRight, FileAudio } from "lucide-react"

interface UploadedFile {
  id: string // Это key из UploadThing
  fileName: string
  title: string
  audioUrl: string
  detectedType: "MP3" | "WAV"
}

export default function BulkUploadClient() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Обработка успешного завершения загрузки пачки файлов
  const handleUploadComplete = (res: any[]) => {
    if (!res) return

    const newFiles: UploadedFile[] = res.map((file) => {
      const fileNameLower = file.name.toLowerCase()
      const detected: "MP3" | "WAV" = fileNameLower.endsWith(".wav") ? "WAV" : "MP3"
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "")

      return {
        id: file.key, // file.key используем как уникальный ID
        fileName: file.name,
        title: cleanTitle,
        audioUrl: file.ufsUrl,
        detectedType: detected
      }
    })

    setFiles((prev) => [...prev, ...newFiles])
  }

  // Изменение названия черновика в UI
  const handleTitleChange = (id: string, newTitle: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title: newTitle } : f)))
  }

  // Единственная и правильная функция удаления файла из облака и UI
  const handleRemoveFile = async (fileKey: string) => {
    try {
      setDeletingId(fileKey)
      
      // 1. Удаляем физически из хранилища UploadThing
      const res = await deleteFileFromCloud(fileKey)
      
      if (res.success) {
        // 2. Убираем из стейта на клиенте
        setFiles((prev) => prev.filter((f) => f.id !== fileKey))
      } else {
        alert(`Не удалось удалить файл с сервера: ${res.error}`)
      }
    } catch (err) {
      console.error(err)
      alert("Произошла ошибка при удалении файла")
    } finally {
      setDeletingId(null)
    }
  }

  // Финальный импорт проверенных файлов в базу данных Prisma
  const handleSaveDrafts = async () => {
    if (files.length === 0) return

    try {
      setIsSaving(true)
      const payload = files.map((f) => ({
        title: f.title,
        audioUrl: f.audioUrl,
        detectedType: f.detectedType
      }))

      const res = await createBulkTracks(payload)
      if (res.success) {
        router.push("/studio/tracks")
        router.refresh()
      } else {
        alert(res.error)
      }
    } catch (err) {
      console.error(err)
      alert("Ошибка при сохранении черновиков в базу данных")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ЗОНА ЗАГРУЗКИ UPLOADTHING */}
      <div className="bg-[#0c0d12]/20 border border-white/[0.04] rounded-2xl p-2 backdrop-blur-md">
        <UploadDropzone
          endpoint="bulkPreviewAudio"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error: Error) => {
            alert(`Ошибка при загрузке: ${error.message}`)
          }}
          className="border-dashed border-white/[0.08] hover:border-red-600/30 transition-colors ut-button:bg-red-600 ut-button:hover:bg-red-500 ut-button:text-xs ut-button:font-mono ut-button:uppercase ut-label:text-zinc-300 ut-label:text-xs ut-allowed-content:text-zinc-600 py-8"
          content={{
            label: "Перетащите сюда биты (.MP3 или .WAV) или кликните для выбора",
            allowedContent: "Аудиофайлы до 128MB"
          }}
        />
      </div>

      {/* ОЧЕРЕДЬ ДЛЯ РЕДАКТИРОВАНИЯ И ИМПОРТА В БД */}
      {files.length > 0 && (
        <div className="p-6 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.02] pb-3">
            <span className="text-[10px] font-mono uppercase text-zinc-400">
              Успешно загружено в облако ({files.length})
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">
              Вы можете переименовать их перед созданием черновиков
            </span>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-black/40 border border-white/[0.03] rounded-xl gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${
                      file.detectedType === "WAV"
                        ? "bg-blue-500/5 border-blue-500/10 text-blue-400"
                        : "bg-purple-500/5 border-purple-500/10 text-purple-400"
                    }`}
                  >
                    <FileAudio className="h-4 w-4" />
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <input
                      type="text"
                      value={file.title}
                      onChange={(e) => handleTitleChange(file.id, e.target.value)}
                      className="bg-transparent text-xs font-bold text-white focus:outline-none focus:border-b border-red-600/40 w-full p-0 pb-0.5"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-zinc-600 truncate max-w-[250px]">
                        {file.fileName}
                      </span>
                      <span
                        className={`text-[8px] font-mono px-1 rounded uppercase ${
                          file.detectedType === "WAV"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {file.detectedType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10 uppercase">
                    <CheckCircle className="h-3 w-3" /> Готов к импорту
                  </span>

                  <button
                    type="button"
                    disabled={deletingId === file.id}
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-zinc-600 hover:text-red-400 text-[11px] font-mono uppercase transition-colors disabled:opacity-40"
                  >
                    {deletingId === file.id ? "Удаление..." : "Убрать"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ПОДТВЕРЖДЕНИЕ ЗАПИСИ В БД */}
          <div className="pt-3 border-t border-white/[0.02] flex justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDrafts}
              className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.1)]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Создание черновиков...
                </>
              ) : (
                <>
                  Сгенерировать черновики ({files.length}) <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}