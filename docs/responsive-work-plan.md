# Responsive Work Plan — MALEA Landing

> Строго 7-этапный план приведения лендинга к корректному responsive-отображению.
> Этапы зафиксированы и не подлежат замене без утверждения.
> Статус: **предварительный аудит завершён, код не изменялся**.

---

## Stage 0 — Preparation / audit

**Без изменения кода.**

| # | Задача | Детали |
|---|---|---|
| 0.1 | Проверить актуальность [responsive-map.md](responsive-map.md) | Сверка всех 27 экранов с [`index.html`](../index.html) |
| 0.2 | Проверить актуальность [responsive-audit.md](responsive-audit.md) | Сверка брейкпоинтов с [`css/styles.css`](../css/styles.css) |
| 0.3 | Утвердить breakpoint system (см. [responsive-rules.md](responsive-rules.md)) | desktop 1101px+, tablet 761–1100px, mobile 521–760px, small mobile ≤520px, very small ≤380px |
| 0.4 | Создать задачи на Stage 1–6 в трекере | Каждый Stage — отдельная задача/PR |

**Что можно менять:** только markdown-документы в [docs/](docs/).

**Что нельзя менять:** [`index.html`](../index.html), [`css/styles.css`](../css/styles.css), [`js/script.js`](../js/script.js), любые ассеты.

**Критерии проверки:**
- Все документы в docs/ соответствуют исходным требованиям.
- Breakpoint system зафиксирована.

**Риски:** отсутствуют (изменения кода не производятся).

---

## Stage 1A — Viewport safety

Только viewport safety. Без изменения композиции, типографики и layout.

| # | Что правим | Где | Действие |
|---|---|---|---|
| 1A.1 | **full-screen sections** (`height: 100vh` / `min-height: 100vh`) | Все экранные секции с `100vh` | Заменить на fallback: `min-height: 100vh; min-height: 100svh;` |
| 1A.2 | **fixed overlays / modals** (`height: 100vh`) | `#videoModal`, `.vmodal-overlay`, `.modal-overlay`, `#mobileMenu`, `.nav-mobile-panel` | Заменить на `height: 100dvh; max-height: 100dvh;` |
| 1A.3 | **остальные `100vh`** | Все остальные вхождения | Проверить каждое вхождение вручную; **не делать автоматическую замену** всех `100vh` на `100dvh` |

**Важно:**
- Не делать слепую замену всех `100vh` на `100dvh`.
- Не менять композиции и типографику.
- Каждое изменение — точечная правка с проверкой контекста.

**Какие файлы можно менять:** только [`css/styles.css`](../css/styles.css) — точечные правки внутри существующих правил или в блоке `/* FINAL RESPONSIVE SYSTEM */`.

**Что нельзя менять:**
- Desktop-стили (выше 1100px).
- HTML-структуру секций.
- JS-функции.
- Типографику (font-size, line-height, letter-spacing).
- Layout (flex, grid, padding, margin, width, position).

**Критерии проверки:**
- На mobile (360–430px) full-screen секции не обрезаются адресной строкой браузера.
- Fixed overlays не выходят за нижнюю границу viewport.
- Desktop (1101px+) не изменился.

**Риски:**
- `100svh` не поддерживается в старых браузерах — проверить fallback-порядок.
- `100dvh` может вызвать скачки высоты при показе/скрытии адресной строки.

---

## Stage 1B — Responsive typography

Только mobile/tablet типографика. Без изменения layout. Desktop-типографика не меняется.

> **Запрещено** использовать широкие глобальные селекторы: `h2`, `.screen h2`, `p`, `.btn`.
> Все responsive-правила типографики — только через точные scoped-селекторы конкретных экранов.

