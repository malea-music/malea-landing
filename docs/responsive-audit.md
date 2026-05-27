# Responsive Audit — MALEA Landing Page

> Анализ медиа-запросов, конфликтующих правил и рискованных CSS-паттернов.
> Источник: [`css/styles.css`](../css/styles.css) (5593 строки)

---

## 1. Полный реестр медиа-запросов

Всего найдено **32 медиа-запроса** в [`css/styles.css`](../css/styles.css).  
Ниже — упорядоченный список со ссылками на строки и охватом.

### 1.1 `max-width` брейкпоинты (по возрастанию)

| № | Брейкпоинт | Строка | Охват (экраны / компоненты) | Строк кода |
|---|---|---|---|---|
| — | **1100px** | _не найден_ | Брейкпоинт 1100px не обнаружен в CSS — необходимо добавить для tablet-слоя (761–1100px) | — |
| 1 | **380px** | [:5568](../css/styles.css:5568) | `.nav-mobile-inner`, `.nav-mobile-link` — очень малые телефоны | ~25 |
| 2 | **520px** | [:371](../css/styles.css:371) | `.intro-desc` — intro-текст | ~5 |
| 3 | **520px** | [:2773](../css/styles.css:2773) | `#site-footer .ft-shell` — футер | ~10 |
| 4 | **520px** | [:2827](../css/styles.css:2827) | `#final-experience .final-experience-title` | ~10 |
| 5 | **520px** | [:2902](../css/styles.css:2902) | `#portfolio .portfolio-title` | ~10 |
| 6 | **520px** | [:4517](../css/styles.css:4517) | `#formats-list` — padding | ~10 |
| 7 | **520px** | [:4968](../css/styles.css:4968) | `#why-argument .why-argument-subtitle` | ~10 |
| 8 | **520px** | [:5025](../css/styles.css:5025) | `#musicians-gallery`, `.mg-card` — галерея музыкантов | ~30 |
| 9 | **520px** | [:5372](../css/styles.css:5372) | Egypt video-modal — inline minimize text | ~15 |
| 10 | **600px** | [:3773](../css/styles.css:3773) | `.intro-logo` — letter-spacing | ~5 |
| 11 | **720px** | [:3465](../css/styles.css:3465) | `.mq-inner` — malea-quote | ~20 |
| 12 | **720px** | [:3729](../css/styles.css:3729) | `#sensations` — отзывы/ощущения | ~45 |
| 13 | **720px** | [:4006](../css/styles.css:4006) | `#egypt.egypt-intro` | ~30 |
| 14 | **720px** | [:5009](../css/styles.css:5009) | `.quote-text`, `#philosophy` — цитаты, философия | ~15 |
| 15 | **720px** | [:5056](../css/styles.css:5056) | `#musicians .musicians-title` — заголовок | ~30 |
| 16 | **720px** | [:5089](../css/styles.css:5089) | `#identity .identity-headline` — айдентика | ~20 |
| 17 | **720px** | [:5196](../css/styles.css:5196) | `#performance` video-modal — горизонтальный inline | ~175 |
| 18 | **760px** | [:304](../css/styles.css:304) | `.dev-screen-badge` — dev-лейблы | ~30 |
| 19 | **760px** | [:4996](../css/styles.css:4996) | `#hero .hero-inner .btn` — hero-кнопка | ~10 |
| 20 | **760px** | [:5388](../css/styles.css:5388) | `.nav`, `.nav-links`, `.nav-menu-toggle`, `.nav-mobile-panel` — навигация | ~180 |
| 21 | **820px** | [:2755](../css/styles.css:2755) | `#site-footer .ft-main` — футер (колонки) | ~15 |
| 22 | **860px** | [:1483](../css/styles.css:1483) | `.player-header`, `.track-grid`, `.track-col` — аудиоплеер | ~125 |
| 23 | **900px** | [:4491](../css/styles.css:4491) | `#formats-list .format-line` — формат-линии | ~25 |
| 24 | **900px** | [:4947](../css/styles.css:4947) | `#why-argument.why-argument-sheet` | ~20 |
| 25 | **960px** | [:2803](../css/styles.css:2803) | `#final-experience.final-experience` | ~20 |
| 26 | **960px** | [:2838](../css/styles.css:2838) | `#portfolio.portfolio-hero` | ~65 |
| 27 | **960px** | [:3584](../css/styles.css:3584) | `:root` — `--col-pad` | ~145 |
| 28 | **980px** | [:4979](../css/styles.css:4979) | `.nav-links` — скрытие десктопных ссылок | ~15 |
| 29 | **1180px** | [:3990](../css/styles.css:3990) | `#egypt-case .egypt-inner` — Egypt case flex | ~15 |

