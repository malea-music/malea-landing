# Технический аудит MALEA Landing

> **Дата:** 2026-05-29  
> **Ветка:** dev  
> **Тип аудита:** Read-only. Без изменений кода.  
> **Объём:** index.html (1199 стр.), css/styles.css (14414 стр.), css/tablet-portrait-overrides.css (2042 стр.), js/script.js (778 стр.)

---

## A. Подключение файлов и структура документа

### A.1 CSS-подключения (index.html:7-9)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/tablet-portrait-overrides.css">
```

**Порядок загрузки:** Google Fonts → css/styles.css → css/tablet-portrait-overrides.css

**Найден, но НЕ подключён:** `css/tablet-portrait-overrides.clean-candidate.css` — существует на диске, но не указан в `<head>`. Вероятно, черновик будущей очищенной версии оверрайдов.

### A.2 JS-подключение (index.html:1196)

```html
<script src="js/script.js"></script>
```

- Единственный JS-файл, подключён в конце `<body>`.
- Никаких inline-скриптов, внешних библиотек (jQuery, GSAP и т.д.) — vanilla JS.
- Никаких атрибутов `defer` / `async`.

### A.3 Структура `<head>` (index.html:3-14)

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MALEA</title>
```

- Минимальный `<head>`: нет Open Graph, favicon, meta-описания, Theme Color.
- Нет `<base>` — все URL относительные.

### A.4 Блоки за пределами секций (flow-контейнеры)

| Контейнер | Строки | Содержимое |
|-----------|--------|------------|
| `.experience-flow` | 257-447 | #player (08), #performance (09), #art (10) |
| `.reviews-flow` | 527-627 | #sensations (13), #reviews (14), #malea-quote-screen (15) |
| `.formats-flow` | 698-883 | #formats (18), #formats-list (19), #formats-integration (20) |
| `.portfolio-flow` | 961-1102 | #portfolio (24), #portfolio-map (25), #portfolio-quote (26) |
| `.vmodal-overlay` | 450-457 | #videoModal (глобальный компонент, вне flow) |
| `<footer>` | 1134-1172 | #site-footer |
| `.modal-overlay` | 1178-1190 | #modalOverlay — контактная форма |

**4 flow-контейнера** группируют экраны в логические блоки. Это важно для CSS-стилизации (наследование, контекст).

---

## B. Карта экранов (Screen Map)

| # | ID | Название | Строки HTML | CSS (styles.css) | CSS (override) | JS-зависимость | Статус |
|---|----|----------|-------------|------------------|----------------|----------------|--------|
| 01 | `#intro` | intro | 61-73 | Zone A: `.screen`, `#intro` | — | `refreshNav()` (скрытие nav) | ✅ |
| 02 | `#hero` | hero | 79-99 | Zone A: `#hero` | Есть (brightening) | `syncHeroButtonWidth()` | ✅ |
| 03 | `#identity` | identity | 105-133 | Zone A: `#identity` | Есть (full-screen) | — | ✅ |
| 04 | `#philosophy` | philosophy | 139-162 | Zone A, Zone B: 04 | Есть (заявлен) | — | ✅ |
| 05 | `#live-image` | live-image | 168-176 | Zone A: `#live-image` | — | — | ✅ |
| 06 | `#live-text` | live-text | 182-232 | Zone A, Zone B: 06 | Есть (заявлен) | — | ✅ |
| 07 | `#quote` | quote | 238-251 | Zone A: `#quote` | — | — | ✅ |
| 08 | `#player` | player | 259-333 | Zone A, Zone B: 08 | Есть (заявлен) | `playNewTrack()`, `startTick()`, `seekAudioToRatio()`, `clearActive()`, `openVideoModal()` | ✅ |
| 09 | `#performance` | performance | 339-389 | Zone A, Zone B: 09 (H) | Есть (заявлен) | `openInlineVideoModal()` | ⚠️ heading hack |
| 10 | `#art` | art | 394-445 | Zone A, Zone B: 10 (H2) | — | `openInlineVideoModal()` | ✅ |
| 11 | `#musicians` | musicians | 463-476 | Zone A | — | — | ✅ |
| 12 | `#musicians-gallery` | musicians-gallery | 479-525 | Zone A | Есть (rail fix) | — | ✅ |
| 13 | `#sensations` | sensations | 529-561 | Zone A | — | — | ✅ |
| 14 | `#reviews` | reviews | 567-602 | Zone A, Zone B: 14 (I/J) | Есть (заявлен) | `moveCarousel()`, `scheduleSnap()` | ✅ |
| 15 | `#malea-quote-screen` | malea-quote | 608-625 | Zone A | — | — | ✅ |
| 16 | `#egypt` | egypt | 633-642 | Zone A | — | `openEgyptVideo` (inline) | ✅ |
| 17 | `#egypt-case` | egypt-case | 644-692 | Zone A | — | `openInlineVideoModal()` | ✅ |
| 18 | `#formats` | formats | 700-709 | Zone A | — | — | ✅ |
| 19 | `#formats-list` | formats-list | 710-831 | Zone A, Zone B: 19 | Есть (заявлен) | — | ✅ |
| 20 | `#formats-integration` | formats-integration | 833-882 | Zone A, Zone B: 20 | Есть (заявлен) | — | ✅ |
| 21 | `#why` | why | 889-898 | Zone A | — | — | ✅ |
| 22 | `#why-image` | why-image | 900-904 | Zone A | — | — | ✅ |
| 23 | `#why-argument` | why-argument | 906-958 | Zone A, Zone B: 23 | Есть (заявлен) | — | ⚠️ неисп. селектор |
| 24 | `#portfolio` | portfolio | 963-984 | Zone A | — | — | ✅ |
| 25 | `#portfolio-map` | portfolio-map | 986-1087 | Zone A, Zone B: 25 (N2) | Есть (grid fix) | `initPortfolioMapReveal()` | ✅ |
| 26 | `#portfolio-quote` | portfolio-quote | 1089-1100 | Zone A | — | — | ✅ |
| 27 | `#final-experience` | final-experience | 1104-1132 | Zone A, Zone B: 27 (O/P3) | Есть (заявлен) | — | ✅ |
| — | `#site-footer` | footer | 1134-1172 | Zone A: `.ft`, `.ft-unified` | — | — | ✅ |

**Итого:** 27 экранов + footer. Все имеют CSS в Zone A. 14 экранов имеют дополнительные блоки в Zone B. 12 экранов имеют оверрайды в override-файле (по факту — 14-15, т.к. override покрывает больше экранов, чем заявлено в его шапке).

---

## C. Responsive-архитектура

### C.1 Обнаруженные breakpoint-слои

| Слой | Условие | Где определён |
|------|---------|---------------|
| Mobile | `max-width: 760px` | Zone B: Stage 1B |
| Tablet Portrait | `min-width: 761px` and `max-width: 1366px` + `orientation: portrait` | Zone B: Stage 1C + override-файл |
| Tablet Landscape | `min-width: 961px` and `max-width: 1366px` + `orientation: landscape`, часто с `hover: none` / `pointer: coarse` | Zone B: Stage V3 |
| Desktop | `min-width: 961px` + `hover: hover` | Zone B: Stage 1D (остаточный) |

### C.2 Особенности responsive-слоёв

#### Mobile (≤760px)
- Определён в Zone B: Stage 1B (строки ~5602-5900)
- Минимальная стилизация: заголовки, стекинг колонок, базовые отступы
- Нет оверрайдов — override-файл работает только от 761px

