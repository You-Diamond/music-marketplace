"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Описываем структуру лицензии, приходящей с фронтенда
interface LicenseInput {
  templateId: string
  isActive: boolean
  price: number | null
}

interface UpdateTrackInput {
  title: string
  bpm: number | string
  musicKey: string
  genreId: string
  image: string | null
  audio: string
  wavUrl: string | null
  stemsUrl: string | null
  moodIds: string[]
  licenses?: LicenseInput[] // Опционально для апдейта
}

const extractKeyFromUrl = (url: string | null) => {
  if (!url) return null;
  const parts = url.split("/f/");
  return parts.length > 1 ? parts[1] : null;
};

export async function updateTrack(trackId: string, data: UpdateTrackInput) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "PRODUCER") {
      return { success: false, error: "Недостаточно прав" }
    }

    const existingTrack = await prisma.track.findUnique({
      where: { id: trackId }
    })

    if (!existingTrack || existingTrack.producerId !== session.user.id) {
      return { success: false, error: "Трек не найден или у вас нет прав на его редактирование" }
    }

    const validationError = validateTrackData(data)
    if (validationError) {
      return { success: false, error: validationError }
    }

    // Используем транзакцию для полной синхронизации метаданных и лицензий
    await prisma.$transaction(async (tx) => {
      // 1. Обновляем основные метаданные трека и настроения
      await tx.track.update({
        where: { id: trackId },
        data: {
          title: data.title,
          bpm: Number(data.bpm),
          musicKey: data.musicKey,
          genreId: data.genreId,
          image: data.image,
          audio: data.audio,
          wavUrl: data.wavUrl,
          stemsUrl: data.stemsUrl,
          moods: {
            set: data.moodIds.map((id) => ({ id }))
          }
        }
      })

      // 2. Если с фронтенда пришли настроенные лицензии — обновляем их матрицу
      if (data.licenses && data.licenses.length > 0) {
        for (const lic of data.licenses) {
          await tx.license.updateMany({
            where: {
              trackId: trackId,
              templateId: lic.templateId
            },
            data: {
              isActive: lic.isActive,
              price: lic.price
            }
          })
        }
      } else {
        // Подстраховка: если лицензий вообще нет в базе (старый баг), генерируем их
        const existingLicenses = await tx.license.findMany({
          where: { trackId: trackId }
        })

        if (existingLicenses.length === 0) {
          const templates = await tx.licenseTemplate.findMany({
            where: { producerId: session.user.id }
          })

          if (templates.length > 0) {
            await tx.license.createMany({
              data: templates.map((t) => ({
                trackId: trackId,
                templateId: t.id,
                price: t.defaultPrice,
                isActive: true
              }))
            })
          }
        }
      }
    })

    const keysToSave = [
      extractKeyFromUrl(data.image),
      extractKeyFromUrl(data.audio),
      extractKeyFromUrl(data.wavUrl)
    ].filter(Boolean) as string[];

    // 3. ⚡️ Удаляем эти ключи из "камеры смертников" (UploadQueue)
    if (keysToSave.length > 0) {
      await prisma.uploadQueue.deleteMany({
        where: { fileKey: { in: keysToSave } }
      });
    }

    revalidatePath("/studio/tracks")
    revalidatePath("/beats")
    
    return { success: true }
  } catch (error) {
    console.error("Update track error:", error)
    return { success: false, error: "Произошла ошибка при обновлении данных трека" }
  }
}

interface CreateTrackInput {
  title: string
  bpm: number | string
  musicKey: string
  genreId: string
  image: string | null
  audio: string 
  wavUrl: string | null
  stemsUrl: string | null
  moodIds: string[]
  licenses: LicenseInput[] // Массив конфигурации лицензий со страницы загрузки
}

