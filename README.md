# Virtum — корпоративный сайт

Статический многостраничный сайт (HTML/CSS/JS, без сборки). ИИ-агенты для корпоративного бизнеса.

- **Стек:** чистый HTML + CSS + JS, генерация страниц через `build.mjs` (Node).
- **SEO:** отдельный URL на каждую страницу, уникальные meta/OG/canonical, JSON-LD, `sitemap.xml`, `robots.txt`.
- **Деплой:** статика, готова к Vercel (см. `vercel.json`).

## Разработка
```bash
node build.mjs            # пересобрать HTML/sitemap/robots
python3 -m http.server 8080   # предпросмотр на http://localhost:8080
```

## Деплой на Vercel
Импортируйте репозиторий на vercel.com → Framework: **Other** → Build/Output: пусто. `vercel.json` уже настроен (cleanUrls).
