import { z } from "zod"

// Схема регистрации (только самые нужные поля)
export const registerSchema = z.object({
  email: z.string().email("Некорректный формат Email"),
  username: z
    .string()
    .min(3, "Имя пользователя должно быть не менее 3 символов")
    .max(20, "Имя пользователя должно быть не более 20 символов")
    .regex(/^[a-zA-Z0-9_]+$/, "Имя пользователя может содержать только буквы, цифры и нижнее подчеркивание"),
  password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

// Схема входа (принимает ИЛИ email, ИЛИ username в одно поле "identifier")
export const loginSchema = z.object({
  identifier: z.string().min(3, "Введите Email или Имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
})