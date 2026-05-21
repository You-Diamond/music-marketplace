import { PrismaClient, Role, NotificationType, InquiryStatus, LicenseFileType, SubscriptionStatus, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
console.log('🧹 Очистка базы данных...');
  
  // Массив функций очистки для безопасного удаления
  const deleteOperations = [
    () => prisma.chatMessage.deleteMany(),
    () => prisma.dispute.deleteMany(),
    () => prisma.orderItem.deleteMany(),
    () => prisma.cartItem.deleteMany(),
    () => prisma.inquiryItem.deleteMany(),
    () => prisma.notification.deleteMany(),
    () => prisma.like.deleteMany(),
    () => prisma.follow.deleteMany(),
    () => prisma.order.deleteMany(),
    () => prisma.inquiry.deleteMany(),
    () => prisma.license.deleteMany(),
    () => prisma.licenseTemplate.deleteMany(),
    () => prisma.soundPack.deleteMany(),
    () => prisma.track.deleteMany(),
    () => prisma.playlist.deleteMany(),
    () => prisma.mood.deleteMany(),
    () => prisma.genre.deleteMany(),
    () => prisma.user.deleteMany(),
    () => prisma.subscriptionPlan.deleteMany(),
  ];

  // Безопасно чистим таблицы одну за другой
  for (const operation of deleteOperations) {
    try {
      await operation();
    } catch (error: any) {
      // Игнорируем ошибку, если таблицы просто ещё нет в БД (код P2021)
      if (error.code !== 'P2021') {
        console.warn(`⚠️ Предупреждение при очистке: ${error.message}`);
      }
    }
  }

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
      monthlyPrice: 990.0, // Перевели на рубли для рынка РФ
      yearlyPrice: 9900.0,
      popular: true,
      features: { maxTracks: 50, allowSpotlight: true, keepExclusives: true },
    },
    {
      title: 'ELITE_STUDIO',
      description: 'Безграничные возможности для профессионалов',
      monthlyPrice: 2490.0,
      yearlyPrice: 24900.0,
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
  // 2. ПОЛЬЗОВАТЕЛИ (User) — 30 записей
  // ==========================================
  console.log('👤 Создание пользователей...');
  const users = [];
  const subStatuses = [SubscriptionStatus.ACTIVE, SubscriptionStatus.INACTIVE, SubscriptionStatus.CANCELED];

  for (let i = 0; i < 30; i++) {
    let role: Role = Role.USER;
    if (i === 0) role = Role.USER;
    else if (i === 1) role = Role.PRODUCER;
    else if (i === 2) role = Role.ADMIN;
    else role = faker.helpers.arrayElement([Role.USER, Role.PRODUCER]);

    const isProducer = role === Role.PRODUCER;
    const randomPlan = faker.helpers.arrayElement(plans);
    const subStatus = isProducer ? faker.helpers.arrayElement(subStatuses) : SubscriptionStatus.INACTIVE;

    const mockPaymentDetails = isProducer 
      ? {
          card_number: faker.finance.creditCardNumber({ issuer: '2200############' }), // Мир СБП маска
          phone_linked: faker.phone.number({ style: 'international' }),
          bank_name: faker.helpers.arrayElement(['Т-Банк', 'Сбербанк', 'Альфа-Банк']),
        }
      : null;

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        username: `${faker.internet.username()}_${faker.number.int({ min: 10, max: 99 })}`,
        password: '$2b$10$EPf9kNG.S9vG8jI0.xM0AOVYmK0Kk8F5N9H3r2Ew1a2b3c4d5e6f',
        displayName: faker.person.fullName(),
        role: role,
        avatar: faker.image.avatar(), 
        biography: faker.lorem.paragraph(),
        location: faker.helpers.arrayElement(['Москва, Россия', 'Санкт-Петербург, Россия', 'Краснодар, Россия', 'Екатеринбург, Россия']),
        verified: faker.datatype.boolean(0.25),
        isTopProducer: isProducer ? faker.datatype.boolean(0.3) : false,
        telegram: faker.datatype.boolean(0.8) ? `@${faker.internet.username()}` : null,
        vkontakte: faker.datatype.boolean(0.5) ? `id${faker.number.int({ min: 100000, max: 999999 })}` : null,
        settings: { theme: 'dark', notifications: true },
        paymentDetails: mockPaymentDetails ? JSON.stringify(mockPaymentDetails) : null,
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
  // 3. ПОДПИСКИ / ФОЛОВЕРЫ (Follow) — 30 записей
  // ==========================================
  console.log('👥 Генерация подписок пользователей друг на друга...');
  for (let i = 0; i < 30; i++) {
    const follower = faker.helpers.arrayElement(users);
    const following = faker.helpers.arrayElement(producers);

    if (follower.id !== following.id) {
      const exists = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: follower.id, followingId: following.id } }
      });
      if (!exists) {
        await prisma.follow.create({ data: { followerId: follower.id, followingId: following.id } });
      }
    }
  }

  // ==========================================
  // 4. ЖАНРЫ (Genre) — 20 записей
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
  // 5. НАСТРОЕНИЯ (Mood) — 10 записей (Новая таблица)
  // ==========================================
  console.log('🎭 Создание настроений...');
  const moodNames = ['Агрессивный', 'Грустный', 'Энергичный', 'Темный', 'Меланхоличный', 'Веселый', 'Вдохновляющий', 'Чилл'];
  const moodSlugs = ['aggressive', 'sad', 'energetic', 'dark', 'melancholic', 'happy', 'inspiring', 'chill'];
  
  const moods = [];
  for (let i = 0; i < moodNames.length; i++) {
    const mood = await prisma.mood.create({
      data: {
        name: moodNames[i],
        slug: moodSlugs[i],
      }
    });
    moods.push(mood);
  }

  // ==========================================
  // 6. ШАБЛОНЫ ЛИЦЕНЗИЙ (LicenseTemplate) — 25 записей
  // ==========================================
  console.log('📜 Создание шаблонов лицензий...');
  const templates = [];
  const slugs = ['mp3', 'wav', 'stems', 'exclusive'];
  const fileTypes = [LicenseFileType.MP3_TAGGED, LicenseFileType.MP3_WAV, LicenseFileType.STEMS];

  for (let i = 0; i < 25; i++) {
    const randomProducer = faker.helpers.arrayElement(producers);
    const template = await prisma.licenseTemplate.create({
      data: {
        name: faker.helpers.arrayElement(['Standard MP3', 'Premium WAV', 'Unlimited Stems', 'Exclusive Rights']),
        slug: faker.helpers.arrayElement(slugs),
        defaultPrice: faker.number.int({ min: 1500, max: 25000 }), // В рублях
        fileType: faker.helpers.arrayElement(fileTypes),
        isDefaultActive: true,
        arbitrationCountry: 'Russia',
        governingLawCountry: 'Russia',
        termYears: faker.helpers.arrayElement([1, 3, 5, null]),
        distributionCopies: faker.helpers.arrayElement([1000, 5000, 10000, null]),
        audioStreams: faker.helpers.arrayElement([10000, 50000, 100000, null]),
        freeDownloads: faker.number.int({ min: 0, max: 100 }),
        radioBroadcastingRights: faker.datatype.boolean(0.3),
        livePerformancesForProfit: faker.datatype.boolean(0.4),
        producerId: randomProducer.id,
      },
    });
    templates.push(template);
  }

  // ==========================================
  // 7. ТРЕКИ (Track) — 30 записей
  // ==========================================
  console.log('🎹 Создание треков с привязкой к Moods...');
  const tracks = [];
  const musicalKeys = ['A Minor', 'C Major', 'G Minor', 'E Major', 'F# Minor', 'D Minor'];

  for (let i = 0; i < 30; i++) {
    const randomProducer = faker.helpers.arrayElement(producers);
    const randomGenre = faker.helpers.arrayElement(genres);
    const randomMoods = faker.helpers.arrayElements(moods, { min: 1, max: 3 });

    const hasWav = faker.datatype.boolean(0.8); 
    const hasStems = faker.datatype.boolean(0.6);

    const track = await prisma.track.create({
      data: {
        title: faker.music.songName(),
        bpm: faker.number.int({ min: 70, max: 160 }),
        musicKey: faker.helpers.arrayElement(musicalKeys),
        image: faker.image.url({ width: 500, height: 500 }),
        audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        wavUrl: hasWav ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' : null, 
        stemsUrl: hasStems ? `https://drive.google.com/drive/folders/${faker.string.alphanumeric(16)}` : null,
        duration: faker.number.int({ min: 120, max: 300 }),
        plays: faker.number.int({ min: 10, max: 10000 }),
        downloads: faker.number.int({ min: 0, max: 500 }),
        featured: faker.datatype.boolean(0.2),
        isSpotlight: faker.datatype.boolean(0.1),
        exclusiveAvailable: faker.datatype.boolean(0.8),
        isActive: true,
        tags: [faker.music.genre().toLowerCase(), 'typebeat', 'prodbyaura'],
        producerId: randomProducer.id,
        genreId: randomGenre.id,
        moods: {
          connect: randomMoods.map(m => ({ id: m.id }))
        }
      },
    });
    tracks.push(track);
  }

  // ==========================================
  // 8. КАСТОМНЫЕ ЛИЦЕНЗИИ ДЛЯ ТРЕКОВ (License) — 40 записей
  // ==========================================
  console.log('💳 Привязка лицензий к трекам...');
  const licenses = [];
  for (let i = 0; i < 40; i++) {
    const randomTrack = faker.helpers.arrayElement(tracks);
    const randomTemplate = faker.helpers.arrayElement(templates);

    const exists = await prisma.license.findUnique({
      where: { trackId_templateId: { trackId: randomTrack.id, templateId: randomTemplate.id } },
    });

    if (!exists) {
      const license = await prisma.license.create({
        data: {
          price: faker.number.float({ min: 1500, max: 15000, fractionDigits: 0 }),
          isActive: true,
          trackId: randomTrack.id,
          templateId: randomTemplate.id,
        },
      });
      licenses.push(license);
    }
  }

  // ==========================================
  // 9. ПЛЕЙЛИСТЫ (Playlist) — 20 записей
  // ==========================================
  console.log('📂 Создание плейлистов...');
  for (let i = 0; i < 20; i++) {
    const randomTracks = faker.helpers.arrayElements(tracks, { min: 3, max: 6 });
    const randomMoods = faker.helpers.arrayElements(moods, { min: 1, max: 2 });
    const randomProducer = faker.datatype.boolean(0.4) ? faker.helpers.arrayElement(producers) : null;

    await prisma.playlist.create({
      data: {
        title: `${faker.music.genre()} Vibes Vol. ${i + 1}`,
        description: faker.company.catchPhrase(),
        image: faker.image.url({ width: 500, height: 500 }),
        isFeatured: faker.datatype.boolean(0.2),
        isActive: true,
        type: faker.helpers.arrayElement(['featured', 'albums', 'moods']),
        producerId: randomProducer ? randomProducer.id : null,
        tracks: { connect: randomTracks.map((t) => ({ id: t.id })) },
        moods: { connect: randomMoods.map(m => ({ id: m.id })) }
      },
    });
  }

  // ==========================================
  // 10. СЭМПЛ-ПАКИ (SoundPack) — 20 записей
  // ==========================================
  console.log('🥁 Создание сэмпл-паков...');
  for (let i = 0; i < 20; i++) {
    const randomProducer = faker.helpers.arrayElement(producers);
    await prisma.soundPack.create({
      data: {
        title: `${faker.word.adjective()} ${faker.word.noun()} Drumkit`.toUpperCase(),
        price: faker.number.float({ min: 490, max: 3900, fractionDigits: 0 }),
        image: faker.image.url({ width: 500, height: 500 }),
        soundsCount: faker.number.int({ min: 50, max: 300 }),
        isFeatured: faker.datatype.boolean(0.2),
        isActive: true,
        producerId: randomProducer.id,
      },
    });
  }

  // ==========================================
  // 11. ЛАЙКИ (Like) — 30 записей
  // ==========================================
  console.log('❤️ Создание лайков...');
  for (let i = 0; i < 30; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomTrack = faker.helpers.arrayElement(tracks);

    const exists = await prisma.like.findUnique({
      where: { userId_trackId: { userId: randomUser.id, trackId: randomTrack.id } },
    });

    if (!exists) {
      await prisma.like.create({ data: { userId: randomUser.id, trackId: randomTrack.id } });
    }
  }

  // ==========================================
  // 12. КОРЗИНА (CartItem) — 20 записей
  // ==========================================
  console.log('🛒 Заполнение корзин пользователей...');
  for (let i = 0; i < 20; i++) {
    const randomBuyer = faker.helpers.arrayElement(buyers);
    const randomTrack = faker.helpers.arrayElement(tracks);
    const trackLicense = licenses.find((l) => l.trackId === randomTrack.id);

    if (trackLicense) {
      const exists = await prisma.cartItem.findUnique({
        where: { userId_trackId: { userId: randomBuyer.id, trackId: randomTrack.id } }
      });

      if (!exists) {
        await prisma.cartItem.create({
          data: {
            userId: randomBuyer.id,
            trackId: randomTrack.id,
            licenseId: trackLicense.id,
          }
        });
      }
    }
  }

  // ==========================================
  // 13. ПРЯМЫЕ ЗАКАЗЫ И ЧАТЫ (Order, OrderItem, ChatMessage) — 20 записей
  // ==========================================
  console.log('📦 Создание P2P заказов и системных чатов...');
  const orderStatuses = [OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_SUBMITTED, OrderStatus.PAID, OrderStatus.COMPLETED];

  for (let i = 0; i < 20; i++) {
    const buyer = faker.helpers.arrayElement(buyers);
    const producer = faker.helpers.arrayElement(producers);
    const randomTrack = faker.helpers.arrayElement(tracks);
    const trackLicense = licenses.find((l) => l.trackId === randomTrack.id);

    if (trackLicense) {
      const status = faker.helpers.arrayElement(orderStatuses);
      
      const order = await prisma.order.create({
        data: {
          buyerId: buyer.id,
          sellerId: producer.id,
          status: status,
          paymentProof: status !== OrderStatus.PENDING_PAYMENT ? faker.image.url({ width: 400, height: 600 }) : null,
        }
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          trackId: randomTrack.id,
          licenseId: trackLicense.id
        }
      });

      // Генерируем тестовую историю сообщений в чате сделки
      await prisma.chatMessage.create({
        data: {
          orderId: order.id,
          senderId: buyer.id,
          text: 'Привет! Перевёл деньги по СБП, прикрепил чек.',
        }
      });

      if (status === OrderStatus.PAID || status === OrderStatus.COMPLETED) {
        await prisma.chatMessage.create({
          data: {
            orderId: order.id,
            senderId: producer.id,
            text: 'Привет! Оплату получил, подтвердил заказ. Ссылки на WAV и дорожки доступны!',
          }
        });
      }
    }
  }

  // ==========================================
  // 14. СИСТЕМНЫЕ УВЕДОМЛЕНИЯ (Notification) — 25 записей
  // ==========================================
  console.log('🔔 Создание системных уведомлений...');
  const notificationTypes = [NotificationType.LIKE, NotificationType.INQUIRY_RECEIVED, NotificationType.INQUIRY_UPDATED, NotificationType.SYSTEM];

  for (let i = 0; i < 25; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement(notificationTypes);

    await prisma.notification.create({
      data: {
        type: type,
        title: faker.helpers.arrayElement([
          'Новая оплата по вашему треку!', 
          'Покупатель прикрепил чек к заказу', 
          'Статус вашего заказа обновлен на PAID', 
          'На вас подписался новый артист'
        ]),
        description: faker.lorem.sentence(),
        read: faker.datatype.boolean(0.4),
        userId: randomUser.id,
      },
    });
  }

  console.log('✅ База данных успешно синхронизирована и заполнена тестовыми данными!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при генерации сидов:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });