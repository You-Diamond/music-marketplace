"use server"

import { UTApi } from "uploadthing/server"
import { auth } from "@/lib/auth"

const utapi = new UTApi()

export async function deleteFileFromCloud(fileKey: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ запрещен" }
  }

  try {
    // Удаляем файл из хранилища UploadThing по его ключу
    await utapi.deleteFiles(fileKey)
    return { success: true }
  } catch (error) {
    console.error("Failed to delete file from UploadThing:", error)
    return { success: false, error: "Не удалось удалить файл из облака" }
  }
}