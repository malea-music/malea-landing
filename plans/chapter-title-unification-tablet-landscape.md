# План: Unification Chapter Title для tablet landscape (экраны 11/13/16/18/21/24)

## Цель

Привести заголовки экранов 11 (`#musicians .musicians-title`), 13 (`#sensations .sens-title`), 16 (`#egypt .egypt-title`), 18 (`#formats .formats-main-title`), 21 (`#why .why-title-main`), 24 (`#portfolio .portfolio-title`) к единой chapter-title логике на **tablet landscape**, используя экран 11 как эталон.

## Текущее состояние (после аудита)

### Базовая типографика (desktop-основа)

| Экран | Селектор | font-size | line-height | letter-spacing | text-align | Особенности |
|-------|----------|-----------|-------------|----------------|------------|-------------|
| 11 musicians | `.musicians-title` | clamp(46, 4.6vw, 72) | 1.12 | .04em | наследуется | margin: 0 0 30px |
| 13 sensations | `.sens-title` | clamp(46, 4.6vw, 72) | 1.12 | .04em | center | max-width: 1240px |
| 16 egypt | `.egypt-title` | clamp(46, 4.6vw, 72) | 1.12 | .04em | center | — |
| 18 formats | `.formats-main-title` | clamp(46, 4.6vw, 72) | 1.12 | .04em | center | — |
| 21 why | `.why-title-main` | clamp(46, 4.6vw, 72) | 1.12 | .04em | center | — |
| 24 portfolio | `.portfolio-title` | `var(--f-section)` = clamp(44, 5vw, 70) | 1.12 | .04em | left (наследуется) | max-width: 620px, **НИЖЕ** группы |

**Ключевая проблема:** Экран 24 не входит в ceremonial title group. Он привязан к группе «main H2» (с экранами identity-headline, philosophy-title и т.д.) — строки 5076–5112.

### Существующие MQ tablet landscape, которые могут конфликтовать

1. **Блок 5841–5875** (`@media min-width: 761px and max-width: 1100px`):
   - 11/13/16/18/21: `font-size: clamp(44px, 6vw, 64px); line-height: 1.08;`
   - 24 (portfolio): `font-size: clamp(40px, 5.6vw, 58px); line-height: 1.1;`

2. **Блок 11452–11612** (Screen 24 FINAL tablet landscape, те же MQ):
   - portfolio-title: центрирован, max-width: 920px, font-size: clamp(44px, 4.8vw, 68px), свои правила для span

3. **Блок 11614–11630** (Screen 24 narrow landscape safety 961–1060px):
   - portfolio-title: font-size: clamp(40px, 4.4vw, 58px); max-width: 840px

### HTML-структура заголовков

- Экран 11: `<h2 class="musicians-title"><span...>Музыканты живого</span><br><span...>перформанса</span></h2>`
- Экран 13: `<h2 class="sens-title"><span...>Как ощущается музыка</span><span...>и перформанс MALEA</span></h2>`
- Экран 16: `<h2 class="egypt-title">Египетский кейс:<br>как музыка открыла<br>пирамиды</h2>`
- Экран 18: `<h2 class="formats-main-title"><span>Форматы интеграции</span><span>в ваше событие</span></h2>`
- Экран 21: `<h2 class="why-title-main"><span>Почему MALEA включают</span><span>в программу событий</span></h2>`
- Экран 24: `<h2 class="portfolio-title"><span>Портфолио выступлений</span><span>и партнёрств</span></h2>`

## План действий

### Шаг 1: Добавить новый финальный блок в конец `css/styles.css`

После строки 11925 (последняя закрывающая `}` блока `@media (min-width: 961px) and (max-width: 1060px) and (orientation: landscape)`).

### Шаг 2: Содержимое блока

#### 2a. Основной MQ для tablet landscape

