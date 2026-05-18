import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных демонстрационным контентом...')

  // 1. Создаем Жанры
  console.log('🎹 Создаем жанры...')
  const trap = await prisma.genre.upsert({
    where: { slug: 'trap' },
    update: {},
    create: { name: 'Trap', slug: 'trap' }
  })
  
  const drill = await prisma.genre.upsert({
    where: { slug: 'drill' },
    update: {},
    create: { name: 'Drill', slug: 'drill' }
  })

  // 2. Создаем Продюсеров (Пользователей)
  console.log('👤 Создаем продюсеров...')
  const producer1 = await prisma.user.upsert({
    where: { email: '808mafia@beats.com' },
    update: { isTopProducer: true },
    create: {
      email: '808mafia@beats.com',
      username: '808mafia',
      displayName: '808 Mafia',
      role: Role.PRODUCER,
      verified: true,
      isTopProducer: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      biography: 'Legendary production team responsible for the modern trap sound.',
    }
  })

  const producer2 = await prisma.user.upsert({
    where: { email: 'metro@beats.com' },
    update: { isTopProducer: true },
    create: {
      email: 'metro@beats.com',
      username: 'metroboomin',
      displayName: 'Metro Boomin',
      role: Role.PRODUCER,
      verified: true,
      isTopProducer: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      biography: 'If Young Metro dont trust you im gon shoot you.',
    }
  })

// 3. Создаем Треки (Биты)
  console.log('🎵 Загружаем треки...')
  const track1 = await prisma.track.create({
    data: {
      title: 'CHROME HEART',
      bpm: 140,
      musicKey: 'A Minor',
      image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400',
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 165,
      featured: true,
      isSpotlight: true,
      tags: ['trap', 'dark', 'future'],
      producerId: producer1.id,
      genreId: trap.id
    }
  })

  const track2 = await prisma.track.create({
    data: {
      title: 'UK NOCTURNAL',
      bpm: 142,
      musicKey: 'E Minor',
      image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400',
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 190,
      featured: true,
      isSpotlight: false,
      tags: ['drill', 'uk', 'aggressive'],
      producerId: producer2.id,
      genreId: drill.id
    }
  })

  // 4. Создаем Глобальные Шаблоны Лицензий для Продюсеров
  console.log('📋 Создаем шаблоны лицензий...')
  const basicTemplateP1 = await prisma.licenseTemplate.create({
    data: {
      name: 'Basic Lease',
      slug: 'basic',
      defaultPrice: 29.99,
      fileType: 'MP3_TAGGED',
      producerId: producer1.id,
      distributionCopies: 5000,
      audioStreams: 10000
    }
  })

  const unlimitedTemplateP1 = await prisma.licenseTemplate.create({
    data: {
      name: 'Unlimited Lic',
      slug: 'unlimited',
      defaultPrice: 99.99,
      fileType: 'STEMS',
      producerId: producer1.id,
      distributionCopies: null, // Unlimited
      audioStreams: null       // Unlimited
    }
  })

  const basicTemplateP2 = await prisma.licenseTemplate.create({
    data: {
      name: 'Basic Lease',
      slug: 'basic',
      defaultPrice: 35.00,
      fileType: 'MP3_UNTAGGED',
      producerId: producer2.id,
      distributionCopies: 5000
    }
  })

  // 5. Привязываем конкретные Лицензии к трекам на основе шаблонов
  console.log('💰 Добавляем лицензии к трекам...')
  await prisma.license.createMany({
    data: [
      { price: 29.99, isActive: true, trackId: track1.id, templateId: basicTemplateP1.id },
      { price: 99.99, isActive: true, trackId: track1.id, templateId: unlimitedTemplateP1.id },
      { price: 35.00, isActive: true, trackId: track2.id, templateId: basicTemplateP2.id },
    ]
  })

  // 6. Создаем Сэмпл-паки (Sound Packs)
  console.log('📦 Добавляем саунд-паки...')
  await prisma.soundPack.create({
    data: {
      title: 'GENESIS DRUM KIT',
      price: 29.99,
      soundsCount: 142,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1511671782777-c97d3d27a1d4?q=80&w=400',
      producerId: producer1.id
    }
  })

  // 7. Создаем Кураторские Плейлисты
  console.log('📋 Формируем избранные коллекции плейлистов...')
  await prisma.playlist.create({
    data: {
      title: 'Dark & Moody',
      description: 'Heavy bass and nocturnal atmospheres for late-night sessions.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600',
      isFeatured: true,
      tracks: {
        connect: [{ id: track1.id }, { id: track2.id }]
      }
    }
  })

  console.log('🏁 База данных успешно наполнена контентом!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })