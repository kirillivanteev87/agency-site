-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "brandName" TEXT NOT NULL DEFAULT 'STUDIO',
    "brandHighlightText" TEXT NOT NULL DEFAULT '',
    "brandHighlightColor" TEXT NOT NULL DEFAULT '',
    "logoMode" TEXT NOT NULL DEFAULT 'image',
    "logoImageUrl" TEXT NOT NULL DEFAULT '/images/qnox-logo.png',
    "heroTitle" TEXT NOT NULL DEFAULT 'Создаём цифровые продукты',
    "heroHighlight" TEXT NOT NULL DEFAULT 'которые работают',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Веб-студия полного цикла: дизайн, разработка, продвижение',
    "heroMeta" TEXT NOT NULL DEFAULT 'Ответим в течение 2 часов · Без обязательств · NDA по запросу',
    "heroBenefit1" TEXT NOT NULL DEFAULT 'Рост заявок и продаж',
    "heroBenefit2" TEXT NOT NULL DEFAULT 'Сроки и бюджет в договоре',
    "heroBenefit3" TEXT NOT NULL DEFAULT 'Поддержка после запуска',
    "heroVideoUrl" TEXT NOT NULL DEFAULT '',
    "heroVideoUrlLight" TEXT NOT NULL DEFAULT '',
    "statValue" TEXT NOT NULL DEFAULT '70+',
    "statText" TEXT NOT NULL DEFAULT 'успешных проектов за 5 лет работы',
    "footerCopyright" TEXT NOT NULL DEFAULT '© 2026 Studio. Все права защищены.',
    "footerDescriptor" TEXT NOT NULL DEFAULT 'Студия цифровых продуктов: SaaS, AI и веб-платформы.',
    "footerBehanceUrl" TEXT NOT NULL DEFAULT '',
    "footerGithubUrl" TEXT NOT NULL DEFAULT '',
    "phones" TEXT NOT NULL DEFAULT '["+7 (999) 123-45-67"]',
    "emails" TEXT NOT NULL DEFAULT '["hello@studio.ru"]',
    "addresses" TEXT NOT NULL DEFAULT '["Москва, ул. Примерная, 1"]',
    "socialLinks" TEXT NOT NULL DEFAULT '[{"label":"Telegram","url":"https://t.me"}]',
    "sectionSpacing" TEXT NOT NULL DEFAULT '{}',
    "buttonLabels" TEXT NOT NULL DEFAULT '{}',
    "pricingEyebrow" TEXT NOT NULL DEFAULT 'Тарифы',
    "pricingTitle" TEXT NOT NULL DEFAULT 'Прозрачные пакеты под вашу задачу',
    "pricingSubtitle" TEXT NOT NULL DEFAULT 'Фиксированная стоимость старта — без скрытых строк. Точную смету уточним после брифа и созвона.',
    "pricingNote" TEXT NOT NULL DEFAULT 'Цены указаны за типовой объём. Нестандартный функционал, контент и интеграции считаем отдельно — смета за 20 минут после брифа.',
    "contactEyebrow" TEXT NOT NULL DEFAULT 'Следующий шаг',
    "contactTitle" TEXT NOT NULL DEFAULT 'Получите расчёт проекта за 24 часа',
    "contactSubtitle" TEXT NOT NULL DEFAULT 'Опишите задачу — предложим формат, сроки и ориентир по бюджету. Перезвоним в течение 2 часов в рабочее время.',
    "contactBullet1" TEXT NOT NULL DEFAULT 'Бесплатная консультация',
    "contactBullet2" TEXT NOT NULL DEFAULT 'NDA по запросу',
    "contactBullet3" TEXT NOT NULL DEFAULT 'Без навязчивых продаж',
    "contactLabelPhone" TEXT NOT NULL DEFAULT 'Телефон',
    "contactLabelEmail" TEXT NOT NULL DEFAULT 'Email',
    "contactLabelAddress" TEXT NOT NULL DEFAULT 'Адрес',
    "contactWhatsappUrl" TEXT NOT NULL DEFAULT 'https://wa.me',
    "contactWhatsappLabel" TEXT NOT NULL DEFAULT 'WhatsApp',
    "contactWhatsappLinkText" TEXT NOT NULL DEFAULT 'WhatsApp',
    "contactTelegramUrl" TEXT NOT NULL DEFAULT 'https://t.me',
    "contactTelegramLabel" TEXT NOT NULL DEFAULT 'Telegram',
    "contactTelegramLinkText" TEXT NOT NULL DEFAULT 'Telegram',
    "contactMaxUrl" TEXT NOT NULL DEFAULT 'https://max.ru',
    "contactMaxLabel" TEXT NOT NULL DEFAULT 'MAX',
    "contactMaxLinkText" TEXT NOT NULL DEFAULT 'MAX',
    "contactFormTitle" TEXT NOT NULL DEFAULT 'Заявка',
    "contactFormLead" TEXT NOT NULL DEFAULT 'Заполните форму — менеджер свяжется с вами и предложит решение под вашу задачу.',
    "contactNameLabel" TEXT NOT NULL DEFAULT 'Имя',
    "contactNamePlaceholder" TEXT NOT NULL DEFAULT 'Как к вам обращаться',
    "contactEmailLabel" TEXT NOT NULL DEFAULT 'Email',
    "contactEmailPlaceholder" TEXT NOT NULL DEFAULT 'name@company.ru',
    "contactPhoneLabel" TEXT NOT NULL DEFAULT 'Телефон',
    "contactPhonePlaceholder" TEXT NOT NULL DEFAULT '+7 (999) 123-45-67',
    "contactMessageLabel" TEXT NOT NULL DEFAULT 'Что нужно сделать?',
    "contactMessagePlaceholder" TEXT NOT NULL DEFAULT 'Кратко опишите проект, сроки и бюджет (если есть)',
    "contactSuccessMessage" TEXT NOT NULL DEFAULT 'Заявка принята! Мы свяжемся с вами в ближайшие 2 часа в рабочее время.',
    "contactConsentText" TEXT NOT NULL DEFAULT 'Нажимая кнопку, вы соглашаетесь на обработку персональных данных.',

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "audienceLabel" TEXT NOT NULL DEFAULT '',
    "outcomeText" TEXT NOT NULL DEFAULT '',
    "price" TEXT NOT NULL,
    "features" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "badgeLabel" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroFeature" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'sparkles',
    "variant" TEXT NOT NULL DEFAULT 'default',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,

    CONSTRAINT "HeroFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cardTitle" TEXT NOT NULL DEFAULT '',
    "cardDescription" TEXT NOT NULL DEFAULT '',
    "cardResultText" TEXT NOT NULL DEFAULT '',
    "pageTitle" TEXT NOT NULL DEFAULT '',
    "pageDescription" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT NOT NULL,
    "projectCardImageUrl" TEXT NOT NULL DEFAULT '',
    "projectPageImageUrl" TEXT NOT NULL DEFAULT '',
    "link" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "landingHeroMeta" TEXT NOT NULL DEFAULT '',
    "landingMetrics" TEXT NOT NULL DEFAULT '[]',
    "challengeTitle" TEXT NOT NULL DEFAULT 'Задача проекта',
    "challengeText" TEXT NOT NULL DEFAULT '',
    "solutionTitle" TEXT NOT NULL DEFAULT 'Наше решение',
    "solutionText" TEXT NOT NULL DEFAULT '',
    "benefitsTitle" TEXT NOT NULL DEFAULT 'Преимущества проекта',
    "benefitsItems" TEXT NOT NULL DEFAULT '[]',
    "howItWorksTitle" TEXT NOT NULL DEFAULT 'Как мы реализовали',
    "howItWorksSteps" TEXT NOT NULL DEFAULT '[]',
    "scopeTitle" TEXT NOT NULL DEFAULT 'Что было сделано',
    "scopeItems" TEXT NOT NULL DEFAULT '[]',
    "resultsTitle" TEXT NOT NULL DEFAULT 'Результат для бизнеса',
    "resultsText" TEXT NOT NULL DEFAULT '',
    "storyTitle" TEXT NOT NULL DEFAULT 'О проекте',
    "testimonialQuote" TEXT NOT NULL DEFAULT '',
    "testimonialAuthor" TEXT NOT NULL DEFAULT '',
    "testimonialRole" TEXT NOT NULL DEFAULT '',
    "ctaTitle" TEXT NOT NULL DEFAULT 'Хотите такой же проект?',
    "ctaSubtitle" TEXT NOT NULL DEFAULT 'Подготовим план и оценку по срокам и бюджету в течение 24 часов.',
    "coverFocusX" INTEGER NOT NULL DEFAULT 50,
    "coverFocusY" INTEGER NOT NULL DEFAULT 50,
    "projectPageFocusX" INTEGER NOT NULL DEFAULT 50,
    "projectPageFocusY" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "landingHeroMeta" TEXT NOT NULL DEFAULT '',
    "landingMetrics" TEXT NOT NULL DEFAULT '[]',
    "challengeTitle" TEXT NOT NULL DEFAULT 'Задача клиента',
    "challengeText" TEXT NOT NULL DEFAULT '',
    "solutionTitle" TEXT NOT NULL DEFAULT 'Наше решение',
    "solutionText" TEXT NOT NULL DEFAULT '',
    "benefitsTitle" TEXT NOT NULL DEFAULT 'Преимущества продукта',
    "benefitsItems" TEXT NOT NULL DEFAULT '[]',
    "howItWorksTitle" TEXT NOT NULL DEFAULT 'Как мы это сделали',
    "howItWorksSteps" TEXT NOT NULL DEFAULT '[]',
    "scopeTitle" TEXT NOT NULL DEFAULT 'Что входит в решение',
    "scopeItems" TEXT NOT NULL DEFAULT '[]',
    "resultsTitle" TEXT NOT NULL DEFAULT 'Результат для бизнеса',
    "resultsText" TEXT NOT NULL DEFAULT '',
    "storyTitle" TEXT NOT NULL DEFAULT 'О проекте',
    "testimonialQuote" TEXT NOT NULL DEFAULT '',
    "testimonialAuthor" TEXT NOT NULL DEFAULT '',
    "testimonialRole" TEXT NOT NULL DEFAULT '',
    "ctaTitle" TEXT NOT NULL DEFAULT 'Хотите такой же результат?',
    "ctaSubtitle" TEXT NOT NULL DEFAULT 'Обсудим вашу задачу и предложим план с оценкой сроков и бюджета за 24 часа.',

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'layout',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceApp" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "priceLabel" TEXT NOT NULL DEFAULT 'от 0 ₽/мес',
    "badge" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'ready',
    "icon" TEXT NOT NULL DEFAULT 'layout',
    "features" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MarketplaceApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