### 1.2 `min-width` брейкпоинты

| № | Брейкпоинт | Строка | Охват |
|---|---|---|---|
| 1 | **1200px** | [:692](../css/styles.css:692) | `#philosophy .philosophy-inner` — увеличенный gap |
| 2 | **1200px** | [:824](../css/styles.css:824) | `.live-text-inner` — увеличенный gap |

### 1.3 Специальные медиа-запросы

| Тип | Строка | Охват |
|---|---|---|
| `prefers-reduced-motion: reduce` | [:3229](../css/styles.css:3229) | `#sensations .sens-pills` — остановка анимации marquee |

---

## 2. Проблемные зоны архитектуры брейкпоинтов

### 2.1 Скачок между брейкпоинтами

| Диапазон | Проблема |
|---|---|
| **980px → 960px** | Разница 20px, оба меняют навигацию/мобильную версию — возможен конфликт |
| **760px → 720px** | Разница 40px, оба меняют layout — пересечение правил для nav |
| **520px → 380px** | Между ними 140px без правил — мобильные 414px (iPhone 11) без контроля |

### 2.2 Разбросанные responsive-правила

Медиа-запросы **не сгруппированы** — они разбросаны по всему файлу.  
Один и тот же брейкпоинт (например, 720px) встречается в 7 разных местах файла.  
Это создаёт риск:
- Дублирования правил
- Сложности отладки
- Случайного переопределения

### 2.3 Отсутствующие брейкпоинты

| Устройство | Ширина | Есть брейкпоинт? |
|---|---|---|
| iPhone SE | 375px | 380px (близко) |
| iPhone 11/12/13 | 390–414px | Нет |
| Samsung Galaxy S24 | 360–412px | Нет |
| iPad Mini (portrait) | 768px | 760px (близко) |
| iPad Air/Pro (portrait) | 820–834px | 820px (есть) |
| iPad Pro 12.9" (portrait) | 1024px | Нет |
| Surface Duo | 540px | 520px (близко) |

---

## 3. Рискованные CSS-паттерны

### 3.1 `min-height: 100vh` — 36 вхождений

**Риск:** на мобильных браузерах (Chrome/Safari) `100vh` включает адресную строку, которая скрывается при скролле. Реальный видимый viewport меньше, чем `100vh`.

**Места применения:**

| ID / селектор | Строка | Также `height: 100vh`? |
|---|---|---|
| `.screen` (общий) | [:244](../css/styles.css:244) | Нет |
| `#intro` | [:406](../css/styles.css:406) | Нет |
| `#identity .identity-text` | [:461](../css/styles.css:461) | Нет |
| `#hero` | [:531](../css/styles.css:531) | Нет |
| `#hero .hero-inner` | [:553](../css/styles.css:553) | Нет |
| `#philosophy` | [:662](../css/styles.css:662) | Нет |
| `#live-image` | [:764](../css/styles.css:764) | Нет |
| `#live-text` | [:795](../css/styles.css:795) | Нет |
| `#quote` | [:941](../css/styles.css:941) | Нет |
| `#player` | [:1011](../css/styles.css:1011) | Нет |
| `#art .art-inner` | [:2102](../css/styles.css:2102) | Нет |
| `#art .art-wall` | [:2114](../css/styles.css:2114) | Нет |
| `#musicians` | [:2207](../css/styles.css:2207) | Нет |
| `#portfolio-quote` | [:2395](../css/styles.css:2395) | **Да** (`height: 100vh`) |
| `#malea-quote-screen` | [:2424](../css/styles.css:2424) | **Да** (`height: 100vh`) |
| `#final-experience` (960px) | [:2806](../css/styles.css:2806) | Нет (responsive) |
| `#portfolio` (960px) | [:2841](../css/styles.css:2841) | Нет (responsive) |
| `#portfolio .portfolio-image` (960px) | [:2847](../css/styles.css:2847) | Нет (responsive) |
| `#portfolio-map` (960px) | [:2892](../css/styles.css:2892) | Нет (responsive) |
| `#portfolio-map .pm-grid` | [:3061](../css/styles.css:3061) | Нет |
| `#portfolio-map .pm-grid` (720px) | [:3250](../css/styles.css:3250) | `height: auto` |
| `#portfolio-quote` (720px) | [:3418](../css/styles.css:3418) | **Да** (`height: 100vh`) |
| `:root` (960px) | [:3591](../css/styles.css:3591) | Нет (responsive) |
| `#sensations` (720px) | [:3731](../css/styles.css:3731) | `height: auto` |
| `#egypt.egypt-intro` | [:3782](../css/styles.css:3782) | **Да** (`height: 100vh`) |
| `#egypt-case` | [:3835](../css/styles.css:3835) | `height: auto` |
| `#egypt.egypt-intro` (720px) | [:4009](../css/styles.css:4009) | Нет (responsive) |
| `.formats-title-screen` | [:4038](../css/styles.css:4038) | Нет |
| `#formats-list` | [:4124](../css/styles.css:4124) | `height: auto` |
| `#formats-list .formats-list-inner` | [:4291](../css/styles.css:4291) | Нет |
| `.why-title-screen` | [:4563](../css/styles.css:4563) | Нет |
| `.why-image-screen` | [:4605](../css/styles.css:4605) | Нет |
| `#why-argument .why-argument-inner` | [:4670](../css/styles.css:4670) | Нет |
| `#why-argument` (900px) | [:4950](../css/styles.css:4950) | Нет (responsive) |
| `.nav-mobile-panel` (760px) | [:5479](../css/styles.css:5479) | `min(620px, calc(100vh - 120px))` |
| `.nav-mobile-panel` (380px) | [:5571](../css/styles.css:5571) | `calc(100vh - 96px)` |

