import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_BUTTON_LABELS, serializeButtonLabels } from "../src/lib/button-labels";
import { DEFAULT_SPACING } from "../src/lib/section-spacing";
import { DEFAULT_PRICING_PLANS, DEFAULT_PRICING_SECTION } from "../src/lib/pricing-defaults";

const prisma = new PrismaClient();

const IMAGES = {
  hero: "/images/hero.svg",
  projects: [
    "/images/project-1.svg",
    "/images/project-2.svg",
    "/images/project-3.svg",
    "/images/project-4.svg",
    "/images/project-5.svg",
    "/images/project-6.svg",
  ],
  cases: ["/images/case-1.svg", "/images/case-2.svg", "/images/case-3.svg"],
};

const SELLING_SETTINGS = {
  brandName: "REDLINE",
  brandHighlightText: "RED",
  brandHighlightColor: "#ef4444",
  logoMode: "image",
  logoImageUrl: "/images/qnox-logo.png",
  heroTitle: "Сайты и приложения,",
  heroHighlight: "которые приносят заявки и продажи",
  heroSubtitle:
    "Проектируем под вашу воронку: от первого экрана до формы заявки. Фиксируем сроки и бюджет в договоре — без скрытых доплат.",
  heroMeta: "Ответим в течение 2 часов · Без обязательств · NDA по запросу",
  heroBenefit1: "Рост заявок и продаж",
  heroBenefit2: "Сроки и бюджет в договоре",
  heroBenefit3: "Поддержка после запуска",
  heroVideoUrl: "/video/hero-dark.mp4",
  heroVideoUrlLight: "/video/hero-light.mp4",
  statValue: "70+",
  statText: "запущенных проектов для бизнеса, стартапов и e-commerce за 5 лет",
  footerCopyright: "© 2026 REDLINE. Все права защищены.",
  footerDescriptor: "Студия цифровых продуктов: SaaS, AI и веб-платформы.",
  footerBehanceUrl: "https://www.behance.net",
  footerGithubUrl: "https://github.com",
  phones: JSON.stringify(["+7 (999) 123-45-67"]),
  emails: JSON.stringify(["hello@redline.studio"]),
  addresses: JSON.stringify(["Москва, работаем по всей России и СНГ"]),
  socialLinks: JSON.stringify([]),
};

async function syncImageUrls() {
  const projects = await prisma.project.findMany({ orderBy: { sortOrder: "asc" } });
  for (let i = 0; i < projects.length; i++) {
    const url = IMAGES.projects[i % IMAGES.projects.length];
    if (projects[i].imageUrl !== url) {
      await prisma.project.update({ where: { id: projects[i].id }, data: { imageUrl: url } });
    }
  }

  const cases = await prisma.caseStudy.findMany({ orderBy: { sortOrder: "asc" } });
  for (let i = 0; i < cases.length; i++) {
    const url = IMAGES.cases[i % IMAGES.cases.length];
    if (cases[i].imageUrl !== url) {
      await prisma.caseStudy.update({ where: { id: cases[i].id }, data: { imageUrl: url } });
    }
  }

  await prisma.heroFeature.updateMany({
    where: { variant: "image" },
    data: { imageUrl: IMAGES.hero },
  });
}

async function syncSellingContent() {
  const projects = [
    {
      title: "FinTech Dashboard",
      description:
        "Панель для инвесторов и менеджеров: сократили время обработки заявки на 40%, внедрили онбординг за 2 клика.",
      cardTitle: "FinTech Dashboard",
      cardDescription: "Панель для инвесторов и менеджеров с онбордингом за 2 клика.",
      cardResultText: "−40% время обработки заявки",
      body: `Клиент: финтех-стартап.\n\nЗадача: единая панель для заявок, KYC и отчётности с ролями и аудитом.\n\nРешение: дизайн-система под тёмную тему, быстрые фильтры, сохранённые представления, экспорт в Excel.\n\nРезультат: среднее время обработки заявки снизилось на 40%, NPS интерфейса 8.4 из 10.`,
      gallery: JSON.stringify(["/images/project-1.svg", "/images/project-2.svg"]),
      link: "#contact",
      sortOrder: 0,
    },
    {
      title: "E-commerce Redesign",
      description:
        "Редизайн магазина с упором на корзину и оплату: конверсия в заказ выросла на 34%, средний чек +12%.",
      cardTitle: "E-commerce Redesign",
      cardDescription: "Редизайн магазина с упором на корзину и оплату.",
      cardResultText: "+34% к конверсии в заказ\n+12% к среднему чеку",
      body: `Сегмент: fashion e-commerce.\n\nПроблема: высокий отказ на чекауте и слабая мобильная воронка.\n\nЧто сделали: упростили шаги оплаты, добавили доверительные блоки, переработали карточку товара и рекомендации.\n\nИтог: +34% к конверсии в заказ, +12% к среднему чеку за 60 дней после релиза.`,
      gallery: JSON.stringify(["/images/project-2.svg", "/images/project-3.svg"]),
      link: "#contact",
      sortOrder: 1,
    },
    {
      title: "Medical Portal",
      description:
        "Онлайн-запись и личный кабинет пациента: −60% звонков в регистратуру, запись за 90 секунд с телефона.",
      cardTitle: "Medical Portal",
      cardDescription: "Онлайн-запись и личный кабинет пациента с телефона.",
      cardResultText: "−60% звонков в регистратуру\nЗапись за 90 секунд",
      body: `Задача: снизить нагрузку на регистратуру и дать пациентам самообслуживание 24/7.\n\nРеализация: расписание врачей, напоминания, оплата онлайн, история визитов, интеграция с МИС.\n\nЭффект: −60% входящих звонков, запись со смартфона за 90 секунд.`,
      gallery: JSON.stringify(["/images/project-3.svg"]),
      link: "#contact",
      sortOrder: 2,
    },
    {
      title: "Real Estate Platform",
      description:
        "Каталог с картой и умными фильтрами: в 2 раза больше целевых заявок с сайта за первый квартал.",
      cardTitle: "Real Estate Platform",
      cardDescription: "Каталог с картой и умными фильтрами для подбора объектов.",
      cardResultText: "×2 целевых заявок с сайта за первый квартал",
      body: `Продукт: каталог недвижимости с картой и подбором по параметрам.\n\nФокус: скорость поиска, сохранённые подборки, лиды в CRM, SEO под регионы.\n\nРезультат: в 2 раза больше целевых заявок с сайта за первый квартал.`,
      gallery: JSON.stringify(["/images/project-4.svg", "/images/project-5.svg"]),
      link: "#contact",
      sortOrder: 3,
    },
    {
      title: "EdTech LMS",
      description:
        "Платформа обучения с подписками: удержание студентов +22%, автоматизация проверки домашних заданий.",
      cardTitle: "EdTech LMS",
      cardDescription: "Платформа обучения с подписками и автоматизацией проверки ДЗ.",
      cardResultText: "+22% удержание студентов\n−15 ч/нед на ручной проверке",
      body: `Платформа: LMS с подписками, уроками и проверкой ДЗ.\n\nДополнительно: геймификация, прогресс-бар, уведомления, админка курсов.\n\nМетрики: удержание +22%, экономия 15 часов в неделю на ручной проверке.`,
      gallery: JSON.stringify(["/images/project-5.svg"]),
      link: "#contact",
      sortOrder: 4,
    },
    {
      title: "Corporate B2B Site",
      description:
        "Корпоративный сайт под лиды: 3× рост заявок на коммерческое предложение после запуска новой структуры.",
      cardTitle: "Corporate B2B Site",
      cardDescription: "Корпоративный сайт под лиды с отраслевыми лендингами и калькулятором.",
      cardResultText: "×3 заявок на КП за первые 8 недель",
      body: `B2B: услуги для предприятий.\n\nПерестроили структуру под лиды: отраслевые лендинги, калькулятор внедрения, кейсы с цифрами, быстрый контакт.\n\nРезультат: в 3 раза больше заявок на КП в первые 8 недель.`,
      gallery: JSON.stringify(["/images/project-6.svg", "/images/project-1.svg"]),
      link: "#contact",
      sortOrder: 5,
    },
  ];

  for (const data of projects) {
    const row = await prisma.project.findFirst({ where: { sortOrder: data.sortOrder } });
    if (row) {
      await prisma.project.update({
        where: { id: row.id },
        data: {
          title: data.title,
          description: data.description,
          body: data.body,
          gallery: data.gallery,
          link: data.link,
        },
      });
    }
  }

  const cases = [
    {
      tag: "E-commerce",
      title: "Маркетплейс запчастей",
      description:
        "Запустили витрину, кабинет продавца и модерацию за 3 месяца. После старта — в 2 раза больше заявок с органики и рекламы.",
      link: "#contact",
      sortOrder: 0,
      landingHeroMeta: "3 месяца · B2B · Маркетплейс",
      landingMetrics: JSON.stringify(["Запуск за 3 мес.", "×2 заявки с сайта"]),
      challengeTitle: "Задача клиента",
      challengeText:
        "Нужно было быстро выйти на рынок с витриной для продавцов и покупателей, не теряя качество модерации и SEO. Старый сайт не тянул каталог и заявки шли только через менеджеров.",
      solutionTitle: "Наше решение",
      solutionText:
        "Спроектировали воронку от каталога до заявки, кабинет продавца с модерацией карточек, фильтры по VIN и совместимости, интеграцию с CRM и аналитику по источникам лидов.",
      scopeTitle: "Что сделали",
      scopeItems: JSON.stringify([
        "Прототип и UI под конверсию в заявку",
        "Каталог, фильтры и карточка товара",
        "Кабинет продавца и модерация",
        "SEO-структура и микроразметка",
        "Интеграция заявок в CRM",
      ]),
      storyTitle: "О проекте",
      body:
        "За 12 недель прошли путь от брифа до релиза: согласовали структуру, запустили MVP с ключевыми сценариями и доработали по метрикам первого месяца. Через 90 дней после запуска органический трафик вырос на 48%, а заявки с сайта — в 2 раза.",
      gallery: JSON.stringify(["/images/case-1.svg", "/images/project-1.svg"]),
      testimonialQuote: "Команда REDLINE взяла на себя продукт целиком — от прототипа до релиза. Мы наконец получили канал заявок, который работает без менеджера на каждом шаге.",
      testimonialAuthor: "Алексей К.",
      testimonialRole: "CEO, маркетплейс запчастей",
      ctaTitle: "Нужен маркетплейс или каталог под вашу нишу?",
      ctaSubtitle: "Разберём задачу, предложим архитектуру и оценку сроков за 24 часа.",
    },
    {
      tag: "SaaS",
      title: "HR-платформа с подпиской",
      description:
        "MVP с онбордингом и оплатой: 1200+ активных компаний за полгода, unit-экономика сошлась к 4-му месяцу.",
      link: "#contact",
      sortOrder: 1,
      landingHeroMeta: "6 месяцев · SaaS · Подписка",
      landingMetrics: JSON.stringify(["1200+ компаний", "MRR с 4-го месяца"]),
      challengeTitle: "Задача клиента",
      challengeText:
        "Стартапу нужен был MVP с подпиской, онбордингом команд и оплатой — без долгой разработки «навсегда». Важно было проверить гипотезу и выйти на предсказуемый MRR.",
      solutionTitle: "Наше решение",
      solutionText:
        "Собрали продуктовый MVP: регистрация компании, тарифы, биллинг, роли сотрудников, дашборд HR-метрик. Заложили масштабирование API и админку для поддержки.",
      scopeTitle: "Что сделали",
      scopeItems: JSON.stringify([
        "Онбординг и активация пользователя",
        "Тарифы и оплата подписки",
        "Личный кабинет компании",
        "HR-дашборд и отчёты",
        "Админка поддержки",
      ]),
      storyTitle: "О проекте",
      body:
        "Запустили первую версию за 6 месяцев с фокусом на активацию: сократили путь до первой оплаты до 3 шагов. К 4-му месяцу unit-экономика сошлась, к 6-му — более 1200 активных компаний на платформе.",
      gallery: JSON.stringify(["/images/case-2.svg", "/images/project-2.svg"]),
      testimonialQuote: "REDLINE помогли не просто «сверстать SaaS», а выстроить продукт вокруг метрик активации и удержания.",
      testimonialAuthor: "Мария С.",
      testimonialRole: "Product lead, HR-tech",
      ctaTitle: "Запускаете SaaS или личный кабинет?",
      ctaSubtitle: "Поможем собрать MVP и выйти на первых платящих клиентов.",
    },
    {
      tag: "Mobile",
      title: "Приложение доставки",
      description:
        "iOS/Android и админка: среднее время доставки −18%, повторные заказы +25% за счёт трекинга и пушей.",
      link: "#contact",
      sortOrder: 2,
      landingHeroMeta: "4 месяца · iOS/Android · Логистика",
      landingMetrics: JSON.stringify(["−18% время доставки", "+25% повторных заказов"]),
      challengeTitle: "Задача клиента",
      challengeText:
        "Сервис доставки терял клиентов из-за непрозрачного статуса заказа и долгой поддержки. Нужны были приложения для клиента и курьера плюс админка для диспетчеров.",
      solutionTitle: "Наше решение",
      solutionText:
        "Разработали клиентское приложение с трекингом и пушами, приложение курьера с маршрутами, админ-панель диспетчера и интеграцию с существующей CRM.",
      scopeTitle: "Что сделали",
      scopeItems: JSON.stringify([
        "iOS и Android для клиента",
        "Приложение курьера",
        "Трекинг и push-уведомления",
        "Админка диспетчера",
        "Интеграция с CRM",
      ]),
      storyTitle: "О проекте",
      body:
        "После релиза среднее время доставки сократилось на 18%, а доля повторных заказов выросла на 25% за счёт прозрачного трекинга и напоминаний. Поддержка разгрузилась — 40% обращений ушло в self-service.",
      gallery: JSON.stringify(["/images/case-3.svg", "/images/project-3.svg"]),
      testimonialQuote: "Приложения работают стабильно, команда поддержки наконец видит всю картину по заказам в одном окне.",
      testimonialAuthor: "Дмитрий Л.",
      testimonialRole: "Операционный директор, доставка",
      ctaTitle: "Нужно мобильное приложение под ваш сервис?",
      ctaSubtitle: "Оценим MVP, стек и сроки — ответ в течение рабочего дня.",
    },
  ];

  for (const data of cases) {
    const row = await prisma.caseStudy.findFirst({ where: { sortOrder: data.sortOrder } });
    if (row) {
      await prisma.caseStudy.update({
        where: { id: row.id },
        data,
      });
    }
  }

  const services = [
    {
      icon: "layout",
      title: "Продающий веб-дизайн",
      description: "Прототипы и UI под конверсию: от Wireframe до готовых макетов в Figma.",
      sortOrder: 0,
    },
    {
      icon: "code",
      title: "Разработка под ключ",
      description: "Next.js, интеграции, CRM и оплата — быстрый сайт, который индексируется и грузится.",
      sortOrder: 1,
    },
    {
      icon: "server",
      title: "Backend и интеграции",
      description: "API, личные кабинеты, 1С, платёжные системы — надёжная архитектура под рост.",
      sortOrder: 2,
    },
    {
      icon: "smartphone",
      title: "Мобильные приложения",
      description: "React Native и PWA: один код — iOS, Android и веб для вашей аудитории.",
      sortOrder: 3,
    },
    {
      icon: "search",
      title: "SEO и аналитика",
      description: "Технический SEO, цели в Метрике, отчёты по заявкам и A/B-тесты ключевых экранов.",
      sortOrder: 4,
    },
    {
      icon: "shield",
      title: "Поддержка и рост",
      description: "Сопровождение после запуска: доработки, мониторинг, развитие продукта по метрикам.",
      sortOrder: 5,
    },
  ];

  for (const data of services) {
    const row = await prisma.service.findFirst({ where: { sortOrder: data.sortOrder } });
    if (row) {
      await prisma.service.update({
        where: { id: row.id },
        data: { icon: data.icon, title: data.title, description: data.description },
      });
    }
  }

  const faqs = [
    {
      question: "Сколько стоит разработка сайта?",
      answer:
        "Лендинг — от 150 000 ₽, корпоративный сайт — от 350 000 ₽, сложный продукт — по смете после брифа. Даём несколько вариантов под бюджет.",
      sortOrder: 0,
    },
    {
      question: "Как быстро вы начинаете работу?",
      answer:
        "Бриф и созвон — в день обращения. Прототип и смета — за 3–5 рабочих дней. Старт разработки — сразу после подписания договора и аванса.",
      sortOrder: 1,
    },
    {
      question: "Фиксируете ли цену в договоре?",
      answer:
        "Да. Стоимость, этапы, сроки и состав работ закрепляем в договоре и ТЗ. Допработы — только по согласованию и отдельной смете.",
      sortOrder: 2,
    },
    {
      question: "Что если мне не подойдёт дизайн?",
      answer:
        "На этапе прототипа согласуем структуру и логику. В дизайне — 2 раунда правок включены, дальше — по часам или пакету.",
      sortOrder: 3,
    },
    {
      question: "Помогаете ли после запуска?",
      answer:
        "Да: пакеты поддержки от 20 часов в месяц — обновления, мониторинг, SEO-доработки и развитие функционала.",
      sortOrder: 4,
    },
  ];

  for (const data of faqs) {
    const row = await prisma.faq.findFirst({ where: { sortOrder: data.sortOrder } });
    if (row) {
      await prisma.faq.update({
        where: { id: row.id },
        data: { question: data.question, answer: data.answer },
      });
    }
  }

  const heroFeatures = [
    { title: "UI/UX", subtitle: "Интерфейсы, которые ведут к заявке", icon: "palette", variant: "accent", sortOrder: 0 },
    { title: "Разработка", subtitle: "Быстрый Next.js и интеграции", icon: "code", variant: "default", sortOrder: 1 },
    { title: "Брендинг", subtitle: "Узнаваемый образ и доверие", icon: "sparkles", variant: "default", sortOrder: 2 },
    { title: "SEO", subtitle: "Трафик и заявки из поиска", icon: "search", variant: "default", sortOrder: 3 },
    { title: "Поддержка", subtitle: "24/7 сопровождение", icon: "headphones", variant: "image", sortOrder: 4, imageUrl: IMAGES.hero },
    { title: "Аналитика", subtitle: "Метрики, цели, A/B-тесты", icon: "chart", variant: "solid", sortOrder: 5 },
  ];

  for (const data of heroFeatures) {
    const row = await prisma.heroFeature.findFirst({ where: { sortOrder: data.sortOrder } });
    if (row) {
      await prisma.heroFeature.update({
        where: { id: row.id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          icon: data.icon,
          variant: data.variant,
          imageUrl: data.imageUrl ?? row.imageUrl,
        },
      });
    }
  }
}

