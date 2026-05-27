# Responsive Map — MALEA Landing

> Полная карта экранов, типов секций, чувствительных элементов и ограничений.
> Источник: [`index.html`](../index.html)

---

## Screen list

Всего найдено **27 экранов** в порядке HTML.

| № | `data-screen-label` | ID | Тип секции | Ключевые HTML-классы | Чувствительно на mobile | Что нельзя ломать |
|---|---|---|---|---|---|---|
| 01 | `01 · intro` | `#intro` | ceremonial title screen | `.screen`, `.intro-content` | Текст может переполнять, отступы | Десктопный letter-spacing логотипа |
| 02 | `02 · hero` | `#hero` | hero | `.screen`, `.hero-photo`, `.hero-inner` | `.hero-photo` (изображение), кнопка `.hero-btn` | Синхронизация ширины кнопки с фото (`syncHeroButtonWidth`) |
| 03 | `03 · identity` | `#identity` | split text | `.screen`, `.identity-inner`, `.identity-portrait`, `.identity-text`, `.identity-titres` | Портрет, колонки текста, титры | Пропорции портрета |
| 04 | `04 · philosophy` | `#philosophy` | split text | `.screen`, `.philosophy-inner`, `.philosophy-left`, `.philosophy-right` | Flex-колонки → stack | Двухколоночный layout на desktop |
| 05 | `05 · live-image` | `#live-image` | image-only | `.screen`, `.live-bg` | Фоновое изображение | Соотношение сторон фона |
| 06 | `06 · live-text` | `#live-text` | split text | `.screen`, `.live-text-inner`, `.live-text-left`, `.live-text-right`, `.live-format-row` | `.live-format-row` (сетка 4 элемента) | Flex-направление секции |
| 07 | `07 · quote` | `#quote` | quote | `.screen`, `.quote-inner`, `.quote-text` | Длинный текст цитаты | Размер шрифта и отступы цитаты |
| 08 | `08 · player` | `#player` | audio player | `.screen`, `.player-header`, `.player-cd-wrap`, `.track-grid`, `.track-col` (×3), `.track-footer` | `.track-grid`, `.player-cd-wrap` (анимация CD), `.track-footer` | **JS audio player**: `playNewTrack()`, `togglePlay()`, `updateProgress()` |
| 09 | `09 · performance` | `#performance` | video grid | `.screen`, `.perf-inner`, `.perf-left`, `.video-grid`, `.video-card` (×4) | `.video-grid` (сетка 2×2 → stack) | **Video modal**: `openVideoModal()`, `closeVideoModal()` |
| 10 | `10 · art` | `#art` | video grid | `.screen`, `.art-inner`, `.art-header`, `.art-wall`, `.art-featured`, `.art-mini-row` | `.art-wall` layout (featured + mini) | **Video modal**: `openInlineVideoModal()` |
| 11 | `11 · musicians` | `#musicians` | cards/list | `.screen`, `.musicians-intro-inner`, `.musicians-title` | Простой экран, заголовок | — |
| 12 | `12 · musicians-gallery` | `#musicians-gallery` | cards/list | `.screen`, `.musicians-gallery-inner`, `.mg-card` (×3), `.mg-photo`, `.mg-caption` | `.mg-card` (сетка 3 колонки) | Пропорции фото музыкантов |
| 13 | `13 · sensations` | `#sensations` | cards/list | `.screen`, `.sens-block`, `.sens-title`, `.sens-pills`, `.sens-marquee-track` | `.sens-pills` (marquee-анимация) | `prefers-reduced-motion: reduce` анимация |
| 14 | `14 · reviews` | `#reviews` | reviews | `.screen`, `.photo-carousel-wrap`, `.photo-carousel`, `.photo-slide`, `#carouselPrev`, `#carouselNext`, `.review-cards`, `.review-card` (×4) | `.review-card` (stack), карусель фото | **JS карусели**: `setPos()`, touch-события не реализованы |
| 15 | `15 · malea-quote` | `#malea-quote-screen` | quote | `.screen`, `.mq-inner`, `.mq-text` | Текст цитаты | `height: 100vh` — замена на 100dvh |
| 16 | `16 · egypt` | `#egypt` | ceremonial title screen | `.screen`, `.egypt-intro`, `.egypt-intro-inner`, `.egypt-title` | Заголовок | — |
| 17 | `17 · egypt-case` | `#egypt-case` | video grid | `.screen`, `.egypt-case`, `.egypt-inner`, `.egypt-video`, `.egypt-video-vertical`, `.egypt-copy`, `.egypt-list`, `.egypt-tl-item` (×4), `.egypt-conclusion` | `.egypt-inner` (flex → stack), `.egypt-list` (таймлайн) | **JS video modal**: `openInlineVideoModal()`, `!important` z-index 9000–9040 |
| 18 | `18 · formats` | `#formats` | ceremonial title screen | `.screen`, `.formats-title-screen`, `.formats-title-inner`, `.formats-main-title` | Заголовок | — |
| 19 | `19 · formats-list` | `#formats-list` | cards/list | `.screen`, `.formats-list-screen`, `.formats-list-inner`, `.formats-list`, `.format-line` (×4), `.format-line-content`, `.format-line-copy`, `.format-line-specs`, `.format-line-spec` | `.format-line` (flex-строка → stack), спецификации | Flex-направление строк |
| 20 | `20 · formats-integration` | `#formats-integration` | cards/list | `.screen`, `.formats-integration-screen`, `.fi-header`, `.fi-panels`, `.fi-panel` (×3), `.fi-desc`, `.fi-cta` | `.fi-panels` (сетка 3 панели → stack), кнопка CTA | — |
| 21 | `21 · why` | `#why` | ceremonial title screen | `.screen`, `.why-title-screen`, `.why-title-inner`, `.why-title-main` | Заголовок | — |
| 22 | `22 · why-image` | `#why-image` | image-only | `.screen`, `.why-image-screen` | Изображение (контейнер) | Соотношение сторон |
| 23 | `23 · why-argument` | `#why-argument` | cards/list | `.screen`, `.why-argument-sheet`, `.why-argument-inner`, `.why-argument-header`, `.why-argument-list`, `.why-argument-item` (×3) | `.why-argument-list` (stack 3 аргумента) | — |
| 24 | `24 · portfolio` | `#portfolio` | split text | `.screen`, `.portfolio-hero`, `.portfolio-hero-inner`, `.portfolio-hero-copy`, `.portfolio-title`, `.portfolio-image` | Flex → stack, изображение | — |
| 25 | `25 · portfolio-map` | `#portfolio-map` | cards/list | `.screen`, `.portfolio-map`, `.pm-grid`, `.pm-col` (×3), `.pm-col-header`, `.pm-event-list`, `.pm-event`, `.pm-partners`, `.pm-partner`, `.pm-upcoming-list`, `.pm-upcoming` | `.pm-grid` (сетка 3 колонки → stack) | Иерархия колонок (события, партнёры, будущее) |
| 26 | `26 · portfolio-quote` | `#portfolio-quote` | quote | `.screen`, `.portfolio-quote-screen`, `.portfolio-quote-inner` | Текст цитаты | `height: 100vh` + `min-height: 100vh` — замена на 100dvh |
| 27 | `27 · final-experience` | `#final-experience` | final CTA | `.screen`, `.final-experience`, `.final-experience-inner`, `.final-experience-copy`, `.final-experience-title`, `.final-experience-text`, `.final-experience-image` | Flex → stack, изображение | Финальный CTA — не менять призыв к действию |

---

## Особые зоны (не ломать без отдельной задачи)

| Компонент | ID / селектор | Что нельзя трогать |
|---|---|---|
| **Audio player** | `#player` | Весь audio JS: `playNewTrack()`, `togglePlay()`, `updateProgress()`, `formatTime()`. Анимация CD (`cd-spin`). |
| **Video modal (overlay)** | `#videoModal` → `.vmodal-overlay` | `openVideoModal()`, `closeVideoModal()`, `body.video-modal-active`, `overflow: hidden` |
| **Video modal (inline)** | `openInlineVideoModal()` | `openInlineVideoModal()`, `closeInlineVideoModal()`, `minimizeInlineVideoModal()` — динамический DOM |
| **Egypt video modal** | `#egypt-case` | `!important` z-index (9000–9040) — рефакторинг только отдельной задачей |
| **Form modal** | `#modalOverlay` → `.modal-overlay` | `openModal()`, `closeModal()`, `closeOnOverlay` |
| **Mobile menu** | `#mainNav`, `#mobileMenu`, `.nav-menu-toggle` | `openMobileMenu()`, `closeMobileMenu()`, `.nav-mobile-open` — меню пока не трогать. |
| **Photo carousel** | `#photoCarousel` | `setPos()`, `#carouselPrev`/`#carouselNext`, клонированные `.photo-slide` |

---

## Навигация

| Элемент | Селектор | Тип | Примечание |
|---|---|---|---|
| Десктопное меню | [`#mainNav`](../index.html:19) | `nav.is-hidden` с `ul.nav-links` | Скрывается при скролле вниз (JS: `refreshNav`) |
| Мобильное меню | [`#mobileMenu`](../index.html:37) | `.nav-mobile-panel` с `ul.nav-mobile-links` | Slide-in панель, открывается по кнопке `.nav-menu-toggle` |
| Кнопка-гамбургер | `.nav-menu-toggle` | Кнопка | Атрибуты `aria-expanded`, `aria-controls="mobileMenu"` |

> **Важно:** `#mainNav` / `#mobileMenu` — меню пока не трогать. Отдельная задача.

---

## Контейнеры-обёртки (flow)

| Контейнер | Селектор | Включает экраны |
|---|---|---|
| Experience flow | `.experience-flow` | `#player`, `#performance`, `#art` |
| Reviews flow | `.reviews-flow` | `#sensations`, `#reviews`, `#malea-quote-screen` |
| Formats flow | `.formats-flow` | `#formats`, `#formats-list`, `#formats-integration` |
| Portfolio flow | `.portfolio-flow` | `#portfolio`, `#portfolio-map`, `#portfolio-quote` |
