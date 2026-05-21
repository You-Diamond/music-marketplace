import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const f = createUploadthing();

const producerMiddleware = async () => {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    throw new Error("Доступ запрещен: вы должны быть продюсером");
  }
  return { userId: session.user.id };
};

export const ourFileRouter = {
  trackImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(producerMiddleware)
    .onUploadComplete(async ({ file }) => {
      // ⚡️ Регистрируем файл в очереди на удаление (на случай, если юзер сольется)
      await prisma.uploadQueue.create({ data: { fileKey: file.key } });
      return { url: file.ufsUrl };
    }),

  singlePreviewMp3: f({ audio: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(producerMiddleware)
    .onUploadComplete(async ({ file }) => {
      await prisma.uploadQueue.create({ data: { fileKey: file.key } });
      return { url: file.ufsUrl };
    }),

  singleCommercialWav: f({ audio: { maxFileSize: "256MB", maxFileCount: 1 } })
    .middleware(producerMiddleware)
    .onUploadComplete(async ({ file }) => {
      await prisma.uploadQueue.create({ data: { fileKey: file.key } });
      return { url: file.ufsUrl };
    }),
  // 4. ПАКЕТНАЯ ЗАГРУЗКА (До 20 аудиофайлов до 256MB)
  bulkPreviewAudio: f({
    audio: { maxFileSize: "256MB", maxFileCount: 20 }
  })
    .middleware(producerMiddleware)
    .onUploadComplete(async ({ file }) => {
      await prisma.uploadQueue.create({ data: { fileKey: file.key } });
      return { url: file.ufsUrl };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;