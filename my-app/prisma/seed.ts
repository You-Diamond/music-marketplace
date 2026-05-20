import { PrismaClient, Role, NotificationType, InquiryStatus, LicenseFileType, SubscriptionStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Очистка базы данных...');
  
  // Удаляем в правильном порядке из-за внешних ключей
  await prisma.notification.deleteMany();
  await prisma.inquiryItem.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.like.deleteMany();
  await prisma.license.deleteMany();
  await prisma.licenseTemplate.deleteMany();
  await prisma.soundPack.deleteMany();
  
  await prisma.track.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscriptionPlan.deleteMany();

  console.log('🌱 Наполнение базы данных началось...');

  // ==========================================
  // 1. ТАРИФНЫЕ ПЛАНЫ (SubscriptionPlan)
  // ==========================================
  console.log('📦 Создание тарифных планов...');
  const plansData = [
    {
      title: 'FREE',
      description: 'Базовый аккаунт для старта',
      monthlyPrice: 0.0,
      yearlyPrice: 0.0,
      popular: false,
      features: { maxTracks: 5, allowSpotlight: false, keepExclusives: false },
    },
    {
      title: 'PRO_CREATOR',
      description: 'Идеально для активных битмейкеров',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      popular: true,
      features: { maxTracks: 50, allowSpotlight: true, keepExclusives: true },
    },
    {
      title: 'ELITE_STUDIO',
      description: 'Безграничные возможности для профессионалов',
      monthlyPrice: 24.99,
      yearlyPrice: 249.99,
      popular: false,
      features: { maxTracks: 999, allowSpotlight: true, keepExclusives: true },
    },
  ];

  const plans = [];
  for (const plan of plansData) {
    const createdPlan = await prisma.subscriptionPlan.create({ data: plan });
    plans.push(createdPlan);
  }

  // ==========================================
  // 2. ПОЛЬЗОВАТЕЛИ (User) — 25 записей
  // ==========================================
  console.log('👤 Создание пользователей...');
  const users = [];
  const subStatuses = [SubscriptionStatus.ACTIVE, SubscriptionStatus.INACTIVE, SubscriptionStatus.CANCELED];

  for (let i = 0; i < 25; i++) {
    let role: Role = Role.USER;
    if (i === 0) role = Role.USER;
    else if (i === 1) role = Role.PRODUCER;
    else if (i === 2) role = Role.ADMIN;
    else role = faker.helpers.arrayElement([Role.USER, Role.PRODUCER]);

    const isProducer = role === Role.PRODUCER;
    const randomPlan = faker.helpers.arrayElement(plans);
    const subStatus = isProducer ? faker.helpers.arrayElement(subStatuses) : SubscriptionStatus.INACTIVE;

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        username: `${faker.internet.username()}_${faker.number.int({ min: 10, max: 99 })}`,
        password: '$2b$10$EPf9kNG.S9vG8jI0.xM0AOVYmK0Kk8F5N9H3r2Ew1a2b3c4d5e6f',
        displayName: faker.person.fullName(),
        role: role,
        avatar: faker.image.avatar(), 
        biography: faker.lorem.paragraph(),
        location: `${faker.location.city()}, ${faker.location.country()}`,
        verified: faker.datatype.boolean(0.2),
        isTopProducer: isProducer ? faker.datatype.boolean(0.3) : false,
        telegram: faker.datatype.boolean(0.7) ? `@${faker.internet.username()}` : null,
        instagram: faker.datatype.boolean(0.5) ? `@${faker.internet.username()}` : null,
        vkontakte: faker.datatype.boolean(0.4) ? `id${faker.number.int({ min: 100000, max: 999999 })}` : null,
        website: faker.datatype.boolean(0.2) ? faker.internet.url() : null,
        followersCount: faker.number.int({ min: 0, max: 5000 }),
        totalPlays: faker.number.int({ min: 0, max: 100000 }),
        settings: { theme: 'dark', notifications: true },
        subscriptionId: isProducer && subStatus !== SubscriptionStatus.INACTIVE ? randomPlan.id : null,
        subscriptionStatus: subStatus,
        subscriptionExpiresAt: subStatus === SubscriptionStatus.ACTIVE ? faker.date.future() : null,
        paymentCustomerId: isProducer ? `cus_${faker.string.alphanumeric(14)}` : null,
        paymentSubscriptionId: isProducer && subStatus === SubscriptionStatus.ACTIVE ? `sub_${faker.string.alphanumeric(14)}` : null,
      },
    });
    users.push(user);
  }

  const producers = users.filter((u) => u.role === Role.PRODUCER);
  const buyers = users.filter((u) => u.role === Role.USER);

  // ==========================================
  // 3. ЖАНРЫ (Genre) — 20 записей
  // ==========================================
  console.log('🎵 Создание жанров...');
  const genreNames = [
    'Boom Bap', 'Trap', 'Drill', 'R&B', 'Pop', 'Synthwave', 'Cyberpunk', 'Lo-Fi', 
    'Reggaeton', 'Afrobeats', 'Hyperpop', 'Cloud Rap', 'G-Funk', 'Phonk', 'Grime', 
    'Detroit', 'UK Garage', 'Indie Rock', 'Melodic Trap', 'Emo Rap'
  ];
  
  const genres = [];
  for (const name of genreNames) {
    const genre = await prisma.genre.create({
      data: {
        name: name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        isActive: true,
      },
    });
    genres.push(genre);
  }

  // ==========================================
  // 4. ШАБЛОНЫ ЛИЦЕНЗИЙ (LicenseTemplate) — 20 записей
  // ==========================================
  console.log('📜 Создание шаблонов лицензий...');
  const templates = [];
  const slugs = ['mp3', 'wav', 'stems', 'exclusive'];
  const fileTypes = [LicenseFileType.MP3_TAGGED, LicenseFileType.MP3_UNTAGGED, LicenseFileType.MP3_WAV, LicenseFileType.STEMS];

  for (let i = 0; i < 20; i++) {
    const randomProducer = faker.helpers.arrayElement(producers);
    const template = await prisma.licenseTemplate.create({
      data: {
        name: faker.helpers.arrayElement(['Standard MP3', 'Premium WAV', 'Unlimited Stems', 'Exclusive Rights']),
        slug: faker.helpers.arrayElement(slugs),
        defaultPrice: faker.number.int({ min: 20, max: 500 }),
        fileType: faker.helpers.arrayElement(fileTypes),
        isDefaultActive: true,
        arbitrationCountry: 'Russia',
        governingLawCountry: 'Russia',
        termYears: faker.helpers.arrayElement([1, 3, 5, null]),
        distributionCopies: faker.helpers.arrayElement([1000, 5000, 10000, null]),
        audioStreams: faker.helpers.arrayElement([10000, 50000, 100000, null]),
        freeDownloads: faker.number.int({ min: 0, max: 100 }),
        musicVideosMonetized: faker.number.int({ min: 0, max: 5 }),
        musicVideosNonMonetized: faker.number.int({ min: 0, max: 10 }),
        videoStreamsMonetized: faker.number.int({ min: 10000, max: 50000 }),
        videoStreamsNonMonetized: faker.number.int({ min: 50000, max: 200000 }),
        radioBroadcastingRights: faker.datatype.boolean(0.3),
        radioStations: faker.number.int({ min: 0, max: 3 }),
        livePerformancesForProfit: faker.datatype.boolean(0.4),
        livePerformancesNonProfit: faker.number.int({ min: 0, max: 50 }),
        producerId: randomProducer.id,
      },
    });
    templates.push(template);
  }

  // ==========================================
  // 5. ТРЕКИ (Track) — 25 записей
  // ==========================================
  console.log('🎹 Создание треков...');
  const tracks = [];
  const musicalKeys = ['A Minor', 'C Major', 'G Minor', 'E Major', 'F# Minor', 'D Minor'];

  for (let i = 0; i < 25; i++) {
    const randomProducer = faker.helpers.arrayElement(producers);
    const randomGenre = faker.helpers.arrayElement(genres);

    const track = await prisma.track.create({
      data: {
        title: faker.music.songName(),
        bpm: faker.number.int({ min: 70, max: 160 }),
        musicKey: faker.helpers.arrayElement(musicalKeys),
        // ИСПРАВЛЕНО: Новый формат генерации изображений без депрекаций
        image: faker.image.url({ width: 500, height: 500 }),
        audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: faker.number.int({ min: 120, max: 300 }),
        plays: faker.number.int({ min: 10, max: 10000 }),
        downloads: faker.number.int({ min: 0, max: 500 }),
        featured: faker.datatype.boolean(0.2),
        isSpotlight: faker.datatype.boolean(0.1),
        exclusiveAvailable: faker.datatype.boolean(0.8),
        isActive: true,
        tags: [faker.music.genre().toLowerCase(), 'typebeat', 'hard'],
        producerId: randomProducer.id,
        genreId: randomGenre.id,
      },
    });
    tracks.push(track);
  }

  // ==========================================
  // 6. КАСТОМНЫЕ ЛИЦЕНЗИИ ДЛЯ ТРЕКОВ (License) — 25 записей
  // ==========================================
  console.log('💳 Привязка лицензий к трекам...');
  const licenses = [];
  for (let i = 0; i < 25; i++) {
    const randomTrack = faker.helpers.arrayElement(tracks);
    const randomTemplate = faker.helpers.arrayElement(templates);

    const exists = await prisma.license.findUnique({
      where: {
        trackId_templateId: {
          trackId: randomTrack.id,
          templateId: randomTemplate.id,
        },
      },
    });

    if (!exists) {
      const license = await prisma.license.create({
        data: {
          price: faker.number.float({ min: 19.99, max: 299.99, fractionDigits: 2 }),
          isActive: true,
          trackId: randomTrack.id,
          templateId: randomTemplate.id,
        },
      });
      licenses.push(license);
    }
  }

  // ==========================================
  // 7. ПЛЕЙЛИСТЫ (Playlist) — 20 записей
  // ==========================================
  console.log('📂 Создание плейлистов...');
  for (let i = 0; i < 20; i++) {
    const randomTracks = faker.helpers.arrayElements(tracks, { min: 3, max: 6 });

    await prisma.playlist.create({
      data: {
        title: `${faker.music.genre()} Vibes Vol. ${i + 1}`,
        description: faker.company.catchPhrase(),
        // ИСПРАВЛЕНО: приведен к новому стандарту
        image: faker.image.url({ width: 500, height: 500 }),
        isFeatured: faker.datatype.boolean(0.2),
        isActive: true,
        tracks: {
          connect: randomTracks.map((t) => ({ id: t.id })),
        },
      },
    });
  }

  // ==========================================
  // 8. СЭМПЛ-ПАКИ (SoundPack) — 20 записей
  // ==========================================
  console.log('🥁 Создание сэмпл-паков...');
  for (let i = 0; i < 20; i++) {
    const randomProducer = faker.helpers.arrayElement(producers);
    await prisma.soundPack.create({
      data: {
        title: `${faker.word.adjective()} ${faker.word.noun()} Drumkit`.toUpperCase(),
        price: faker.number.float({ min: 9.99, max: 49.99, fractionDigits: 2 }),
        // ИСПРАВЛЕНО: приведен к новому стандарту
        image: faker.image.url({ width: 500, height: 500 }),
        soundsCount: faker.number.int({ min: 50, max: 300 }),
        isFeatured: faker.datatype.boolean(0.2),
        isActive: true,
        producerId: randomProducer.id,
      },
    });
  }

  // ==========================================
  // 9. ЛАЙКИ (Like) — 25 записей
  // ==========================================
  console.log('❤️ Создание лайков...');
  for (let i = 0; i < 25; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomTrack = faker.helpers.arrayElement(tracks);

    const exists = await prisma.like.findUnique({
      where: {
        userId_trackId: {
          userId: randomUser.id,
          trackId: randomTrack.id,
        },
      },
    });

    if (!exists) {
      await prisma.like.create({
        data: {
          userId: randomUser.id,
          trackId: randomTrack.id,
        },
      });
    }
  }

  // ==========================================
  // 10. ЗАПРОСЫ НА ПОКУПКУ И ЦРМ (Inquiry & InquiryItem) — 20 записей
  // ==========================================
  console.log('💼 Создание CRM запросов...');
  const inquiryStatuses = [InquiryStatus.PENDING, InquiryStatus.CONTACTED, InquiryStatus.COMPLETED, InquiryStatus.DECLINED, InquiryStatus.ARCHIVED];

  for (let i = 0; i < 20; i++) {
    const buyer = faker.helpers.arrayElement(buyers) || users[0];
    const producer = faker.helpers.arrayElement(producers) || users[1];
    
    const producerTracks = tracks.filter((t) => t.producerId === producer.id);
    const checkoutTracks = producerTracks.length > 0 ? producerTracks : faker.helpers.arrayElements(tracks, { min: 1, max: 2 });
    
    const inquiry = await prisma.inquiry.create({
      data: {
        status: faker.helpers.arrayElement(inquiryStatuses),
        message: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : null,
        buyerContact: `@${faker.internet.username()}`,
        buyerId: buyer.id,
        producerId: producer.id,
      },
    });

    for (const track of checkoutTracks) {
      const trackLicense = licenses.find((l) => l.trackId === track.id);

      await prisma.inquiryItem.create({
        data: {
          priceAtInquiry: faker.number.float({ min: 25, max: 150, fractionDigits: 2 }),
          inquiryId: inquiry.id,
          trackId: track.id,
          licenseId: trackLicense ? trackLicense.id : null,
        },
      });
    }
  }

  // ==========================================
  // 11. УВЕДОМЛЕНИЯ (Notification) — 20 записей
  // ==========================================
  console.log('🔔 Создание системных уведомлений...');
  const notificationTypes = [
    NotificationType.LIKE, 
    NotificationType.INQUIRY_RECEIVED, 
    NotificationType.INQUIRY_UPDATED, 
    NotificationType.FOLLOW, 
    NotificationType.PLAYLIST, 
    NotificationType.SYSTEM
  ];

  for (let i = 0; i < 20; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement(notificationTypes);

    await prisma.notification.create({
      data: {
        type: type,
        title: faker.helpers.arrayElement([
          'Новый лайк на ваш трек!', 
          'Получен новый запрос на покупку', 
          'Статус вашего заказа обновлен', 
          'На вас подписался новый артист', 
          'Ваш трек добавлен в плейлист дня!'
        ]),
        description: faker.lorem.sentence(),
        read: faker.datatype.boolean(0.4),
        userId: randomUser.id,
      },
    });
  }

  console.log('✅ База данных успешно заполнена тестовыми данными!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при генерации сидов:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });