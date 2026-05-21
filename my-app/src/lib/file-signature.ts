/**
 * Читает заголовок файла (Magic Bytes) и проверяет его реальный формат.
 */
export async function verifyAudioMagicBytes(
  file: File,
  expectedType: "mp3" | "wav"
): Promise<boolean> {
  // Нам достаточно первых 12 байт для определения аудиоформатов
  const buffer = await file.slice(0, 12).arrayBuffer()
  const view = new DataView(buffer)

  if (expectedType === "wav") {
    if (buffer.byteLength < 12) return false

    // Проверяем байты 0-3 на наличие ASCII "RIFF" (hex: 52 49 46 46)
    const isRiff =
      view.getUint8(0) === 0x52 &&
      view.getUint8(1) === 0x49 &&
      view.getUint8(2) === 0x46 &&
      view.getUint8(3) === 0x46

    // Проверяем байты 8-11 на наличие ASCII "WAVE" (hex: 57 41 56 45)
    const isWave =
      view.getUint8(8) === 0x57 &&
      view.getUint8(9) === 0x41 &&
      view.getUint8(10) === 0x56 &&
      view.getUint8(11) === 0x45

    return isRiff && isWave
  }

  if (expectedType === "mp3") {
    if (buffer.byteLength < 3) return false

    // MP3 часто начинается с метаданных ID3 (hex: 49 44 33)
    const isID3 =
      view.getUint8(0) === 0x49 &&
      view.getUint8(1) === 0x44 &&
      view.getUint8(2) === 0x33

    // Если ID3 нет, MP3 начинается с аудиофрейма (Sync word), обычно это FF FB, FF FA и т.д.
    const isSyncWord =
      view.getUint8(0) === 0xff && (view.getUint8(1) & 0xe0) === 0xe0

    return isID3 || isSyncWord
  }

  return false
}