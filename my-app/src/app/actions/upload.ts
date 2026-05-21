"use server"

import { UTApi } from "uploadthing/server"

const utapi = new UTApi()

export async function deleteUploadedFile(key: string) {
  try {
    await utapi.deleteFiles(key)
    return { success: true }
  } catch (error) {
    console.error("Ошибка при удалении файла:", error)
    return { success: false }
  }
}