export async function createTrack(formData: CreateTrackInput) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ запрещен" }
  }


  const validationError = validateTrackData(formData)
  if (validationError) {
    return { success: false, error: validationError }
  }


  try {
    const newTrack = await prisma.$transaction(async (tx) => {
      // 1. Ищем существующие шаблоны лицензий этого продюсера
      let templates = await tx.licenseTemplate.findMany({
        where: { producerId: session.user.id }
      })

      // 🌟 Ваша ПОДСТРАХОВКА: создаем дефолтные шаблоны, если продюсер зашел впервые
      if (templates.length === 0) {
        const defaultTemplatesData = [
          { name: "MP3 Лизинг", slug: "basic", defaultPrice: 1500, isPriceNegotiable: false, fileType: "MP3" as const },
          { name: "WAV Премиум", slug: "premium", defaultPrice: 3500, isPriceNegotiable: false, fileType: "MP3_WAV" as const },
          { name: "Эксклюзивные Права", slug: "exclusive", defaultPrice: null, isPriceNegotiable: true, fileType: "MP3_WAV_STEMS" as const },
        ]

        templates = await Promise.all(
          defaultTemplatesData.map((t) =>
            tx.licenseTemplate.create({
              data: {
                ...t,
                producerId: session.user.id,
                arbitrationCountry: "Russia",
                governingLawCountry: "Russia",
                isDefaultActive: true,
              },
            })
          )
        )
      }

      // 2. Создаем сам трек и привязываем настроения (Moods)
      const track = await tx.track.create({
        data: {
          title: formData.title,
          bpm: Number(formData.bpm),
          musicKey: formData.musicKey,
          genreId: formData.genreId,
          image: formData.image,
          audio: formData.audio, 
          wavUrl: formData.wavUrl,
          stemsUrl: formData.stemsUrl,
          duration: 180, // Дефолтная длительность, позже можно будет считывать с аудио-метаданных
          producerId: session.user.id,
          moods: {
            connect: formData.moodIds.map((id) => ({ id }))
          }
        },
      })

      // 3. Смешиваем данные шаблонов и кастомные настройки из UI формы загрузки
      // Если по какой-то причине шаблон не пришел из UI (например, ленивая инициализация только что создала новые),
      // берем цену по умолчанию из свежесозданного шаблона.
      const licensesToCreate = templates.map((t) => {
        const uiSetting = formData.licenses.find((l) => l.templateId === t.id)
        
        return {
          trackId: track.id,
          templateId: t.id,
          isActive: uiSetting ? uiSetting.isActive : true,
          price: uiSetting 
            ? uiSetting.price 
            : t.defaultPrice
        }
      })

      // 4. Массово сохраняем лицензии в базу данных
      await tx.license.createMany({
        data: licensesToCreate
      })

      return track
    })

    const keysToSave = [
      extractKeyFromUrl(formData.image),
      extractKeyFromUrl(formData.audio),
      extractKeyFromUrl(formData.wavUrl)
    ].filter(Boolean) as string[];

    // 3. ⚡️ Удаляем эти ключи из "камеры смертников" (UploadQueue)
    if (keysToSave.length > 0) {
      await prisma.uploadQueue.deleteMany({
        where: { fileKey: { in: keysToSave } }
      });
    }

    revalidatePath("/studio/tracks")
    revalidatePath("/beats")
    return { success: true, trackId: newTrack.id }
  } catch (error: any) {
    console.error("Ошибка при создании трека:", error)
    return { success: false, error: "Не удалось сохранить трек и привязать лицензии/настроения." }
  }
}
function validateTrackData(formData: any) {
  const bpmNum = Number(formData.bpm)
  if (isNaN(bpmNum) || bpmNum < 20 || bpmNum > 300) {
    return "Некорректный темп (BPM). Значение должно быть в диапазоне от 20 до 300."
  }

  if (!formData.title || formData.title.trim().length < 2) {
    return "Название трека слишком короткое (минимум 2 символа)."
  }

  if (!formData.audio) {
    return "Обязательно загрузите MP3-превью трека, чтобы пользователи могли его прослушать."
  }

   if (!formData.image) {
    return "Обязательно загрузите изображение трека, чтобы пользователи могли его видеть."
  }

  // Проверка матрицы лицензий
  if (formData.licenses && formData.licenses.length > 0) {
    for (const lic of formData.licenses) {
      // Нам важны только те лицензии, которые продюсер РЕШИЛ ВКЛЮЧИТЬ (isActive === true)
      if (lic.isActive) {
        // Защита от некорректных цен
        if (lic.price !== null && lic.price <= 0) {
          return `Цена для лицензии не может быть меньше или равна 0 ₽.`
        }

        // Проверка соответствия форматов файлов (опираемся на данные, которые мы можем вытащить или передать)
        // Для createTrack мы передаем тип файла прямо с фронта для удобства валидации:
        if (lic.fileType === "MP3_WAV_STEMS" && (!formData.stemsUrl || formData.stemsUrl.trim() === "")) {
          return `Вы активировали лицензию со Stems (трекаутами), но не указали ссылку на архив со стемсами.`
        }

        if (lic.fileType === "MP3_WAV" && !formData.wavUrl) {
          return `Вы активировали WAV-лицензию, но не загрузили оригинальный HQ WAV файл.`
        }
      }
    }
  }

  return null // Ошибок нет
}