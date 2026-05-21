import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";

export const dynamic = "force-dynamic"; // Отключаем кэширование

const utapi = new UTApi();

export async function GET(req: Request) {
  try {
    // 1. Защита эндпоинта (Cron Secret от Vercel)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Вычисляем время 24 часа назад
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // 3. Ищем все файлы, которые зависли в очереди дольше 24 часов
    const orphanedFiles = await prisma.uploadQueue.findMany({
      where: { createdAt: { lt: yesterday } },
      select: { fileKey: true, id: true },
    });

    if (orphanedFiles.length === 0) {
      return NextResponse.json({ message: "Мусора нет, все чисто!" });
    }

    // 4. Собираем ключи для UploadThing
    const keysToDelete = orphanedFiles.map((file) => file.fileKey);

    // 5. Удаляем физически из облака UploadThing
    const deleteResult = await utapi.deleteFiles(keysToDelete);

    // 6. Удаляем записи из базы данных
    const idsToDelete = orphanedFiles.map((file) => file.id);
    await prisma.uploadQueue.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    return NextResponse.json({
      message: `Успешно удалено ${keysToDelete.length} файлов-сирот`,
      utResult: deleteResult
    });

  } catch (error) {
    console.error("Ошибка Cron-чистильщика:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}