### 3.2 `position: fixed` — 9 вхождений

**Риск:** на мобильных fixed-элементы могут вести себя непредсказуемо (смещение при скролле, перекрытие контента).

| Селектор | Строка | z-index | Назначение |
|---|---|---|---|
| `.nav` | [:138](../css/styles.css:138) | 1000 | Десктопная навигация |
| `.video-modal-backdrop` | [:1639](../css/styles.css:1639) | 1 | Затемнение под видео |
| `.video-frame-wrap.is-video-modalized` | [:1658](../css/styles.css:1658) | 2 | Inline-видео в модальном режиме |
| `.vmodal-overlay` | [:1725](../css/styles.css:1725) | 3000 | Оверлей видео-модалки |
| `.modal-overlay` | [:3507](../css/styles.css:3507) | 2000 | Оверлей формы |
| Egypt backdrop (!important) | [:5129](../css/styles.css:5129) | 9000 | Затемнение Egypt-видео |
| Egypt video-frame (!important) | [:5145](../css/styles.css:5145) | 9010 | Egypt-видео в модале |
| Egypt vertical video-frame (!important) | [:5246](../css/styles.css:5246) | 9010 | Egypt вертикальное видео |
| `.nav-mobile-panel` (760px) | [:5448](../css/styles.css:5448) | 12010 | Мобильное меню |

### 3.3 `z-index` — сводка по контекстам

| Значение | Селектор | Назначение |
|---|---|---|
| 0 | Фоновые декорации | Псевдоэлементы gradient/radial |
| 1 | Основной контент экранов | `.screen > *` |
| 2 | CD-обложка, backdrop, кнопки | `.player-cd-img`, `.video-modal-backdrop`, `.sens-pill-btn` |
| 900 | Dev-бейджи | `.dev-screen-badge` |
| 1000 | `.nav` | Десктопная навигация |
| 2000 | `.modal-overlay` | Форма |
| 3000 | `.vmodal-overlay` | Видео-оверлей |
| 9000–9040 | Egypt video-modal (!important) | Egypt-специфичная модалка |
| 12010–12020 | `.nav-mobile-panel` / `.nav-mobile-link` | Мобильное меню |

**Риски:**
- `z-index` с `!important` в Egypt-секции (9000–9040) — хрупкая архитектура
- Разрыв между 3000 и 9000 — соблазн вставлять новые слои в пустом диапазоне
- Мобильное меню (12010) выше всего — но может конфликтовать с будущими компонентами

### 3.4 `overflow: hidden` — 39 вхождений

**Риск:** на мобильных устройствах `overflow: hidden` на родительском контейнере может:
- Обрезать выпадающие меню
- Сломать sticky-позиционирование
- Заблокировать скролл на странице

**Ключевые вхождения:**