async function main() {
  // Не перезаписываем настройки при повторном seed — иначе сбрасываются телефоны, почта, видео hero и т.д.
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ...SELLING_SETTINGS,
      sectionSpacing: JSON.stringify(DEFAULT_SPACING),
      buttonLabels: serializeButtonLabels(DEFAULT_BUTTON_LABELS),
    },
  });

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  const count = await prisma.heroFeature.count();
  if (count === 0) {
    await prisma.heroFeature.createMany({
      data: [
        { title: "UI/UX", subtitle: "Интерфейсы, которые ведут к заявке", icon: "palette", variant: "accent", sortOrder: 0 },
        { title: "Разработка", subtitle: "Быстрый Next.js и интеграции", icon: "code", variant: "default", sortOrder: 1 },
        { title: "Брендинг", subtitle: "Узнаваемый образ и доверие", icon: "sparkles", variant: "default", sortOrder: 2 },
        { title: "SEO", subtitle: "Трафик и заявки из поиска", icon: "search", variant: "default", sortOrder: 3 },
        { title: "Поддержка", subtitle: "24/7 сопровождение", icon: "headphones", variant: "image", sortOrder: 4, imageUrl: IMAGES.hero },
        { title: "Аналитика", subtitle: "Метрики, цели, A/B-тесты", icon: "chart", variant: "solid", sortOrder: 5 },
      ],
    });
  }

  if ((await prisma.project.count()) === 0) {
    const projects = [
      {
        title: "FinTech Dashboard",
        description: "Панель для инвесторов: −40% время обработки заявки.",
        cardTitle: "FinTech Dashboard",
        cardDescription: "Панель для инвесторов и менеджеров с онбордингом за 2 клика.",
        cardResultText: "−40% время обработки заявки",
        imageUrl: IMAGES.projects[0],
        link: "#contact",
        sortOrder: 0,
      },
      {
        title: "E-commerce Redesign",
        description: "Конверсия в заказ +34%, средний чек +12%.",
        cardTitle: "E-commerce Redesign",
        cardDescription: "Редизайн магазина с упором на корзину и оплату.",
        cardResultText: "+34% к конверсии в заказ\n+12% к среднему чеку",
        imageUrl: IMAGES.projects[1],
        link: "#contact",
        sortOrder: 1,
      },
      {
        title: "Medical Portal",
        description: "Онлайн-запись за 90 секунд, −60% звонков в регистратуру.",
        cardTitle: "Medical Portal",
        cardDescription: "Онлайн-запись и личный кабинет пациента с телефона.",
        cardResultText: "−60% звонков в регистратуру\nЗапись за 90 секунд",
        imageUrl: IMAGES.projects[2],
        link: "#contact",
        sortOrder: 2,
      },
      {
        title: "Real Estate Platform",
        description: "×2 целевых заявок с сайта за квартал.",
        cardTitle: "Real Estate Platform",
        cardDescription: "Каталог с картой и умными фильтрами для подбора объектов.",
        cardResultText: "×2 целевых заявок с сайта за первый квартал",
        imageUrl: IMAGES.projects[3],
        link: "#contact",
        sortOrder: 3,
      },
      {
        title: "EdTech LMS",
        description: "Удержание студентов +22%.",
        cardTitle: "EdTech LMS",
        cardDescription: "Платформа обучения с подписками и автоматизацией проверки ДЗ.",
        cardResultText: "+22% удержание студентов\n−15 ч/нед на ручной проверке",
        imageUrl: IMAGES.projects[4],
        link: "#contact",
        sortOrder: 4,
      },
      {
        title: "Corporate B2B Site",
        description: "×3 заявок на КП после редизайна.",
        cardTitle: "Corporate B2B Site",
        cardDescription: "Корпоративный сайт под лиды с отраслевыми лендингами и калькулятором.",
        cardResultText: "×3 заявок на КП за первые 8 недель",
        imageUrl: IMAGES.projects[5],
        link: "#contact",
        sortOrder: 5,
      },
    ];
    await prisma.project.createMany({ data: projects });
  }

  if ((await prisma.caseStudy.count()) === 0) {
    await prisma.caseStudy.createMany({
      data: [
        { tag: "E-commerce", title: "Маркетплейс запчастей", description: "Запуск за 3 месяца, ×2 заявок с сайта.", imageUrl: IMAGES.cases[0], link: "#contact", sortOrder: 0 },
        { tag: "SaaS", title: "HR-платформа", description: "1200+ компаний за полгода.", imageUrl: IMAGES.cases[1], link: "#contact", sortOrder: 1 },
        { tag: "Mobile", title: "Доставка", description: "−18% время доставки, +25% повторных заказов.", imageUrl: IMAGES.cases[2], link: "#contact", sortOrder: 2 },
      ],
    });
  }

  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: [
        { icon: "layout", title: "Продающий веб-дизайн", description: "UI под конверсию и прототипы", sortOrder: 0 },
        { icon: "code", title: "Разработка под ключ", description: "Next.js и интеграции", sortOrder: 1 },
        { icon: "server", title: "Backend", description: "API и личные кабинеты", sortOrder: 2 },
        { icon: "smartphone", title: "Мобильные приложения", description: "React Native, PWA", sortOrder: 3 },
        { icon: "search", title: "SEO и аналитика", description: "Трафик и отчёты по заявкам", sortOrder: 4 },
        { icon: "shield", title: "Поддержка", description: "Сопровождение после запуска", sortOrder: 5 },
      ],
    });
  }

  if ((await prisma.marketplaceApp.count()) === 0) {
    await prisma.marketplaceApp.createMany({
      data: [
        {
          title: "REDLINE CRM Lite",
          description:
            "Лёгкая CRM для заявок с сайта и мессенджеров: воронка, напоминания и отчёты для отдела продаж.",
          imageUrl: IMAGES.projects[0],
          priceLabel: "от 14 900 ₽/мес",
          badge: "REDLINE",
          category: "redline",
          icon: "chart",
          features: JSON.stringify([
            "Воронка и статусы сделок",
            "Интеграция с формой сайта",
            "Еженедельные отчёты в Telegram",
          ]),
          featured: true,
          published: true,
          sortOrder: 0,
        },
        {
          title: "REDLINE Booking",
          description:
            "Онлайн-запись для услуг: слоты, предоплата и SMS-напоминания — без звонков в регистратуру.",
          imageUrl: IMAGES.projects[2],
          priceLabel: "от 9 900 ₽/мес",
          badge: "REDLINE",
          category: "redline",
          icon: "smartphone",
          features: JSON.stringify([
            "Календарь и слоты мастеров",
            "Оплата на сайте",
            "Напоминания клиентам",
          ]),
          featured: false,
          published: true,
          sortOrder: 1,
        },
        {
          title: "Лендинг под ключ",
          description:
            "Готовый продающий лендинг с формой заявки, аналитикой и базовым SEO — запуск за 5–7 дней.",
          imageUrl: IMAGES.projects[1],
          priceLabel: "от 7 900 ₽/мес",
          badge: "Шаблон",
          category: "ready",
          icon: "layout",
          features: JSON.stringify([
            "5–7 секций под нишу",
            "Подключение метрик",
            "Техподдержка и правки",
          ]),
          featured: true,
          published: true,
          sortOrder: 2,
        },
        {
          title: "Интернет-магазин Start",
          description:
            "Каталог, корзина и оплата: старт e-commerce без долгой разработки с нуля.",
          imageUrl: IMAGES.projects[3],
          priceLabel: "от 19 900 ₽/мес",
          badge: "E-commerce",
          category: "ready",
          icon: "server",
          features: JSON.stringify([
            "До 500 SKU",
            "Оплата и доставка",
            "Админка заказов",
          ]),
          featured: false,
          published: true,
          sortOrder: 3,
        },
        {
          title: "Личный кабинет B2B",
          description:
            "Кабинет для клиентов и партнёров: документы, статусы заказов и повторные заявки.",
          imageUrl: IMAGES.projects[4],
          priceLabel: "от 24 900 ₽/мес",
          badge: "B2B",
          category: "ready",
          icon: "shield",
          features: JSON.stringify([
            "Роли и доступы",
            "История заказов",
            "Уведомления по email",
          ]),
          featured: false,
          published: true,
          sortOrder: 4,
        },
        {
          title: "Telegram Mini App",
          description:
            "Мини-приложение в Telegram: каталог, заказ и оплата там, где уже сидит ваша аудитория.",
          imageUrl: IMAGES.projects[5],
          priceLabel: "от 12 900 ₽/мес",
          badge: "Mini App",
          category: "ready",
          icon: "code",
          features: JSON.stringify([
            "Каталог и корзина",
            "Оплата внутри Telegram",
            "Рассылки и акции",
          ]),
          featured: false,
          published: true,
          sortOrder: 5,
        },
      ],
    });
  }

  if ((await prisma.pricingPlan.count()) === 0) {
    await prisma.pricingPlan.createMany({ data: [...DEFAULT_PRICING_PLANS] });
  } else {
    for (const plan of DEFAULT_PRICING_PLANS) {
      await prisma.pricingPlan.updateMany({
        where: { name: plan.name, audienceLabel: "" },
        data: {
          eyebrow: plan.eyebrow,
          summary: plan.summary,
          audienceLabel: plan.audienceLabel,
          outcomeText: plan.outcomeText,
        },
      });
    }
  }

  const settingsRow = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (settingsRow && !settingsRow.pricingTitle?.trim()) {
    await prisma.siteSettings.update({
      where: { id: 1 },
      data: { ...DEFAULT_PRICING_SECTION },
    });
  }

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({
      data: [
        { question: "Сколько стоит разработка сайта?", answer: "Лендинг — от 150 000 ₽, корпоративный — от 350 000 ₽. Точная смета после брифа.", sortOrder: 0 },
        { question: "Как быстро начинаете?", answer: "Созвон в день обращения, смета за 3–5 дней.", sortOrder: 1 },
        { question: "Фиксируете цену?", answer: "Да, в договоре и ТЗ.", sortOrder: 2 },
        { question: "Правки по дизайну?", answer: "2 раунда включены в стоимость.", sortOrder: 3 },
        { question: "Поддержка после запуска?", answer: "Да, пакеты от 20 часов в месяц.", sortOrder: 4 },
      ],
    });
  }

  // Деструктивная синхронизация текстов — только по явному флагу (SEED_SYNC_SELLING=1)
  if (process.env.SEED_SYNC_SELLING === "1") {
    await syncSellingContent();
    await syncImageUrls();
    console.log("Selling content and image URLs synced (SEED_SYNC_SELLING=1).");
  } else {
    console.log("Site settings preserved. Set SEED_SYNC_SELLING=1 to force demo content sync.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