#### Tablet Portrait (761-1100 / 1366px + portrait)
- Основной целевой слой override-файла
- Условие: `@media (min-width: 761px) and (max-width: 1366px) and (orientation: portrait)`
- В Zone B также есть блоки TP-1, TP-1.1, TP-2A, TP-2A.1 — это **легаси-блоки**, которые override переопределяет через `!important`
- **Проблема:** верхняя граница (1366px) широка — захватывает часть landscape. Это намеренно: некоторые планшеты в портрете имеют ширину >1100px (iPad Pro 12.9").

#### Tablet Landscape (961-1366px + landscape)
- Определён в Zone B: Stage «Tablet Landscape V3» (строки ~13900-14414)
- Селекторы с `hover: none` and `pointer: coarse` — попытка отловить планшеты в ландшафте
- **Риск:** новые девайсы с большим DPR могут не попасть под селекторы

#### Desktop (≥961px + hover:hover)
- Остаточный слой: всё, что не переопределено под планшеты
- Не имеет явного общего медиа-блока — работает как базовые стили Zone A + Zone B Stage 1D

### C.3 Проблемы responsive-архитектуры

1. **Три перекрывающихся слоя для планшетов:** Zone B TP-1/2 (легаси), override-файл (актуальный), Zone B V3 (tablet landscape). Легаси-блоки в Zone B уже не должны применяться, но они всё ещё в коде и могут сработать при неправильном порядке.
2. **800+ `!important`** в override-файле — индикатор того, что оверрайд «борется» с легаси-стилями, а не работает как основной слой.
3. **Нет mobile-first подхода:** база — это desktop, мобильные и планшетные стили — оверрайды сверху.
4. **Десктоп не имеет изолированного медиа-блока** — это делает его уязвимым к случайным переопределениям.

---

## D. Состояние CSS (styles.css)

### D.1 Архитектура — Zone A vs Zone B

Файл чётко разделён на две зоны:

```
⚡ ZONE A — FOUNDATION (строки 1-5601)
├── Fonts / Variables
├── Typography (h1-h6, p, links)
├── Reset / Normalize
├── Navigation (nav, nav-mobile-panel)
├── Shared utilities (containers, spacers)
├── Screens 01-27 (базовая стилизация каждого экрана)
├── Footer (ft, ft-unified)
├── Video modal (vmodal-overlay, inline video)
├── Mobile menu (nav-mobile-panel)
└── Unified headings (h2-zone)

⚡ ZONE B — FINAL RESPONSIVE SYSTEM (строки 5602-14414)
├── Stage 1A — Viewport safety
├── Stage 1B — Mobile (≤760px)
├── Stage 1C — Tablet Portrait base
├── Stage 1D — Desktop final
├── Stage 2 — Screens 01-06 responsive
├── Stage 2V — QA
├── Stage D — Hero high-risk
├── Stage E — Identity
├── Stage G — Performance
├── Stage H — Performance/Art
├── Stage H2 — Art
├── Stage I — Sensations
├── Stage J — Reviews
├── Stage K — Quote
├── Stage L — Why
├── Stage M — Live landscape
├── Stage N2 — Portfolio
├── Stage O — Final Experience
├── Stage P3 — Final Experience
├── Tablet Landscape V3
├── TP-1, TP-1.1, TP-2A, TP-2A.1 (LEGACY)
└── MISC
```

### D.2 Легаси-блоки Tablet Portrait в Zone B

Это критические зоны для рефакторинга:

| Блок | Строки (approx) | Статус |
|------|-----------------|--------|
| `TP-1` | ~10800-11300 | PARTLY_OVERRIDDEN — override-файл переопределяет большинство правил через `!important` |
| `TP-1.1` | ~11300-11700 | PARTLY_OVERRIDDEN — частично перекрыт |
| `TP-2A` | ~11700-12500 | PARTLY_OVERRIDDEN — частично перекрыт |
| `TP-2A.1` | ~12500-12800 | PARTLY_OVERRIDDEN — частично перекрыт |

Эти блоки — **мёртвый груз**: они не должны применяться, но всё ещё в CSS. Их удаление требует осторожности, т.к. override-файл зависит от них как от baseline (override-файл переопределяет, а не заменяет).

### D.3 `!important` конфликты

- **494 unique `!important`** в styles.css
- **800+ `!important`** в override-файле
- Наибольшая концентрация: секции #performance, #player, #hero — где легаси TP-блоки особенно агрессивны
- Типичный паттерн конфликта: `font-size`, `line-height`, `padding`, `margin`, `gap` — одни и те же свойства переопределяются в трёх местах

### D.4 Ключевые JS-зависимые CSS-классы

| Класс | Где используется | Функция |
|-------|-----------------|---------|
| `.is-hidden` | `#mainNav` | `refreshNav()` — скрытие nav на intro |
| `.is-open` | `.nav-mobile-panel` | `openMobileMenu/closeMobileMenu/toggleMobileMenu` |
| `.is-active` | `.track-col` | `clearActive/playNewTrack` — активный трек плеера |
| `.is-playing` | `.track-col` | `startTick/stopTick` — анимация проигрывания |
| `.is-spinning` | `.player-cd-wrap` | `startTick` — вращение CD |
| `.pm-motion-ready` | `.pm-grid .pm-col` | `initPortfolioMapReveal` — анимация колонок |
| `.pm-inview` | `.pm-grid .pm-col` | `initPortfolioMapReveal` — колонка стала видима |
| `.video-modal-host` | (создаётся JS) | `openInlineVideoModal` — контейнер инлайн-видео |
| `.is-video-modalized` | видео-карточки | `openInlineVideoModal` — маркер активации |

**⚠️ Риск:** при изменении CSS-классов (рефакторинг) нужно синхронизировать изменения с JS.

### D.5 Навигация и мобильное меню

| Компонент | Селектор | Зависимость |
|-----------|----------|-------------|
| Desktop nav | `.nav`, `.nav-links` | CSS only |
| Mobile toggle | `.nav-menu-toggle` | JS: `openMobileMenu/closeMobileMenu/toggleMobileMenu` |
| Mobile panel | `.nav-mobile-panel` | JS + CSS (transform/opacity) |
| Mobile links | `.nav-mobile-links` | CSS only |

- Nav скрыт по умолчанию (`.is-hidden`), показывается JS при скролле мимо intro.
- Мобильное меню управляется атрибутами `aria-expanded`, `aria-hidden` — это хорошо.

### D.6 Плеер (аудио)

| Компонент | Описание |
|-----------|----------|
| `.track-col` | Колонка трека (3 шт.) |
| `.track-footer` | Инфо + кнопка плей |
| `.player-cd-wrap` | Анимированный CD-диск (`#playerCD`) |
| `.player-cd-outer` | Контейнер CD |
| Waveform | Динамически строится JS из `WAVE_DATA` |

- Волны строятся из предопределённых массивов (не API).
- CD-спин анимируется через `@keyframes cd-spin`.
- Нет визуального плейлиста — только 3 трека, управление через JS.

### D.7 Видео-система

Два пути воспроизведения:

1. **Легаси-оверлей:** `#videoModal`, `.vmodal-overlay` — iframe в модалке (CSS static)
2. **Инлайн-путь:** `openInlineVideoModal()` — создаёт `.video-modal-host` внутри `.video-card`, заменяет превью на iframe

Все видео через Kinescope.io embed.

---

## E. Состояние CSS (tablet-portrait-overrides.css)

### E.1 Общая статистика

- **Всего строк:** ~2042
- **`!important`:** 800+
- **Медиа-условие:** `(min-width: 761px) and (max-width: 1366px) and (orientation: portrait)`
- **Заявленное покрытие (шапка):** screens 04, 06, 08, 09, 14, 19, 20, 23, 27
- **Фактическое покрытие:** screens 03, 04, 06, 08, 09, 12, 14, 19, 20, 23, 25, 27 + nav + hero

### E.2 Фактическое покрытие экранов

| Экран | ID | CSS-блок | Назначение |
|-------|----|----------|------------|
| 02 | `#hero` | hero brightening | Повышение яркости фото на тёмных планшетах |
| 03 | `#identity` | identity full-screen | Фикс full-screen разворота |
| 04 | `#philosophy` | philosophy | Базовая перекомпоновка |
| 06 | `#live-text` | live-text | Перестройка колонок |
| 08 | `#player` | player | Перекомпоновка плеера |
| 09 | `#performance` | performance | **Heading hack** (см. E.3) |
| 12 | `#musicians-gallery` | mg-card rail | Фикс горизонтального скролла |
| 14 | `#reviews` | reviews | Перестройка карусели |
| 19 | `#formats-list` | formats-list | Отступы и сетка |
| 20 | `#formats-integration` | fi-panels | Перекомпоновка панелей |
| 23 | `#why-argument` | why-argument | **Неиспользуемый селектор** (см. E.4) |
| 25 | `#portfolio-map` | pm-grid | Фикс grid-раскладки |
| 27 | `#final-experience` | final-experience | Перекомпоновка |
| — | nav / hero | .nav, #hero | Мелкие правки |

### E.3 ⚠️ #performance heading hack

```css
#performance .perf-inner > h2 { font-size: 0; }
#performance .perf-inner > h2::before {
  content: 'Выступления';
  /* ...полноценный стилизованный заголовок */
}
```

**Проблема:** Заголовок в HTML 1-го уровня (`<h2>...текст...</h2>`), но в CSS он заменяется через `::before`. Это означает:
- Оригинальный текст в HTML — это `"Выступления и инсталляции"`
- В CSS он заменён на `"Выступления"` (сокращённый вариант)
- Это **хрупкое решение**: любой рефакторинг заголовков сломает отображение
- Скринридеры прочитают оригинальный текст, но увидят нулевой font-size — плохо для доступности

### E.4 ⚠️ #why-argument мёртвый селектор

```css
/* FOR WHAT? */ #why-argument .why-argument-header:has(.why-argument-subtitle) { ... }
```

- Селектор существует с комментарием `FOR WHAT?` — разработчик не был уверен, зачем он нужен
- Стили (padding, margin-top) вероятно не применяются, т.к. другой блок оверрайда переопределяет их
- Требует проверки и удаления или документирования

### E.5 Дублирование с styles.css

Множество свойств в override-файле дублируют те же свойства из Zone B TP-блоков:

- `gap` для grid/flex контейнеров
- `font-size`, `line-height` для заголовков
- `padding`, `margin` для секций
- `max-width` для контейнеров

Это следствие того, что override-файл был написан **поверх** TP-блоков без их удаления.

### E.6 clean-candidate

На диске есть `tablet-portrait-overrides.clean-candidate.css` — версия, где `!important` удалены. Это основа для будущего рефакторинга, где override-файл станет единственным источником правды для tablet portrait, а TP-блоки из Zone B будут удалены.

---

## F. Состояние JavaScript (script.js)

### F.1 Функции и компоненты

| Функция | Строки | Назначение | Зависимость от viewport |
|---------|--------|------------|------------------------|
| `initDevScreenLabels()` | 1-37 | Dev-метки `[data-screen-label]` | Нет |
| `syncHeroButtonWidth()` | 23-36 | Синхронизация ширины CTA с именем hero | **Да** (desktop/tablet only) |
| `refreshNav()` | 39-71 | Скрытие/показ nav по скроллу | Нет (IntersectionObserver) |
| `initPortfolioMapReveal()` | 57-97 | Анимация колонок портфолио | Нет (IntersectionObserver) |
| `openMobileMenu()` | 108-125 | Открытие мобильного меню | Нет |
| `closeMobileMenu()` | 127-142 | Закрытие мобильного меню | Нет |
| `toggleMobileMenu()` | 144-150 | Toggle меню | Нет |
| `openModal()` | 197-200 | Открытие контактной формы | Нет |
| `closeModal()` | 202-205 | Закрытие контактной формы | Нет |
| `closeOnOverlay()` | 207-212 | Закрытие по клику вне модалки | Нет |
| `playNewTrack(col, seekRatio)` | 321-365 | Запуск трека плеера | Нет |
| `clearActive()` | 309-319 | Сброс активного трека | Нет |
| `seekAudioToRatio(col, ratio)` | 295-306 | Перемотка аудио | Нет |
| `startTick(col, a)` | 274-287 | Анимация волны + CD | **Да** (requestAnimationFrame) |
| `stopTick()` | 289-293 | Остановка анимации | Нет |
| `getSeekRatio(event, el)` | 263-272 | Расчёт позиции перемотки | Нет |
| `openVideoModal(src)` | 430-434 | Легаси-видео модалка | Нет |
| `closeVideoModal()` | 435-440 | Закрытие легаси модалки | Нет |
| `openInlineVideoModal(card)` | 450-520 | Инлайн-видео (текущий путь) | Нет |
| `closeInlineVideoModal()` | 522-559 | Закрытие инлайн-видео | Нет |
| `minimizeInlineVideoModal()` | 561-580 | Сворачивание видео | Нет |
| `openEgyptVideo` | 604-607 | Открытие видео Egypt | Нет |
| `moveCarousel(delta)` | 702-714 | Движение карусели | **Да** (scheduleSnap на resize) |
| `scheduleSnap()` | 716-736 | Пересчёт позиции карусели при resize | **Да** (debounced resize) |
| `normalizeIndexIfNeeded()` | 665-685 | Коррекция индекса при infinite loop | **Да** (без анимации) |
| `finishCarouselMove()` | 687-700 | Фиксация позиции после анимации | Нет |
| `setPos(animated)` | 652-663 | Установка transform карусели | Нет |
| `slideWidth()` | 642-650 | Расчёт ширины слайда | **Да** |
| `getCarouselGap()` | 635-640 | Расчёт gap между слайдами | **Да** |

### F.2 JS-зависимости от viewport width

| Функция | Проблема |
|---------|----------|
| `syncHeroButtonWidth()` | Измеряет DOM-элементы на desktop/tablet. При ресайзе может не пересчитать, если не вызвать повторно. |
| `moveCarousel()` + `scheduleSnap()` | Карусель использует clone-логику для infinite loop. При смене breakpoint (мобильный ↔ десктоп) может сломаться, т.к. ширина слайда меняется. |
| `startTick()` | Использует `requestAnimationFrame` — если плеер не активен на мобильном, анимация не запускается. Это нормально. |

### F.3 Риски для будущей анимации

1. **Нет централизованного resize-обработчика.** Каждая функция подписывается на `resize` самостоятельно. Это может привести к конфликтам при добавлении анимаций.
2. **Прямые манипуляции DOM.** Все видео-функции создают/удаляют DOM-элементы (iframe, backdrop). При добавлении анимаций перехода это создаст мерцание.
3. **CSS-классы не документированы.** Нет единого списка классов, которые JS переключает. При рефакторинге CSS легко сломать JS-функциональность.
4. **Карусель использует inline `transition`** через `setPos(true/false)`. Анимированные переходы жёстко завязаны на CSS-свойства `transform` и `transition`. Изменение CSS может сломать логику infinite loop.
5. **`syncHeroButtonWidth()` не имеет debounce** на resize — может вызвать layout thrashing при быстром ресайзе.
6. **IntersectionObserver** (refreshNav, initPortfolioMapReveal) корректно использует `rootMargin` и `threshold`. Это правильный подход для scroll-driven анимаций.

### F.4 Карусель отзывов (Photo Carousel)

```
data structure:
  .photo-carousel          → контейнер
  .photo-slide             → слайды (включая clones)
  [data-photo-index]       → индекс слайда

clone strategy: first → last (prepend), last → first (append)
infinite loop: normalizeIndexIfNeeded() → setPos(false) → finishCarouselMove()

gap: рассчитывается через getComputedStyle()
snap: scheduleSnap() → debounced resize → setPos(true)
```

Сложность: средняя. Основные риски — при resize между breakpoint'ами.

---

## G. Риск-карта (Risky Places)

### 🔴 Высокий риск (требует немедленного внимания)

| # | Проблема | Файл | Описание |
|---|----------|------|----------|
| R1 | #performance heading hack | override.css | Замена заголовка через `::before` — хрупко, не accessibility-friendly |
| R2 | 800+ `!important` в override | override.css | Индикатор борьбы слоёв, усложняет поддержку |
| R3 | Легаси TP-блоки перекрываются | styles.css: ~10800-12800 | 4 блока, которые не должны применяться, но всё ещё в коде |
| R4 | #why-argument мёртвый селектор | override.css | `FOR WHAT?` — неиспользуемый код |

### 🟡 Средний риск

| # | Проблема | Файл | Описание |
|---|----------|------|----------|
| R5 | clean-candidate не подключён | файловая система | Существует, но не используется |
| R6 | Нет debounce у syncHeroButtonWidth | script.js:23 | Layout thrashing на resize |
| R7 | Карусель может сломаться при смене breakpoint | script.js:620-776 | Клоны + разные ширины слайдов |
| R8 | CSS-классы не документированы | script.js / styles.css | Легко сломать JS при рефакторинге CSS |
| R9 | Перекрытие breakpoint-границ | styles.css | 961px — общая граница для desktop и landscape tablet |
| R10 | Нет mobile-first подхода | styles.css | Desktop — базовый слой, мобильные — оверрайды |

### 🟢 Низкий риск

| # | Проблема | Файл | Описание |
|---|----------|------|----------|
| R11 | Нет Open Graph / favicon | index.html | Не влияет на функциональность |
| R12 | Видео iframe создаются динамически | script.js | Мерцание при открытии — некритично |
| R13 | Переменные Circe/Leotaro в fonts/ | файловая система | Не используются, Google Fonts подключён |

---

## H. Cleanup-предложения (без изменений)

### H.1 Первоочередные (высокий приоритет)

1. **Удалить легаси TP-блоки из styles.css**
   - После того как override-файл станет самодостаточным
   - Удалить блоки TP-1, TP-1.1, TP-2A, TP-2A.1
   - Перенести всё уникальное в override или Zone B актуальные блоки

2. **Заменить #performance heading hack**
   - Вариант A: изменить HTML — использовать `<h2>Выступления</h2>` без `::before`
   - Вариант B: оставить `::before`, но убрать `font-size: 0`, использовать `aria-label`

3. **Разобрать #why-argument мёртвый селектор**
   - Проверить, нужен ли он → удалить или задокументировать

### H.2 Среднесрочные

4. **Подключить clean-candidate** как базу для рефакторинга override-файла
5. **Уменьшить `!important`** — перенести важные правила в override без `!important`, удалив дубли из Zone B
6. **Добавить debounce на resize-обработчики** в JS
7. **Документировать CSS-классы JS** — создать единый реестр классов и их назначения

### H.3 Долгосрочные

8. **Перейти на mobile-first** — переписать CSS с мобильной базы и desktop-оверрайдов
9. **Изолировать desktop в свой медиа-блок**
10. **Добавить meta-теги** (OG, favicon, theme-color)
11. **Оптимизировать карусель** — рассмотреть замену на CSS scroll-snap для упрощения JS

---

## Z. Итоговое резюме

**Проект:** MALEA Landing — одностраничный лендинг с 27 экранами, аудиоплеером, видео-системой, каруселью и портфолио-сеткой. Vanilla JS, чистый CSS (без препроцессоров).

**Ключевые метрики:**
- HTML: 1199 строк, 27 экранов + footer
- CSS: 14414 строк (styles.css) + 2042 строк (override) = 16456 строк
- JS: 778 строк, 25+ функций
- Media queries: 4 целевых слоя (mobile, tablet portrait, tablet landscape, desktop)
- `!important`: ~1300 total (494 + 800+)

**Главная архитектурная проблема:** CSS имеет 3 слоя для планшетов (Zone B TP-легаси → override → Zone B V3), которые борются друг с другом. Оверрайд-файл «побеждает» через `!important`, но код раздут и хрупок.

**Главная JS-проблема:** Нет централизованного управления состоянием, карусель чувствительна к смене breakpoint'ов, нет debounce на resize.

**Рекомендация:** Сначала сделать override-файл самодостаточным (clean-candidate), затем удалить легаси TP-блоки из styles.css, затем провести рефакторинг JS (debounce, документирование классов), затем — косметические улучшения.
