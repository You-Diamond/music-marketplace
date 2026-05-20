import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Разрешаем только картинки для обложек (до 4МБ)
  trackImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Разрешаем только аудио для превью (MP3 до 16МБ)
  previewAudio: f({ audio: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Разрешаем тяжелый WAV-файл для продажи (до 100МБ)
  wavAudio: f({ audio: { maxFileSize: "128MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;