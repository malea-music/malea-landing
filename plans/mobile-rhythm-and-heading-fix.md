# План: Исправление мобильной верстки лендинга MALEA

## Текущее состояние (анализ)

### Секции лендинга (порядок на мобильной версии)

```
01. #intro     (section full)         — 100lvh, без pad-block
02. #hero      (section full)         — 100lvh, без pad-block
03. #identity  (section pad-block)    — внутри .opening-stage
--- открывающийся контейнер закрывается ---
04. #philosophy(section full)         — «Новому времени — новое искусство»
05. #live      (section pad-block)    — «Живой звуковой перформанс» + изображение
06. quote-screen                      — цитата
07. #player    (section pad-block)    — плеер
...
```

### Стандартный ритм отступов на мобильных (≤760px)

В [`css/09-mobile-refinements.css`](../css/09-mobile-refinements.css:71) задан единый ритм для всех `.pad-block` секций:

```css
.pad-block { padding-block: clamp(44px, 6vh, 64px); }
```

Это даёт ~88–128px между соседними `.pad-block` секциями (bottom одного + top другого).

### Проблема 1: Отступ между #identity и #philosophy

| Элемент | Класс | Mobile padding-block |
|---|---|---|
| `#identity` (секция 3) | `section pad-block op-layer` | `clamp(44px, 6vh, 64px)` (из 09-mobile-refinements.css) |
| `#philosophy` | `section full` | **Нет** padding-block на самой секции |
| `.philo__inner` (внутри) | — | `padding-block: var(--vr-block)` = `clamp(20px, 3vh, 30px)` (из 09-mobile-refinements.css:80) |

**Итог:** расстояние между контентом `#identity` и `#philosophy`:
- bottom padding #identity: `clamp(44px, 6vh, 64px)`
- top padding .philo__inner: `clamp(20px, 3vh, 30px)`
- **Итого: ~64–94px**

**Сравнение со стандартным ритмом** (88–128px): отступ **меньше на ~24–34px**. Секция `#philosophy` визуально «прилипает» к `#identity`.

### Проблема 2: Заголовок «Живой звуковой перформанс» под изображением

HTML-структура секции `#live`:

```html
<section class="section pad-block" id="live">
  <div class="wrap">
    <div class="live__media">        <!-- ← ИЗОБРАЖЕНИЕ (первое в DOM) -->
      <img ...>
    </div>
    <div class="live-text-inner">    <!-- ← ТЕКСТ (второе в DOM) -->
      <div class="live-text-left">
        <h2 class="live__heading">   <!-- ← ЗАГОЛОВОК ВНУТРИ -->
          Живой звуковой перформанс
        </h2>
```

На мобильных (max-width: 760px) в [`css/05-screens.css:358-371`](../css/05-screens.css:358) секция `live-text-inner` схлопывается в одноколоночную сетку, но порядок в DOM не меняется — **изображение остаётся выше заголовка**.

---

## План исправлений

### Исправление 1: Ритм отступа между #identity и #philosophy

**Файл:** [`css/09-mobile-refinements.css`](../css/09-mobile-refinements.css)

**Что сделать:**

1. Добавить `#philosophy` в правило `.pad-block` на мобильных (строка 71–73), чтобы секция получила стандартный `padding-block: clamp(44px, 6vh, 64px)`.

2. Обнулить `padding-block` у `.philo__inner` на мобильных, чтобы избежать двойного отступа:

```css
/* В media query (max-width: 760px) */
.pad-block,
#art,
#reviews,
#philosophy { padding-block: clamp(44px, 6vh, 64px); }

#philosophy .philo__inner { padding-block: 0; }
```

**Результат:** расстояние между `#identity` и `#philosophy` станет `clamp(88px, 12vh, 128px)` — идентично стандартному ритму между любыми двумя `.pad-block` секциями.

---

### Исправление 2: Заголовок «Живой звуковой перформанс» над изображением

**Вариант А (рекомендуемый) — CSS Flexbox `column-reverse`**

Без изменения HTML. Только CSS в [`css/09-mobile-refinements.css`](../css/09-mobile-refinements.css).

```css
/* Mobile: поднимаем заголовок над изображением */
@media (max-width: 760px) {
  #live .wrap {
    display: flex;
    flex-direction: column-reverse;
    gap: clamp(24px, 3vh, 40px);
  }
  #live .live__media {
    margin-bottom: 0; /* убираем старый margin, т.к. используем gap */
  }
}
```

**Как это работает:**
- `column-reverse` меняет визуальный порядок: `.live-text-inner` (с заголовком) отображается **первым**, `.live__media` (изображение) — **вторым**
- `gap` задаёт расстояние между текстовым блоком и изображением
- На desktop (min-width: 761px) `#live .wrap` остаётся `display: block`, изменений нет

**Особенность:** На mobile над изображением окажется **весь текстовый блок** (заголовок + правило + описание + форматы + кнопка), а не только заголовок.

**Вариант Б — Только заголовок над изображением (HTML + CSS)**

Если нужно, чтобы **только заголовок** был над изображением, а описание и форматы остались под ним:

1. **HTML** (`index.html`): Вынести `<h2 class="live__heading">` из `.live-text-left` и разместить перед `.live__media` как `live__heading--mobile`. Добавить дублирующий скрытый заголовок `.live__heading--desktop` обратно в `.live-text-left`.
2. **CSS**: На desktop скрыть `--mobile`, показать `--desktop`. На mobile — наоборот.

**Рекомендация:** начать с **Варианта А** (минимальные изменения, не ломает desktop), а после визуальной проверки при необходимости уточнить.

---

## Файлы для изменений

| Файл | Что меняется |
|---|---|
| [`css/09-mobile-refinements.css`](../css/09-mobile-refinements.css) | Добавить `#philosophy` в правило `pad-block`; обнулить `padding-block` у `.philo__inner`; добавить `column-reverse` для `#live .wrap` |
| [`index.html`](../index.html) | Только если выбран Вариант Б |

---

## Что НЕ затрагивается

- Desktop (1101px+)
- Tablet landscape (07)
- Tablet portrait (08)
- iPad Pro portrait (10)
- Все остальные секции лендинга
- JavaScript, анимации, motion
- Git: работа только в ветке `dev`

---

## Визуальная проверка после изменений

1. Открыть `http://localhost:8081` (или 8082) в Chrome DevTools
2. Эмулировать мобильное устройство (iPhone SE / iPhone 14 Pro Max)
3. Проверить:
   - [ ] Отступ между секциями 3 (#identity) и 4 (#philosophy) визуально равен отступам между другими секциями
   - [ ] Заголовок «Живой звуковой перформанс» находится над изображением
   - [ ] Все остальные секции не съехали
   - [ ] Desktop-версия не изменилась