| # | Что правим | Целевые селекторы (только scoped) | Действие |
|---|---|---|---|
| 1B.1 | **Заголовки секций** | `.identity-headline`, `.formats-main-title`, `.why-title-main`, `.musicians-title`, `.egypt-title`, `.portfolio-title`, `.final-experience-title` | Уменьшить `font-size` на mobile (521–760px) и small mobile (≤520px); проверить `clamp()` |
| 1B.2 | **Ceremonial titles** | `.ceremonial-title` (если есть), крупные декоративные заголовки | Адаптировать размер под mobile, не ломать перенос строк |
| 1B.3 | **Card titles** | `.mg-card .mg-caption`, `.video-card .video-card-title`, `.format-line-content`, `.why-argument-header`, `.pm-col-header`, `.track-col h3` | Уменьшить `font-size`, проверить переполнение |
| 1B.4 | **Body text** | `.text`, `.intro-desc`, `.identity-text p`, `.live-text-left p`, `.philosophy-right p`, `.egypt-copy p`, `.fi-desc p`, `.final-experience-text p`, `.hero-inner p` | `font-size: ≥14px` на mobile, проверить line-height |
| 1B.5 | **Quote text** | `.quote-text`, `.mq-text`, `.portfolio-quote-screen .portfolio-quote-inner p`, `.portfolio-quote-text` | Уменьшить `font-size`, сохранить читаемость |
| 1B.6 | **CTA / buttons** | `.hero-btn`, `.fi-cta .btn`, кнопки модалок | padding, font-size, min-width/tap target (≥44px) |
| 1B.7 | **Overline** | `.overline`, декоративные надписи над заголовками | Адаптировать размер |
| 1B.8 | **Live / Philosophy заголовки** | `#identity .identity-headline`, `#philosophy .philosophy-title`, `#live-text .live-title`, `#player .player-title`, `#performance .perf-title`, `#art .art-title`, `#musicians .musicians-title`, `#sensations .sens-title`, `#egypt .egypt-title` | Адаптировать `font-size` под mobile |

**Какие файлы можно менять:** только [`css/styles.css`](../css/styles.css) — новые правила в конец файла, в блок `/* FINAL RESPONSIVE SYSTEM */` (см. [responsive-rules.md](responsive-rules.md) п. 5).

**Какие селекторы можно менять:** только перечисленные выше (и вложенные в них). **Запрещены** глобальные `h2`, `.screen h2`, `p`, `.btn`, `body`, `section` без отдельного подтверждения.

**Что нельзя менять:**
- Desktop-стили (выше 1100px).
- HTML-структуру секций.
- JS-функции.
- Audio player, video modal, mobile menu, form modal.
- Существующие `font-size` на desktop.
- Layout (flex, grid, padding, margin, width).

**Критерии проверки:**
- На 375px body text ≥ 14px.
- Заголовки не переносятся некорректно.
- Кнопки имеют tap target ≥ 44px.
- Нет горизонтального скролла.
- Desktop (1101px+) не изменился.

**Риски:**
- `clamp()` может дать слишком малый размер на very small (≤380px) — проверять явно.
- Изменение `font-size` цитат может сломать преднамеренный дизайнерский размер.

---

## Stage 2 — Screens 01–06

Только responsive-правки для первых шести экранов.

| # | Экран | ID | Чувствительные элементы |
|---|---|---|---|
| 2.1 | 01 · intro | `#intro` | `.intro-content` — отступы, текст не переполняет |
| 2.2 | 02 · hero | `#hero` | `.hero-photo` — масштаб изображения; `.hero-btn` — размер, позиция |
| 2.3 | 03 · identity | `#identity` | Портрет (`.identity-portrait`), колонки текста (`.identity-text`), `.identity-titres` |
| 2.4 | 04 · philosophy | `#philosophy` | Flex-колонки `.philosophy-left` / `.philosophy-right` → stack на mobile |
| 2.5 | 05 · live-image | `#live-image` | `.live-bg` — фон, соотношение сторон |
| 2.6 | 06 · live-text | `#live-text` | `.live-text-left` / `.live-text-right` — stack; `.live-format-row` — сетка |

**Какие файлы можно менять:** только [`css/styles.css`](../css/styles.css) — новые правила в конец файла.

**Какие селекторы можно менять:** только селекторы внутри `#intro`, `#hero`, `#identity`, `#philosophy`, `#live-image`, `#live-text`.

**Что нельзя менять:**
- Desktop-стили (1101px+).
- JS-функции этих секций.
- HTML-структуру.
- Экран `#player` (audio), `#performance`/`#art` (video).
- Мобильное меню, форму.

**Критерии проверки:**
- Все 6 экранов корректно отображаются на 430px, 390px, 375px, 360px.
- Проверить на tablet 768 / 820 / 1024px (даже если tablet-layer будет Stage 6).
- Нет горизонтального скролла.
- Flex → stack работает без наложений.
- Desktop не изменился.

