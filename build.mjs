// Static site generator for the Virtum website.
// Produces SEO-optimized multi-page HTML + sitemap/robots/manifest/404.
import { writeFileSync, mkdirSync } from "node:fs";

const ROOT = new URL("./", import.meta.url).pathname;
const SITE = {
  url: "https://virtum.ru",
  name: "Virtum",
  legal: "Virtum",
  slogan: "Строим бизнес — строим будущее.",
  tagline: "ИИ-агенты для корпоративного бизнеса",
  email: "hello@virtum.ru",
  phone: "+7 (495) 000-00-00",
  desc: "Virtum разворачивает ИИ-агентов на телефоне, сайте, в чате, SMS и почте. Они отвечают за секунды, записывают, оформляют заказы и квалифицируют лиды — 24/7, на 20+ языках.",
  built: "2026-06-16",
};
const NAV = [
  { h: "/platform", t: "Возможности" },
  { h: "/how-it-works", t: "Как работает" },
  { h: "/use-cases", t: "Сценарии" },
  { h: "/pricing", t: "Тарифы" },
  { h: "/security", t: "Безопасность" },
  { h: "/contact", t: "Контакты" },
];
const ORG = {
  "@type": "Organization", "@id": SITE.url + "/#org", name: SITE.name, url: SITE.url + "/",
  logo: SITE.url + "/assets/logo.svg", slogan: SITE.slogan, description: SITE.desc,
  email: SITE.email, areaServed: "RU",
  contactPoint: { "@type": "ContactPoint", contactType: "sales", email: SITE.email, availableLanguage: ["ru", "en"] },
};
const j = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const crumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.t, item: SITE.url + it.h })),
});

const mark = `<img src="/assets/logo.svg" alt="" class="mark" width="26" height="26" />`;