| Селектор | Строка |
|---|---|
| `.screen` (общий) | [:243](../css/styles.css:243) |
| `body.video-modal-active` | [:5113](../css/styles.css:5113) |
| `.intro-content` (внутренний) | [:425](../css/styles.css:425) |
| `.hero-inner` | [:561](../css/styles.css:561) |
| `.player-cd-outer` | [:1140](../css/styles.css:1140) |
| `.track-col` (аудиоплеер) | [:1231](../css/styles.css:1231) |
| `.art-inner` | [:2106](../css/styles.css:2106) |
| `.art-wall` | [:2167](../css/styles.css:2167) |
| `.musicians-intro-inner` | [:2213](../css/styles.css:2213) |
| `.mq-inner` | [:2402](../css/styles.css:2402) |
| `.pm-grid` (portfolio-map) | [:3068](../css/styles.css:3068) |
| `.egypt-inner` | [:4069](../css/styles.css:4069) |
| `.why-argument-inner` | [:4677](../css/styles.css:4677) |

---

## 4. Конфликтующие / пересекающиеся правила

### 4.1 Навигация (760px переход)

При `max-width: 760px` (:5388) навигация переключается на мобильную версию.  
Но блок `.nav-links` скрывается уже при `max-width: 980px` (:4979).

**Проблема:** между 980px и 760px (220px зазора) десктопные ссылки скрыты, а мобильное меню ещё не активировано. Ссылки недоступны.

### 4.2 Hero-кнопка (760px vs 520px)

Правило `#hero .hero-inner .btn` (:4996) меняет размер/позицию кнопки при 760px.  
Нет уточнения для 520px — кнопка может быть слишком большой на узких экранах.

### 4.3 Portfolio-quote — двойной `100vh`

```css
#portfolio-quote.portfolio-quote-screen {
  min-height: 100vh;   /* :2395 */
  height: 100vh;       /* :2396 */
  display: flex;
}
```

При `max-width: 720px` (:3417):
```css
#portfolio-quote.portfolio-quote-screen {
  min-height: 100vh;   /* :3418 */
  height: 100vh;       /* :3419 */
  display: block;
}
```

Оба `100vh` сохраняются даже на мобильных — максимальный риск для Safari.

### 4.4 Egypt-section (1180px → 720px)

При 1180px (:3990) меняется flex-направление `.egypt-inner`.  
При 720px (:4006) меняется padding `.egypt-intro`.  
Нет промежуточного брейкпоинта между 1180 и 720 — разрыв 460px.

---

## 5. JS-зависимые зоны риска

> Подробно: [`js/script.js`](../js/script.js)

| Функция | Строка | Responsive-зависимость | Риск |
|---|---|---|---|
| `syncHeroButtonWidth()` | [:23](../js/script.js:23) | Запускается на `resize`, синхронизирует ширину кнопки с `.hero-photo` | При 760px (:4996) layout может сломать синхронизацию |
| `refreshNav()` | (внутри) | Скрывает `.nav` при скролле | Mobile nav (760px) меняет структуру — JS может не отработать |
| `openMobileMenu()` / `closeMobileMenu()` | [:64](../js/script.js:64) | Добавляет/удаляет класс `.nav-mobile-open` | Закрытие по resize — корректно |
| `openVideoModal()` | [:365](../js/script.js:365) | Создаёт `body.video-modal-active` → `overflow: hidden` | Блокировка скролла на iOS |
| `openInlineVideoModal()` | [:385](../js/script.js:385) | Создаёт inline-модалку с fixed-позиционированием | Сложный DOM, `!important` z-index |
| `playNewTrack()` | [:256](../js/script.js:256) | Управляет `.track-col.is-active`, вращение CD | Анимация CD может тормозить на мобильных |
| `setPos()` (карусель) | [:571](../js/script.js:571) | Бесконечная карусель с клонированием `.photo-slide` | Touch-события не реализованы — только кнопки Prev/Next |

---

## 6. Итоговая карта рисков

| Категория | Риск | Приоритет |
|---|---|---|
| `100vh` × 36 | Обрезание контента на мобильных Safari/Chrome | **Высокий** |
| `height: 100vh` (5 экранов) | Адресная строка не учтена | **Высокий** |
| `overflow: hidden` × 39 | Блокировка скролла, обрезание контента | Средний |
| `position: fixed` × 9 | Смещение на мобильных | Средний |
| `z-index` с `!important` | Хрупкая архитектура наложения | Средний |
| 980px → 760px (nav gap) | Ссылки недоступны на 760–980px | **Высокий** |
| Touch-события карусели | Карусель не работает на тач-устройствах | Средний |
| Разбросанные media-запросы | Сложность поддержки, дублирование | Средний |
| Отсутствие брейкпоинта 390–414px | Нет контроля на iPhone 11/13 | Низкий |
| `!important` 9000–9040 (Egypt) | Почти нерасширяемый слой | Низкий |