```css
@media
  (min-width: 961px) and (max-width: 1180px) and (orientation: landscape),
  (min-width: 761px) and (max-width: 1366px) and (orientation: landscape) and (hover: none) and (pointer: coarse) {

  :root {
    --tl-chapter-title-size: clamp(46px, 4.6vw, 72px);
    --tl-chapter-title-line: 1.12;
    --tl-chapter-title-letter: .04em;
    --tl-chapter-title-max: 980px;
    --tl-chapter-title-space-after: clamp(24px, 3.2svh, 36px);
  }

  #musicians .musicians-title,
  #sensations .sens-title,
  #egypt .egypt-title,
  #formats .formats-main-title,
  #why .why-title-main,
  #portfolio .portfolio-title {
    font-family: var(--font-d) !important;
    font-weight: 400 !important;
    font-size: var(--tl-chapter-title-size) !important;
    line-height: var(--tl-chapter-title-line) !important;
    letter-spacing: var(--tl-chapter-title-letter) !important;
    color: var(--text-100) !important;

    max-width: var(--tl-chapter-title-max) !important;
    margin-left: auto;
    margin-right: auto;

    text-align: center !important;
  }

  /* Screen 24 special handling */
  #portfolio .portfolio-title {
    width: 100%;
  }

  #portfolio .portfolio-title span {
    display: block;
    white-space: normal;
  }
}
```

#### 2b. Narrow landscape safety 961–1060px

```css
@media (min-width: 961px) and (max-width: 1060px) and (orientation: landscape) {

  #musicians .musicians-title,
  #sensations .sens-title,
  #egypt .egypt-title,
  #formats .formats-main-title,
  #why .why-title-main,
  #portfolio .portfolio-title {
    font-size: clamp(40px, 4.4vw, 58px) !important;
    max-width: 860px !important;
  }
}
```

### Шаг 3: Проверка отсутствия перебивающих правил ниже

Убедиться, что после нового блока (который будет в самом конце файла) нет других правил для этих селекторов. Файл заканчивается на строке 11925, новый блок будет после неё — ниже ничего нет.

### Шаг 4: Верификация через Console

Открыть в браузере на viewport 1024×768 и выполнить скрипт проверки:

```js
const chapterTitles = [
  '#musicians .musicians-title',
  '#sensations .sens-title',
  '#egypt .egypt-title',
  '#formats .formats-main-title',
  '#why .why-title-main',
  '#portfolio .portfolio-title'
];

chapterTitles.forEach(sel => {
  const el = document.querySelector(sel);
  if (!el) return console.log(sel, 'NOT FOUND');

  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();

  console.log(sel, {
    fontSize: cs.fontSize,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    textAlign: cs.textAlign,
    maxWidth: cs.maxWidth,
    width: Math.round(r.width),
    left: Math.round(r.left),
    right: Math.round(r.right)
  });
});
```

Ожидаемые результаты:
- `fontSize` — одинаковый для всех 6 (вычисляется по `--tl-chapter-title-size`)
- `lineHeight` — 1.12 для всех
- `letterSpacing` — .04em для всех
- `textAlign` — center для всех
- `maxWidth` — 980px для всех

### Шаг 5: Визуальная проверка

Проверить viewport:
- 1024×768
- 1180×820
- (реальный tablet landscape если доступен)

### Границы (что НЕ трогаем)

| Компонент | Статус |
|-----------|--------|
| `index.html` | ❌ Не менять |
| `js/script.js` | ❌ Не менять |
| Тексты | ❌ Не менять |
| Desktop (>1366px) | ❌ Не трогать |
| Mobile (<761px) | ❌ Не трогать |
| Tablet portrait (761–960px portrait) | ❌ Не трогать |
| Композиция экранов | ❌ Не менять |
| Изображения | ❌ Не трогать |
| Анимация | ❌ Не менять |
| Глобальная нормализация | ❌ Не делать |
| Править только `css/styles.css` | ✅ Да |

### Риски и зависимости

1. **Порядок правил**: Новый блок будет последним в файле, поэтому `!important` — единственный способ перебить существующие правила в блоках выше (строки 5841–5875, 11452–11612).
2. **Конфликт с блоком 5841–5875**: Этот блок имеет `@media (min-width: 761px) and (max-width: 1100px)`, который может пересекаться с tablet landscape. Новый блок с `!important` должен перебить его на tablet landscape viewport.
3. **Конфликт с блоком 11452–11612**: У 24 экрана там свой font-size и max-width. Новый блок перебьёт его `!important`.
4. **Narrow safety**: Блок 961–1060px уже существует для screen 24 (строки 11614–11630). Новый safety блок будет перебивать его за счёт расположения ниже.