**Риски:**
- `.hero-photo` может потерять пропорции при `max-width: 100%`.
- `.identity-portrait` может быть слишком большим на mobile.

---

## Stage 3 — Media / video sections

Только responsive-правки для секций с видео.

| # | Экран | ID | Чувствительные элементы |
|---|---|---|---|
| 3.1 | 09 · performance | `#performance` | `.video-grid` (4 video-card) — сетка → stack; `.video-card` — размер |
| 3.2 | 10 · art | `#art` | `.art-wall` layout; `.art-featured` + `.art-mini-row` — stack |
| 3.3 | 17 · egypt-case | `#egypt-case` | `.egypt-inner` flex → stack; `.egypt-video` / `.egypt-video-vertical` — пропорции; `.egypt-list` — таймлайн |

**Важно:** не менять JS video modal.

**Какие файлы можно менять:** только [`css/styles.css`](../css/styles.css) — новые правила в конец файла.

**Какие селекторы можно менять:** только селекторы внутри `#performance`, `#art`, `#egypt-case`.

**Что нельзя менять:**
- `#videoModal`, `.vmodal-overlay`, `.video-modal-backdrop`, `.video-frame-wrap`.
- JS-функции: `openVideoModal()`, `closeVideoModal()`, `openInlineVideoModal()`, `closeInlineVideoModal()`.
- any `!important` в Egypt video-modal.
- Desktop-стили (1101px+).

**Критерии проверки:**
- Видео-сетка корректно отображается на mobile (1 колонка).
- Проверить на tablet 768 / 820 / 1024px (даже если tablet-layer будет Stage 6).
- Egypt-case: видео + текст в stack, таймлайн читаем.
- Видео-модалка открывается и закрывается корректно.
- Console без ошибок.

**Риски:**
- Изменение `.egypt-inner` flex может затронуть `!important` z-index.
- Видео iframe могут не адаптироваться к ширине — проверить aspect ratio.

---

## Stage 4 — Quotes / reviews / sensations

Только responsive-правки для секций с цитатами, отзывами и сенсациями.

| # | Экран | ID | Чувствительные элементы |
|---|---|---|---|
| 4.1 | 07 · quote | `#quote` | `.quote-text` — длинный текст, отступы |
| 4.2 | 15 · malea-quote | `#malea-quote-screen` | `.mq-text`, `.mq-inner` — padding, font-size |
| 4.3 | 13 · sensations | `#sensations` | `.sens-pills` (анимация marquee), `.sens-block` — отступы |
| 4.4 | 14 · reviews | `#reviews` | `.review-card` (4 карточки) — stack; `.photo-carousel` — не ломать JS карусель |
| 4.5 | 26 · portfolio-quote | `#portfolio-quote` | `.portfolio-quote-inner` — текст, 100vh → замена |

**Какие файлы можно менять:** только [`css/styles.css`](../css/styles.css) — новые правила в конец файла.

**Какие селекторы можно менять:** только селекторы внутри `#quote`, `#malea-quote-screen`, `#portfolio-quote`, `#sensations`, `#reviews`.

**Что нельзя менять:**
- `#photoCarousel`, `.photo-carousel`, `.photo-slide` — структура карусели (JS-зависима).
- JS-функции: `setPos()`, `#carouselPrev`/`#carouselNext`.
- `prefers-reduced-motion: reduce` правила.
- Desktop-стили (1101px+).

**Критерии проверки:**
- Цитаты читаемы на 375px.
- Проверить на tablet 768 / 820 / 1024px (даже если tablet-layer будет Stage 6).
- `.review-card` не перекрываются.
- Карусель работает (prev/next).
- Sensations marquee не обрезан.

**Риски:**
- `#sensations .sens-pills` — анимация может тормозить на слабых устройствах.
- `.photo-carousel` — изменение CSS может сломать JS-расчёты позиций.

---

## Stage 5 — Formats / why / portfolio / final

Только responsive-правки для оставшихся секций.

