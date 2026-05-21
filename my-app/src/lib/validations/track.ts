import * as z from "zod";

export const trackFormSchema = z.object({
  title: z.string().min(2, "Название слишком короткое"),
  bpm: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Укажите корректный BPM"),
  musicKey: z.string().min(1, "Выберите тональность"),
  genreId: z.string().min(1, "Выберите жанр"),
  stemsUrl: z.string().url("Введите корректную ссылку").optional().or(z.literal("")),
  // Остальные поля (image, audio, wav) мы будем валидировать как объекты
});