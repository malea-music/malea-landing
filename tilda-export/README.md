# MALEA · Tilda export

Папка содержит версию текущего лендинга, разрезанную на несколько HTML-частей для вставки в Tilda через блоки с произвольным HTML-кодом.

## Как вставлять в Tilda

1. Создайте пустую страницу Tilda.
2. Добавьте подряд несколько HTML-блоков, например T123 / «HTML-код».
3. Скопируйте содержимое файлов из `parts/` строго по порядку: от `01-...html` до `11-...html`.
4. Ничего не объединяйте внутри Tilda: части специально разделены, чтобы большой код помещался в ограничения редактора.
5. Не меняйте порядок: сначала CSS, затем HTML-секции, затем JS.

## Цвета и шрифты

- Последняя CSS-часть содержит Tilda guard: она принудительно возвращает текстам MALEA только цвета из текущего лендинга.
- Шрифты Leotaro и Circe подключены через `https://events.malea-soundhealing.com/assets/fonts/...`. Если Tilda будет публиковаться без доступа к этому домену, загрузите эти 3 файла шрифтов в Tilda Files и замените URL в первой CSS-части.
- Google Font Cormorant Garamond оставлен как в текущем лендинге.

## Проверочный файл

`preview-assembled.html` — собранная локальная версия из этих же частей для быстрой проверки в браузере. В Tilda вставлять нужно именно файлы из `parts/`, а не preview-файл.

## Размеры частей

| Файл | Размер, bytes |
|---|---:|
| parts/01-css-tokens-base.html | 10260 |
| parts/02-css-nav-modal-components.html | 22723 |
| parts/03-css-screens.html | 50430 |
| parts/04-css-motion-tablets.html | 20976 |
| parts/05-css-ipad-mobile.html | 27485 |
| parts/06-css-final-tilda-color-font-guard.html | 18150 |
| parts/07-html-nav-opening-philosophy.html | 6667 |
| parts/08-html-live-player-performance-art.html | 12812 |
| parts/09-html-musicians-reviews-egypt-formats.html | 14222 |
| parts/10-html-integration-final-modals.html | 13213 |
| parts/11-js-bundle.html | 29405 |

Сгенерировано из текущих файлов `index.html`, `css/*.css`, `js/app.js` и `js/modules/*.js`.