| # | Экран | ID | Чувствительные элементы |
|---|---|---|---|
| 5.1 | 18 · formats | `#formats` | `.formats-title-screen` — заголовок |
| 5.2 | 19 · formats-list | `#formats-list` | `.format-line` (4 flex-строки) → stack; `.format-line-specs` — характеристики |
| 5.3 | 20 · formats-integration | `#formats-integration` | `.fi-panels` (3 панели) → stack; `.fi-cta` — кнопка |
| 5.4 | 21 · why | `#why` | `.why-title-screen` — заголовок |
| 5.5 | 22 · why-image | `#why-image` | `.why-image-screen` — изображение |
| 5.6 | 23 · why-argument | `#why-argument` | `.why-argument-list` (3 аргумента) → stack |
| 5.7 | 24 · portfolio | `#portfolio` | `.portfolio-hero-inner` flex → stack |
| 5.8 | 25 · portfolio-map | `#portfolio-map` | `.pm-grid` (3 колонки) → stack |
| 5.9 | 27 · final-experience | `#final-experience` | `.final-experience-inner` flex → stack; изображение |

**Какие файлы можно менять:** только [`css/styles.css`](../css/styles.css) — новые правила в конец файла.

**Какие селекторы можно менять:** только селекторы внутри указанных секций.

**Что нельзя менять:**
- Desktop-стили (1101px+).
- JS-функции.
- HTML-структуру.

**Критерии проверки:**
- Все flex → stack работают без наложений.
- Нет горизонтального скролла.
- Все 9 экранов корректны на 430px, 390px, 375px, 360px.
- Проверить на tablet 768 / 820 / 1024px (даже если tablet-layer будет Stage 6).
- Desktop не изменился.

**Риски:**
- `.pm-grid` (3 колонки) → stack может потерять иерархию (заголовки колонок).
- `.format-line-specs` — мелкие спецификации могут быть нечитаемы.

---

## Stage 6 — Tablet layer

Специфический слой для планшетов.

| # | Действие | Детали |
|---|---|---|
| 6.1 | Создать блок `@media (min-width: 761px) and (max-width: 1100px)` | Tablet-специфичные стили |
| 6.2 | Проверить все 27 экранов на 768px, 820px, 1024px | Корректность отображения |
| 6.3 | Устранить конфликты между mobile и tablet правилами | Приоритет tablet-слоя |
| 6.4 | Проверить навигацию в tablet-диапазоне | Десктопное меню vs mobile menu |

**Какие файлы можно менять:** только [`css/styles.css`](../css/styles.css) — новые правила в конец файла.

**Какие селекторы можно менять:** любые, но только внутри `@media (min-width: 761px) and (max-width: 1100px)`.

**Что нельзя менять:**
- Правила для desktop (1101px+) и mobile (≤760px).
- JS.
- HTML.

**Критерии проверки:**
- Все 27 экранов корректны на 1024px (iPad Pro), 820px (iPad Air), 768px (iPad Mini).
- Нет дублирования с mobile-правилами.
- Нет горизонтального скролла.
- Навигация работает (десктопное меню или mobile-menu в зависимости от порога).

**Риски:**
- Конфликт с существующими `max-width: 760px` и `max-width: 980px` правилами в CSS.
- Tablet может случайно получить mobile-стили, если не задать явный `min-width: 761px`.

---

## Порядок выполнения

```
Stage 0 ───────── Preparation / audit (без изменений кода)
   │
   ▼
Stage 1A ──────── Viewport safety (1 день)
   │
   ▼
Stage 1B ──────── Responsive typography (1 день)
   │
   ▼
Stage 2 ───────── Screens 01–06 (2 дня)
   │
   ▼
Stage 3 ───────── Media / video sections (1 день)
   │
   ▼
Stage 4 ───────── Quotes / reviews / sensations (1 день)
   │
   ▼
Stage 5 ───────── Formats / why / portfolio / final (2 дня)
   │
   ▼
Stage 6 ───────── Tablet layer (1 день)
```

**Общая оценка:** ~9 рабочих дней при full-time работе одного разработчика.

> ⚠️ **Важно:** этапы должны выполняться последовательно. Stage 6 — только после завершения Stage 1–5. Каждый этап — отдельный PR с проверкой по чеклисту [responsive-rules.md](responsive-rules.md).

> ⚠️ **Принцип:** не чинить mobile хаотично внутри секций. Все новые adaptive-правки добавлять только в финальный responsive-layer в конце [`css/styles.css`](../css/styles.css) (см. [responsive-rules.md](responsive-rules.md) п. 5).