function head({ title, desc, slug, ld = [] }) {
  const canon = SITE.url + (slug === "/" ? "/" : slug);
  const graph = [ORG, ...ld];
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${canon}" />
<meta name="robots" content="index,follow,max-image-preview:large" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Virtum" />
<meta property="og:locale" content="ru_RU" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${canon}" />
<meta property="og:image" content="${SITE.url}/assets/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${SITE.url}/assets/og.png" />
<meta name="theme-color" content="#050E1C" />
<link rel="icon" href="/assets/logo.svg" type="image/svg+xml" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles.css" />
<script>document.documentElement.classList.add('js');</script>
${j({ "@context": "https://schema.org", "@graph": graph })}
</head>
<body>`;
}

function nav(active) {
  const links = NAV.map((n) => `<a href="${n.h}"${n.h === active ? ' aria-current="page"' : ""}>${n.t}</a>`).join("");
  return `<header class="nav" id="nav">
  <a class="brand" href="/" aria-label="Virtum — на главную">${mark}<span class="wordmark">VIRTUM</span></a>
  <nav class="nav-links" aria-label="Основная навигация">${links}</nav>
  <a href="/contact" class="btn btn-primary nav-cta">Запросить демо</a>
  <button class="nav-burger" aria-label="Открыть меню" id="burger"><span></span><span></span></button>
</header>`;
}

function footer() {
  return `<footer class="footer"><div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <a class="brand" href="/">${mark}<span class="wordmark">VIRTUM</span></a>
        <p>${SITE.tagline}. ${SITE.slogan}</p>
      </div>
      <div class="foot-col"><h4>Продукт</h4>
        <a href="/platform">Возможности</a><a href="/how-it-works">Как работает</a><a href="/integrations">Интеграции</a><a href="/pricing">Тарифы</a></div>
      <div class="foot-col"><h4>Сценарии</h4>
        <a href="/use-cases/sales">Продажи</a><a href="/use-cases/support">Поддержка</a><a href="/use-cases/bookings">Бронирования</a><a href="/use-cases/orders">Заказы</a></div>
      <div class="foot-col"><h4>Компания</h4>
        <a href="/security">Безопасность</a><a href="/contact">Контакты</a><a href="/contact">Запросить демо</a></div>
      <div class="foot-col"><h4>Контакты</h4>
        <a href="mailto:${SITE.email}">${SITE.email}</a><a href="/">virtum.ru</a></div>
    </div>
    <div class="foot-bottom"><span>© 2026 ${SITE.legal}. Все права защищены.</span><span>Данные хранятся в ЕС · 152-ФЗ · GDPR</span></div>
  </div></footer>
  <script src="/app.js"></script></body></html>`;
}

const cta = (h, sub) => `<section class="section cta"><div class="glow glow-c"></div><div class="wrap cta-inner reveal">
  <h2>${h}</h2><p class="lead center">${sub}</p>
  <a href="/contact" class="btn btn-primary btn-lg" style="margin-top:18px">Запросить демо</a>
  <p class="slogan">${SITE.slogan}</p></div></section>`;

const breadcrumb = (here) => `<nav class="breadcrumb" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span>${here}</nav>`;

function write(file, slug, title, desc, ld, body) {
  writeFileSync(ROOT + file, head({ title, desc, slug, ld }) + body + footer());
}

/* ============================ HOME ============================ */
write("index.html", "/",
  "Virtum — ИИ-агенты для корпоративного бизнеса",
  SITE.desc,
  [
    { "@type": "WebSite", "@id": SITE.url + "/#website", url: SITE.url + "/", name: "Virtum", publisher: { "@id": SITE.url + "/#org" }, inLanguage: "ru" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Чем Virtum отличается от обычного чат-бота?", acceptedAnswer: { "@type": "Answer", text: "Бот пересылает клиента дальше, а агент Virtum завершает задачу в диалоге: записывает, оформляет заказ, квалифицирует лид и отправляет подтверждение." } },
      { "@type": "Question", name: "Сколько занимает запуск?", acceptedAnswer: { "@type": "Answer", text: "Базовый запуск — за один день, без кода. Вы загружаете данные, выбираете голос и язык, включаете нужные функции и публикуете агента." } },
      { "@type": "Question", name: "В каких каналах работает агент?", acceptedAnswer: { "@type": "Answer", text: "Телефон, сайт, чат, SMS и электронная почта — один агент с единой памятью во всех каналах." } },
    ] },
  ],
  `${nav("/")}
<main id="top">
<section class="hero">
  <div class="bg-grid" data-parallax="0.15"></div>
  <div class="glow glow-a" data-parallax="0.30"></div>
  <div class="glow glow-b" data-parallax="0.20"></div>
  <div class="hero-inner">
    <div class="hero-copy">
      <p class="eyebrow reveal">${SITE.tagline}</p>
      <h1 class="reveal" data-delay="60">Отвечает клиентам <span class="grad">за&nbsp;секунды</span> — и доводит диалог <span class="grad">до&nbsp;сделки.</span></h1>
      <p class="lead reveal" data-delay="140">ИИ-агенты на телефоне, сайте, в чате, SMS и почте. Отвечают мгновенно, записывают, оформляют заказы и квалифицируют лиды — круглосуточно, на 20+ языках.</p>
      <div class="hero-actions reveal" data-delay="220">
        <a href="/contact" class="btn btn-primary btn-lg">Запросить демо</a>
        <a href="/how-it-works" class="btn btn-ghost btn-lg">Как это работает</a>
      </div>
      <p class="microproof reveal" data-delay="300"><span>Запуск за один день</span><span>без кода</span><span>данные в ЕС</span></p>
    </div>
    <div class="chat-card reveal" data-delay="180">
      <div class="chat-head">${mark}<span class="chat-title">VIRTUM · АГЕНТ</span><span class="chat-status"><i></i>онлайн</span></div>
      <div class="chat-body">
        <div class="msg msg-in"><span class="who">Клиент</span><p>Можно столик на четверг, 19:00?</p></div>
        <div class="typing"><span></span><span></span><span></span></div>
        <div class="msg msg-bot"><p><svg class="ck" viewBox="0 0 24 24"><path d="M5 12l4 4L19 6"/></svg> Готово. Столик забронирован.</p><p class="sub">Подтверждение отправил на почту и SMS.</p></div>
      </div>
      <div class="chat-tags"><span class="tag">запись</span><span class="tag">подтверждение</span><span class="tag">CRM</span></div>
    </div>
  </div>
  <div class="stats">
    <div class="stat reveal"><b data-count="5" data-prefix="&lt;&nbsp;" data-suffix="&nbsp;сек">&lt;&nbsp;5&nbsp;сек</b><span>первая реакция</span></div>
    <div class="stat reveal" data-delay="80"><b>24/7</b><span>без пауз</span></div>
    <div class="stat reveal" data-delay="160"><b data-count="5">5</b><span>каналов · один агент</span></div>
    <div class="stat reveal" data-delay="240"><b data-count="20" data-suffix="+">20+</b><span>языков</span></div>
  </div>
</section>

<section class="section" id="solution">
  <div class="wrap">
    <p class="eyebrow reveal">Решение</p>
    <h2 class="reveal" data-delay="60">Не просто отвечает — <span class="grad">действует.</span></h2>
    <p class="lead reveal" data-delay="120">Обычный бот пересылает клиента дальше. Агент Virtum завершает задачу прямо в диалоге.</p>
    <div class="compare reveal" data-delay="160">
      <div class="compare-head"><span>Обычный бот говорит…</span><span>Virtum делает…</span></div>
      <div class="compare-row"><span class="bot">«Позвоните, чтобы записаться»</span><span class="virtum">Записывает и отправляет подтверждение</span></div>
      <div class="compare-row"><span class="bot">«Каталог — на сайте»</span><span class="virtum">Оформляет заказ и передаёт в работу</span></div>
      <div class="compare-row"><span class="bot">«Мы вам перезвоним»</span><span class="virtum">Отвечает мгновенно — и в 2 ночи, и в 2 дня</span></div>
      <div class="compare-row"><span class="bot">«Уточните у менеджера»</span><span class="virtum">Квалифицирует лид и направляет в нужный отдел</span></div>
    </div>
    <p class="section-foot reveal">Каждый диалог заканчивается результатом: запись, заказ, заявка или квалифицированный лид.</p>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <p class="eyebrow reveal">Что внутри</p>
    <h2 class="reveal" data-delay="60">Платформа, а не <span class="grad">скрипт.</span></h2>
    <div class="cards">
      <article class="card reveal"><div class="ic">⬡</div><h3>Омниканальность</h3><p>Телефон, сайт, чат, SMS, почта. Один агент, единая память.</p><a class="more" href="/platform">Подробнее →</a></article>
      <article class="card reveal" data-delay="80"><div class="ic">➔</div><h3>Действие, а не ответ</h3><p>Записи, заказы, заявки, маршрутизация — прямо в диалоге.</p><a class="more" href="/use-cases">Сценарии →</a></article>
      <article class="card reveal" data-delay="160"><div class="ic">⛨</div><h3>Корпоративный уровень</h3><p>Данные в ЕС, шифрование, 152-ФЗ, GDPR, журналы доступа.</p><a class="more" href="/security">Безопасность →</a></article>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow reveal">Сценарии</p>
    <h2 class="reveal" data-delay="60">Где Virtum приносит <span class="grad">деньги.</span></h2>
    <div class="cards">
      <article class="card reveal"><div class="ic">◷</div><h3>Продажи</h3><p>Мгновенный ответ на заявку, квалификация и передача «тёплого» лида менеджеру.</p></article>
      <article class="card reveal" data-delay="80"><div class="ic">☎</div><h3>Поддержка 24/7</h3><p>Ответы по регламентам, статусы заказов, эскалация сложных случаев.</p></article>
      <article class="card reveal" data-delay="160"><div class="ic">▣</div><h3>Бронирования и заказы</h3><p>Записи, столики, номера и заказы оформляются прямо в разговоре.</p></article>
    </div>
    <p class="section-foot reveal"><a class="more" href="/use-cases">Все сценарии и отрасли →</a></p>
  </div>
</section>

<section class="section alt"><div class="wrap">
  <p class="eyebrow reveal">Вопросы</p>
  <h2 class="reveal" data-delay="60">Частые вопросы</h2>
  <div class="faq reveal" data-delay="120">
    <details><summary>Чем Virtum отличается от чат-бота?</summary><p>Бот пересылает клиента дальше. Агент Virtum завершает задачу в диалоге: записывает, оформляет заказ, квалифицирует лид и отправляет подтверждение.</p></details>
    <details><summary>Сколько занимает запуск?</summary><p>Базовый запуск — за один день, без кода. Загрузите данные, выберите голос и язык, включите функции и опубликуйте агента.</p></details>
    <details><summary>В каких каналах работает агент?</summary><p>Телефон, сайт, чат, SMS и почта — один агент с единой памятью во всех каналах.</p></details>
    <details><summary>Где хранятся данные?</summary><p>В ЕС, с шифрованием при хранении и передаче, изоляцией данных клиента и журналами доступа. Соответствие 152-ФЗ и GDPR.</p></details>
  </div>
</div></section>

${cta("Запустите ИИ-агента, который <span class=\"grad\">работает на выручку.</span>", "Покажем на ваших задачах за 30 минут.")}
</main>`);

/* ============================ PLATFORM ============================ */
write("platform.html", "/platform",
  "Возможности платформы Virtum — омниканальные ИИ-агенты",
  "Омниканальные ИИ-агенты Virtum: телефон, сайт, чат, SMS и почта. Действие вместо ответа, знание вашего бизнеса, мультиязычность, мультилокальность, CRM, аналитика и интеграции.",
  [
    crumbs([{ t: "Главная", h: "/" }, { t: "Возможности", h: "/platform" }]),
    { "@type": "Service", name: "Платформа ИИ-агентов Virtum", provider: { "@id": SITE.url + "/#org" }, serviceType: "AI customer agents", areaServed: "RU", description: "Омниканальные ИИ-агенты, которые отвечают и выполняют действия: записи, заказы, заявки, маршрутизация." },
  ],
  `${nav("/platform")}
<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  ${breadcrumb("Возможности")}
  <p class="eyebrow">Что внутри</p>
  <h1>Платформа, а&nbsp;не&nbsp;скрипт. <span class="grad">Агенты, которые действуют.</span></h1>
  <p class="lead">Один агент с единой памятью отвечает во всех каналах и завершает задачу — запись, заказ, заявку, маршрутизацию — прямо в диалоге.</p>
  <div class="phero-actions"><a href="/contact" class="btn btn-primary btn-lg">Запросить демо</a><a href="/how-it-works" class="btn btn-ghost btn-lg">Как это работает</a></div>
</div></section>

<section class="section"><div class="wrap">
  <div class="cards">
    <article class="card reveal"><div class="ic">⬡</div><h3>Омниканальность</h3><p>Телефон, сайт, чат, SMS и почта. Один агент, единая память диалога.</p></article>
    <article class="card reveal" data-delay="60"><div class="ic">➔</div><h3>Действие, а не ответ</h3><p>Записи, заказы, заявки, маршрутизация и оплата — внутри разговора.</p></article>
    <article class="card reveal" data-delay="120"><div class="ic">◈</div><h3>Знает ваш бизнес</h3><p>Реальные цены, регламенты, наличие и каталог — без выдумок.</p></article>
    <article class="card reveal"><div class="ic">⌘</div><h3>Мультиязычность</h3><p>20+ языков с переводом в реальном времени.</p></article>
    <article class="card reveal" data-delay="60"><div class="ic">⊞</div><h3>Мультилокальность</h3><p>Один объект или тысяча. Глобальный контроль, локальные правила.</p></article>
    <article class="card reveal" data-delay="120"><div class="ic">◉</div><h3>CRM и аналитика</h3><p>Лиды квалифицируются автоматически. Видно, что спрашивают и что продаётся.</p></article>
  </div>
</div></section>

<section class="section alt"><div class="wrap">
  <p class="eyebrow reveal">Каналы</p>
  <h2 class="reveal" data-delay="60">Один агент — <span class="grad">во всех каналах.</span></h2>
  <div class="omni-diagram reveal" data-delay="120">
    <div class="omni-col channels">
      <div class="node"><span class="dot"></span>Телефон</div><div class="node"><span class="dot"></span>Сайт</div>
      <div class="node"><span class="dot"></span>Чат</div><div class="node"><span class="dot"></span>SMS</div><div class="node"><span class="dot"></span>Почта</div>
    </div>
    <div class="omni-core">${mark.replace('width="26" height="26"','width="84" height="84"')}<span>Агент Virtum</span></div>
    <div class="omni-col result">
      <p class="res-title">Результат</p>
      <div class="res"><svg class="ck" viewBox="0 0 24 24"><path d="M5 12l4 4L19 6"/></svg>Запись подтверждена</div>
      <div class="res"><svg class="ck" viewBox="0 0 24 24"><path d="M5 12l4 4L19 6"/></svg>Заказ оформлен</div>
      <div class="res"><svg class="ck" viewBox="0 0 24 24"><path d="M5 12l4 4L19 6"/></svg>Заявка передана</div>
      <div class="res"><svg class="ck" viewBox="0 0 24 24"><path d="M5 12l4 4L19 6"/></svg>Лид квалифицирован</div>
    </div>
  </div>
  <p class="section-foot reveal">Обновляете данные один раз — все агенты во всех каналах используют их мгновенно.</p>
</div></section>

<section class="section"><div class="wrap">
  <div class="frow">
    <div><h3>Интеграции с вашими системами</h3><p class="lead">Virtum подключается к инструментам, в которых уже работает ваша команда — и переносит результат диалога прямо в них.</p>
      <ul><li>Телефония и колл-центр</li><li>CRM и службы поддержки</li><li>POS, календари и бронирования</li><li>Бизнес-приложения и базы знаний</li></ul></div>
    <div class="visual"><img src="/assets/omnichannel.png" alt="Схема: каналы — агент Virtum — результат" width="560" height="315" loading="lazy" style="border-radius:12px"/></div>
  </div>
</div></section>

${cta("Готовы увидеть платформу <span class=\"grad\">на ваших задачах?</span>", "30 минут — и вы увидите агента, который знает ваш бизнес.")}
</main>`);

/* ============================ HOW IT WORKS ============================ */
write("how-it-works.html", "/how-it-works",
  "Как работает Virtum — запуск ИИ-агента за один день",
  "Четыре шага до ИИ-агента: данные, агент, каналы, результат. Без кода и долгого внедрения. Обновляете данные один раз — агенты используют их мгновенно.",
  [
    crumbs([{ t: "Главная", h: "/" }, { t: "Как работает", h: "/how-it-works" }]),
    { "@type": "HowTo", name: "Как запустить ИИ-агента Virtum", step: [
      { "@type": "HowToStep", position: 1, name: "Данные", text: "Загрузите цены, услуги, регламенты и базу знаний — файлом, текстом или ссылкой на сайт." },
      { "@type": "HowToStep", position: 2, name: "Агент", text: "Virtum соберёт ИИ-агента, который знает ваши цены и правила. Выберите голос, язык и тон." },
      { "@type": "HowToStep", position: 3, name: "Каналы", text: "Подключите телефон, сайт, чат, SMS и почту. Один агент — везде, с единой памятью." },
      { "@type": "HowToStep", position: 4, name: "Результат", text: "Агент отвечает, действует и фиксирует записи, заказы, лиды и аналитику." },
    ] },
  ],
  `${nav("/how-it-works")}
<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  ${breadcrumb("Как работает")}
  <p class="eyebrow">Четыре шага</p>
  <h1>Запуск за один вечер — <span class="grad">без кода.</span></h1>
  <p class="lead">Никакого ИТ-проекта и долгого внедрения. От ваших данных до работающего агента — за один день.</p>
  <div class="phero-actions"><a href="/contact" class="btn btn-primary btn-lg">Запросить демо</a></div>
</div></section>

<section class="section"><div class="wrap">
  <div class="steps">
    <div class="step reveal"><span class="num">01</span><h3>Данные</h3><p>Загрузите цены, услуги, регламенты и базу знаний — файлом, текстом или ссылкой на сайт.</p></div>
    <div class="step reveal" data-delay="100"><span class="num">02</span><h3>Агент</h3><p>Virtum соберёт ИИ-агента, который знает ваши цены и правила. Голос, язык и тон — на ваш выбор.</p></div>
    <div class="step reveal" data-delay="200"><span class="num">03</span><h3>Каналы</h3><p>Подключите телефон, сайт, чат, SMS и почту. Один агент — везде, с единой памятью.</p></div>
    <div class="step reveal" data-delay="300"><span class="num">04</span><h3>Результат</h3><p>Агент отвечает, действует и фиксирует всё: записи, заказы, лиды, аналитика.</p></div>
  </div>
  <p class="section-foot reveal">Обновляете меню или тарифы один раз — все агенты используют новые данные мгновенно.</p>
</div></section>

<section class="section alt"><div class="wrap">
  <div class="frow">
    <div><h3>Что вы контролируете</h3>
      <ul><li>Голос, язык и тон общения</li><li>Какие действия разрешены агенту</li><li>Когда передавать диалог человеку</li><li>Доступ команды и роли</li></ul></div>
    <div><h3>Что делает Virtum</h3>
      <ul><li>Понимает запрос и отвечает по вашим данным</li><li>Выполняет действие: запись, заказ, заявка</li><li>Маршрутизирует в нужный отдел</li><li>Фиксирует результат и аналитику</li></ul></div>
  </div>
</div></section>

${cta("Запустим вашего первого агента <span class=\"grad\">на этой неделе.</span>", "Покажем процесс на ваших данных за 30 минут.")}
</main>`);

/* ============================ USE CASES ============================ */
const uc = (icon, title, text, href) => `<article class="card reveal"><div class="ic">${icon}</div><h3>${title}</h3><p>${text}</p>${href ? `<a class="more" href="${href}">Подробнее →</a>` : ""}</article>`;
write("use-cases.html", "/use-cases",
  "Сценарии Virtum — продажи, поддержка, бронирования и заказы",
  "Где ИИ-агенты Virtum приносят результат: квалификация лидов и продажи, поддержка 24/7, бронирования и записи, заказы и каталог, ресепшн и маршрутизация. Для гостеприимства, ритейла, услуг и недвижимости.",
  [
    crumbs([{ t: "Главная", h: "/" }, { t: "Сценарии", h: "/use-cases" }]),
    { "@type": "ItemList", name: "Сценарии использования Virtum", itemListElement: [
      "Квалификация лидов и продажи", "Поддержка клиентов 24/7", "Бронирования и записи", "Заказы и каталог", "Ресепшн и маршрутизация",
    ].map((n, i) => ({ "@type": "ListItem", position: i + 1, name: n })) },
  ],
  `${nav("/use-cases")}
<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  ${breadcrumb("Сценарии")}
  <p class="eyebrow">Сценарии</p>
  <h1>Где Virtum приносит <span class="grad">деньги.</span></h1>
  <p class="lead">Один агент закрывает повторяющиеся диалоги в продажах, поддержке и операциях — а команда занимается сложным.</p>
  <div class="phero-actions"><a href="/contact" class="btn btn-primary btn-lg">Обсудить ваш сценарий</a></div>
</div></section>

<section class="section"><div class="wrap">
  <div class="cards">
    ${uc("◷", "Продажи и лиды", "Мгновенный ответ на заявку, квалификация по вашим критериям и передача «тёплого» клиента менеджеру с контекстом диалога.", "/use-cases/sales")}
    ${uc("☎", "Поддержка 24/7", "Ответы по регламентам, статусы заказов, типовые вопросы и эскалация сложных случаев живому специалисту.", "/use-cases/support")}
    ${uc("▣", "Бронирования и записи", "Отели, рестораны, клиники, услуги и переговорные — агент проверяет доступность и подтверждает запись.", "/use-cases/bookings")}
    ${uc("◰", "Заказы и каталог", "Оформление заказов в диалоге, проверка наличия, допродажи и передача в работу.", "/use-cases/orders")}
    ${uc("⇄", "Ресепшн и маршрутизация", "Приём звонков и сообщений, ответ на частые вопросы и перевод на нужный отдел или специалиста.")}
    ${uc("◫", "Исходящие и follow-up", "Напоминания, подтверждения и возврат клиентов — по SMS, почте и телефону.")}
  </div>
</div></section>

<section class="section alt"><div class="wrap">
  <p class="eyebrow reveal">Отрасли</p>
  <h2 class="reveal" data-delay="60">Для бизнеса, где важен <span class="grad">каждый диалог.</span></h2>
  <div class="cards">
    <article class="card reveal"><h3>Гостеприимство</h3><p>Бронирования номеров и столов, обслуживание в номер, ответы гостям 24/7.</p></article>
    <article class="card reveal" data-delay="80"><h3>Ритейл и e-commerce</h3><p>Заказы, наличие, статусы доставки и допродажи в любом канале.</p></article>
    <article class="card reveal" data-delay="160"><h3>Услуги и клиники</h3><p>Запись на приём, напоминания и квалификация обращений.</p></article>
    <article class="card reveal"><h3>Недвижимость</h3><p>Ответы по объектам, квалификация покупателей и запись на показы.</p></article>
    <article class="card reveal" data-delay="80"><h3>Финансы и услуги B2B</h3><p>Приём заявок, маршрутизация и поддержка по регламентам.</p></article>
    <article class="card reveal" data-delay="160"><h3>Логистика</h3><p>Статусы, уточнения по доставке и приём обращений без очереди.</p></article>
  </div>
</div></section>

${cta("Соберём агента под <span class=\"grad\">ваш сценарий.</span>", "Расскажите задачу — покажем решение за 30 минут.")}
</main>`);

/* ============================ SECURITY ============================ */
write("security.html", "/security",
  "Безопасность и данные Virtum — 152-ФЗ, GDPR, хранение в ЕС",
  "Корпоративный уровень безопасности по умолчанию: хранение данных в ЕС, шифрование при хранении и передаче, изоляция данных клиента, журналы и контроль доступа. Соответствие 152-ФЗ, GDPR, SOC 2, ISO 27001.",
  [
    crumbs([{ t: "Главная", h: "/" }, { t: "Безопасность", h: "/security" }]),
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Где хранятся данные?", acceptedAnswer: { "@type": "Answer", text: "Данные хранятся и обрабатываются в ЕС, аудируемо, с шифрованием при хранении и передаче." } },
      { "@type": "Question", name: "Соответствует ли Virtum 152-ФЗ и GDPR?", acceptedAnswer: { "@type": "Answer", text: "Да. Платформа выстроена с учётом требований 152-ФЗ и GDPR; доступны журналы действий и контроль доступа." } },
    ] },
  ],
  `${nav("/security")}
<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  ${breadcrumb("Безопасность")}
  <p class="eyebrow">Безопасность и данные</p>
  <h1>Корпоративный уровень <span class="grad">по умолчанию.</span></h1>
  <p class="lead">Данные клиентов и диалоги защищены на каждом уровне — без отдельной настройки и доплат.</p>
</div></section>

<section class="section"><div class="wrap">
  <div class="cards">
    <article class="card reveal"><div class="ic">⌖</div><h3>Хранение в ЕС</h3><p>Данные хранятся и обрабатываются в ЕС, аудируемо.</p></article>
    <article class="card reveal" data-delay="80"><div class="ic">⛨</div><h3>Шифрование</h3><p>При хранении и передаче. Изоляция данных каждого клиента.</p></article>
    <article class="card reveal" data-delay="160"><div class="ic">▤</div><h3>Журналы и доступ</h3><p>Журналы действий, роли и контроль доступа команды.</p></article>
  </div>
  <div class="sec-band reveal">
    <div><h2>Соответствие требованиям</h2><p class="lead">Платформа выстроена с учётом российских и международных требований к данным.</p></div>
    <div class="chips"><span class="chip">152-ФЗ</span><span class="chip">GDPR</span><span class="chip">SOC 2</span><span class="chip">ISO 27001</span><span class="chip">EU-резидентность</span></div>
  </div>
  <div class="faq reveal">
    <details><summary>Где хранятся данные?</summary><p>В ЕС, аудируемо, с шифрованием при хранении и передаче.</p></details>
    <details><summary>Кто имеет доступ к диалогам?</summary><p>Только авторизованные сотрудники с нужной ролью. Все действия фиксируются в журналах.</p></details>
    <details><summary>Можно ли удалить данные клиента?</summary><p>Да — по запросу, в соответствии с 152-ФЗ и GDPR.</p></details>
  </div>
</div></section>

${cta("Готовы обсудить <span class=\"grad\">требования вашей безопасности?</span>", "Ответим на вопросы соответствия и покажем платформу.")}
</main>`);

/* ============================ CONTACT ============================ */
write("contact.html", "/contact",
  "Запросить демо Virtum — контакты",
  "Запросите демо Virtum: покажем ИИ-агента на ваших задачах за 30 минут. Напишите нам — соберём сценарий под ваш бизнес.",
  [
    crumbs([{ t: "Главная", h: "/" }, { t: "Контакты", h: "/contact" }]),
    { "@type": "ContactPage", name: "Контакты Virtum", url: SITE.url + "/contact" },
  ],
  `${nav("/contact")}
<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  ${breadcrumb("Контакты")}
  <p class="eyebrow">Запросить демо</p>
  <h1>Покажем агента <span class="grad">на ваших задачах.</span></h1>
  <p class="lead">Оставьте контакты — вернёмся в течение рабочего дня и проведём демо за 30 минут.</p>
  <div class="contact-grid" style="margin-top:40px">
    <form class="form" id="demoForm">
      <div class="row">
        <label>Имя<input name="name" required autocomplete="name" placeholder="Ваше имя" /></label>
        <label>Компания<input name="company" autocomplete="organization" placeholder="Компания" /></label>
      </div>
      <div class="row">
        <label>Email<input type="email" name="email" required autocomplete="email" placeholder="you@company.ru" /></label>
        <label>Телефон<input type="tel" name="phone" autocomplete="tel" placeholder="+7 ..." /></label>
      </div>
      <label>Задача<textarea name="message" rows="4" placeholder="Что хотите автоматизировать?"></textarea></label>
      <button type="submit" class="btn btn-primary btn-lg">Отправить запрос</button>
      <p id="formOk" hidden style="color:var(--cyan-br)">Спасибо! Открываем почтовый клиент — письмо уже готово к отправке.</p>
    </form>
    <div class="contact-info">
      <h3>Связаться напрямую</h3>
      <dl>
        <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
        <div><dt>Сайт</dt><dd>virtum.ru</dd></div>
        <div><dt>Демо</dt><dd>30 минут на ваших задачах</dd></div>
        <div><dt>Данные</dt><dd>Хранение в ЕС · 152-ФЗ · GDPR</dd></div>
      </dl>
    </div>
  </div>
</div></section>
</main>`);

/* ============================ USE-CASE SUBPAGES ============================ */
mkdirSync(ROOT + "use-cases", { recursive: true });
const USE_CASES = [
  { slug: "sales", crumb: "Продажи", title: "ИИ-агент для продаж и квалификации лидов — Virtum",
    desc: "ИИ-агент Virtum мгновенно отвечает на заявки, квалифицирует лиды по вашим критериям и передаёт «тёплого» клиента менеджеру с контекстом. Выше конверсия, ни одной потерянной заявки.",
    h1: 'ИИ-агент для <span class="grad">продаж и квалификации лидов.</span>', h1p: "ИИ-агент для продаж и квалификации лидов",
    lead: "Отвечает на заявку за секунды, задаёт ваши квалифицирующие вопросы и отдаёт менеджеру готовую карточку лида — а не обещание перезвонить.",
    steps: [["Захват", "Мгновенно отвечает на заявку с сайта, звонка или сообщения, пока интерес горячий."], ["Квалификация", "Задаёт ваши вопросы: бюджет, потребность, сроки, география."], ["Передача", "Отдаёт «тёплого» лида менеджеру с полным контекстом диалога."], ["Возврат", "Догревает и возвращает тех, кто не дошёл до сделки."]],
    benefits: [["Скорость", "Ответ за секунды повышает конверсию из заявки в диалог."], ["Без потерь", "Ни одна заявка не остаётся без ответа ночью и в выходные."], ["Контекст", "Менеджер получает карточку лида, а не «перезвоните позже»."]],
    faq: [["Как агент квалифицирует лида?", "По вашим критериям — бюджет, потребность, сроки, география. Вопросы и правила маршрутизации настраиваете вы."], ["Куда попадают лиды?", "В вашу CRM или выбранный канал — с полным контекстом диалога."]] },
  { slug: "support", crumb: "Поддержка", title: "ИИ-агент поддержки клиентов 24/7 — Virtum",
    desc: "ИИ-агент Virtum отвечает на обращения по вашим регламентам круглосуточно, сообщает статусы заказов, решает типовые вопросы и эскалирует сложные случаи специалисту.",
    h1: 'Поддержка клиентов <span class="grad">24/7 — без очереди.</span>', h1p: "ИИ-агент поддержки клиентов 24/7",
    lead: "Снимает с команды поток типовых вопросов, отвечает по регламентам и передаёт человеку только то, что действительно требует человека.",
    steps: [["Приём", "Принимает обращение в любом канале без ожидания и очереди."], ["Ответ", "Отвечает по вашим регламентам и базе знаний, проверяет статусы."], ["Эскалация", "Сложные случаи передаёт специалисту с историей диалога."], ["Аналитика", "Показывает, о чём спрашивают чаще всего и где теряете клиентов."]],
    benefits: [["Ниже нагрузка", "Команда занимается сложным, а не повторами."], ["Всегда на связи", "Одинаковое качество в 2 ночи и в 2 дня."], ["Меньше ошибок", "Ответы из единого источника, без расхождений."]],
    faq: [["Агент заменяет операторов?", "Нет — снимает рутину и эскалирует сложное человеку с контекстом."], ["Откуда агент берёт ответы?", "Из вашей базы знаний, регламентов и данных о заказах."]] },
  { slug: "bookings", crumb: "Бронирования", title: "ИИ-агент для бронирований и записи — Virtum",
    desc: "ИИ-агент Virtum проверяет доступность, бронирует номера, столы и услуги, записывает на приём и отправляет подтверждения — в телефоне, чате и на сайте, 24/7.",
    h1: 'Бронирования и записи <span class="grad">прямо в диалоге.</span>', h1p: "ИИ-агент для бронирований и записи",
    lead: "Отели, рестораны, клиники и сервисные команды: агент проверяет доступность, подтверждает запись и напоминает о визите — без звонков и ожидания.",
    steps: [["Запрос", "Гость пишет или звонит в удобное время и в удобном канале."], ["Проверка", "Агент сверяет доступность по вашему календарю и правилам."], ["Подтверждение", "Бронирует, фиксирует и отправляет подтверждение на почту и SMS."], ["Напоминание", "Напоминает о визите и сокращает неявки."]],
    benefits: [["Больше броней", "Принимает заявки 24/7, даже когда стойка занята."], ["Меньше неявок", "Автоматические напоминания и подтверждения."], ["Единый календарь", "Записи попадают в вашу систему без ручного ввода."]],
    faq: [["С какими календарями работает?", "С вашей системой бронирований и календарями — через интеграции."], ["Можно ли отменить или перенести?", "Да — агент обрабатывает отмены и переносы по вашим правилам."]] },
  { slug: "orders", crumb: "Заказы", title: "ИИ-агент для заказов и каталога — Virtum",
    desc: "ИИ-агент Virtum оформляет заказы в диалоге, проверяет наличие, предлагает допродажи и передаёт заказ в работу — в любом канале, на 20+ языках.",
    h1: 'Заказы и каталог <span class="grad">без ручного ввода.</span>', h1p: "ИИ-агент для заказов и каталога",
    lead: "Ритейл, e-commerce и доставка: агент принимает заказ в разговоре, проверяет наличие, делает допродажи и отправляет заказ в вашу систему.",
    steps: [["Подбор", "Помогает выбрать товар, отвечает по характеристикам и наличию."], ["Оформление", "Собирает заказ, адрес и способ доставки прямо в диалоге."], ["Допродажа", "Предлагает сопутствующее по вашим правилам."], ["Передача", "Отправляет заказ в POS/ERP и подтверждает клиенту."]],
    benefits: [["Больше заказов", "Приём заказов в любом канале и в любое время."], ["Меньше ошибок", "Структурированный заказ без ручного ввода."], ["Выше чек", "Допродажи в каждом диалоге."]],
    faq: [["Куда уходит заказ?", "В вашу систему — POS, ERP или выбранный канал — через интеграции."], ["Проверяет ли агент наличие?", "Да, по вашим данным о складе и каталоге."]] },
];
const ucBody = (u) => `${nav("/use-cases")}
<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  ${breadcrumb(`<a href="/use-cases">Сценарии</a><span>/</span>${u.crumb}`)}
  <p class="eyebrow">Сценарий</p>
  <h1>${u.h1}</h1>
  <p class="lead">${u.lead}</p>
  <div class="phero-actions"><a href="/contact" class="btn btn-primary btn-lg">Запросить демо</a><a href="/use-cases" class="btn btn-ghost btn-lg">Все сценарии</a></div>
</div></section>
<section class="section"><div class="wrap">
  <p class="eyebrow reveal">Как это работает</p>
  <h2 class="reveal" data-delay="60">От первого сообщения до результата</h2>
  <div class="steps">${u.steps.map((s, i) => `<div class="step reveal" data-delay="${i * 80}"><span class="num">0${i + 1}</span><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join("")}</div>
</div></section>
<section class="section alt"><div class="wrap">
  <p class="eyebrow reveal">Зачем</p>
  <h2 class="reveal" data-delay="60">Что вы получаете</h2>
  <div class="cards">${u.benefits.map((b, i) => `<article class="card reveal" data-delay="${i * 70}"><h3>${b[0]}</h3><p>${b[1]}</p></article>`).join("")}</div>
</div></section>
<section class="section"><div class="wrap">
  <p class="eyebrow reveal">Вопросы</p><h2 class="reveal" data-delay="60">Частые вопросы</h2>
  <div class="faq reveal">${u.faq.map((f) => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("")}</div>
</div></section>
${cta('Соберём агента под <span class="grad">этот сценарий.</span>', "Покажем на ваших задачах за 30 минут.")}
</main>`;
for (const u of USE_CASES) write(`use-cases/${u.slug}.html`, `/use-cases/${u.slug}`, u.title, u.desc,
  [crumbs([{ t: "Главная", h: "/" }, { t: "Сценарии", h: "/use-cases" }, { t: u.crumb, h: `/use-cases/${u.slug}` }]),
   { "@type": "Service", name: u.h1p, provider: { "@id": SITE.url + "/#org" }, areaServed: "RU", description: u.desc },
   { "@type": "FAQPage", mainEntity: u.faq.map((f) => ({ "@type": "Question", name: f[0], acceptedAnswer: { "@type": "Answer", text: f[1] } })) }],
  ucBody(u));

/* ============================ PRICING ============================ */
const tier = (name, price, note, feats, hl) => `<article class="card reveal${hl ? " " : ""}" ${hl ? 'style="border-color:var(--cyan-dk);box-shadow:0 22px 50px -24px #00b4cc55"' : ""}>
  <h3>${name}</h3><p class="muted" style="margin:2px 0 14px">${note}</p>
  <p style="font-family:Unbounded;font-size:1.5rem;color:var(--ink)">${price}</p>
  <ul style="list-style:none;margin:16px 0 0;display:grid;gap:9px">${feats.map((f) => `<li style="padding-left:22px;position:relative"><svg class="ck" viewBox="0 0 24 24" style="position:absolute;left:0;top:3px"><path d="M5 12l4 4L19 6"/></svg>${f}</li>`).join("")}</ul>
  <a href="/contact" class="btn ${hl ? "btn-primary" : "btn-ghost"}" style="margin-top:20px;width:100%">Запросить расчёт</a></article>`;
write("pricing.html", "/pricing",
  "Тарифы Virtum — стоимость ИИ-агентов для бизнеса",
  "Тарифы Virtum: от одного канала до корпоративного развёртывания с мультилокальностью и SLA. Стоимость зависит от объёма диалогов и каналов — запросите расчёт.",
  [crumbs([{ t: "Главная", h: "/" }, { t: "Тарифы", h: "/pricing" }]),
   { "@type": "FAQPage", mainEntity: [
     { "@type": "Question", name: "От чего зависит стоимость?", acceptedAnswer: { "@type": "Answer", text: "От объёма диалогов, числа каналов и нужных интеграций. Рассчитываем под ваш сценарий." } },
     { "@type": "Question", name: "Есть ли тест?", acceptedAnswer: { "@type": "Answer", text: "Да — проводим демо на ваших задачах и показываем агента до старта." } }] }],
  `${nav("/pricing")}
<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  ${breadcrumb("Тарифы")}
  <p class="eyebrow">Тарифы</p>
  <h1>Стоимость зависит от <span class="grad">объёма и задач.</span></h1>
  <p class="lead">Платите за результат, а не за лицензии. Рассчитаем тариф под ваши каналы, объём диалогов и интеграции.</p>
</div></section>
<section class="section"><div class="wrap"><div class="cards">
  ${tier("Старт", "по запросу", "Для одной команды или точки", ["1 канал на выбор", "База знаний и регламенты", "Записи и заявки", "Email-подтверждения"], false)}
  ${tier("Бизнес", "по запросу", "Все каналы и интеграции", ["Все 5 каналов, единая память", "CRM и POS-интеграции", "Аналитика диалогов", "Маршрутизация и эскалация"], true)}
  ${tier("Корпоративный", "индивидуально", "Мультилокальность и SLA", ["Множество объектов и команд", "Выделенный менеджер и SLA", "Расширенная безопасность", "Приоритетная поддержка"], false)}
</div>
<p class="section-foot reveal center">Не уверены, что подойдёт? <a class="more" href="/contact">Запросите расчёт</a> — подберём под ваш сценарий.</p>
</div></section>
${cta('Узнайте стоимость <span class="grad">под ваши задачи.</span>', "Рассчитаем тариф и покажем демо за 30 минут.")}
</main>`);

/* ============================ INTEGRATIONS ============================ */
const intg = (t, d) => `<article class="card reveal"><h3>${t}</h3><p>${d}</p></article>`;
write("integrations.html", "/integrations",
  "Интеграции Virtum — CRM, телефония, POS, календари",
  "Virtum подключается к телефонии, CRM, службам поддержки, POS, календарям бронирований и бизнес-приложениям — и переносит результат диалога прямо в ваши системы.",
  [crumbs([{ t: "Главная", h: "/" }, { t: "Интеграции", h: "/integrations" }])],
  `${nav("/integrations")}
<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  ${breadcrumb("Интеграции")}
  <p class="eyebrow">Интеграции</p>
  <h1>Работает с системами, <span class="grad">в которых вы уже работаете.</span></h1>
  <p class="lead">Агент не живёт отдельно: он берёт данные из ваших систем и возвращает результат диалога туда же — без двойного ввода.</p>
  <div class="phero-actions"><a href="/contact" class="btn btn-primary btn-lg">Обсудить интеграцию</a></div>
</div></section>
<section class="section"><div class="wrap"><div class="cards">
  ${intg("Телефония и колл-центр", "Приём и совершение звонков, перевод на специалиста, запись разговоров.")}
  ${intg("CRM", "Лиды, контакты и сделки попадают в CRM с контекстом диалога.")}
  ${intg("Службы поддержки", "Создание и обновление обращений, статусы и эскалация.")}
  ${intg("POS и бронирования", "Заказы и брони уходят в вашу кассовую систему и календарь.")}
  ${intg("Календари", "Проверка доступности, запись, переносы и напоминания.")}
  ${intg("Бизнес-приложения", "Базы знаний, ERP и внутренние сервисы через API.")}
</div>
<p class="section-foot reveal center">Нужной интеграции нет в списке? <a class="more" href="/contact">Напишите нам</a> — подключим под ваш стек.</p>
</div></section>
${cta('Подключим Virtum к <span class="grad">вашему стеку.</span>', "Расскажите, какие системы используете — покажем, как это работает.")}
</main>`);

/* ============================ 404 ============================ */
writeFileSync(ROOT + "404.html", head({ title: "Страница не найдена — Virtum", desc: "Страница не найдена.", slug: "/404", ld: [] }) +
  `${nav("")}<main><section class="phero"><div class="glow"></div><div class="wrap" style="text-align:center">
  <h1 style="margin-top:30px">404</h1><p class="lead center">Такой страницы нет. Вернёмся на главную?</p>
  <div class="phero-actions" style="justify-content:center"><a href="/" class="btn btn-primary btn-lg">На главную</a></div>
</div></section></main>` + footer());

/* ============================ sitemap / robots / manifest ============================ */
const pages = ["/", "/platform", "/how-it-works", "/use-cases",
  "/use-cases/sales", "/use-cases/support", "/use-cases/bookings", "/use-cases/orders",
  "/pricing", "/integrations", "/security", "/contact"];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE.url}${p === "/" ? "/" : p}</loc><lastmod>${SITE.built}</lastmod><changefreq>monthly</changefreq><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`;
writeFileSync(ROOT + "sitemap.xml", sitemap);
writeFileSync(ROOT + "robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
writeFileSync(ROOT + "site.webmanifest", JSON.stringify({
  name: "Virtum", short_name: "Virtum", lang: "ru", theme_color: "#050E1C", background_color: "#050E1C",
  display: "standalone", start_url: "/", icons: [{ src: "/assets/logo.svg", sizes: "any", type: "image/svg+xml" }],
}, null, 2));

console.log("Generated:", pages.length, "pages + 404 + sitemap + robots + manifest");
