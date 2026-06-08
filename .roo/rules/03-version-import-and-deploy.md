# Version Import & Deploy — MALEA Landing

> Полный workflow для безопасного импорта новой версии лендинга и публикации.
> Основан на Git/Vercel Safety Rules (01) и расширяет их для задач переноса версий.

---

## 1. Команда: «Подготовь к деплою новую версию из: ПУТЬ_К_ПАПКЕ»

### 1.1 Pre-flight проверки (обязательно)

Перед любыми действиями выполнить:

```powershell
cd C:\Users\svoro\Downloads\Бэкап-2\malea_landing_deploy
git branch --show-current
git status
git remote -v
```

Убедиться:
- [ ] Текущая директория — `malea_landing_deploy`.
- [ ] Ветка — `dev`. Если нет — остановиться, запросить `git checkout dev`.
- [ ] Remote origin — `https://github.com/malea-music/malea-landing.git`. Если нет — остановиться, доложить.
- [ ] Статус чистый (`git status` показывает working tree clean ИЛИ только ожидаемые файлы). Если есть неожиданные изменения — остановиться, показать diff, запросить решение.

### 1.2 Аудит исходной папки

1. Проверить, что `ПУТЬ_К_ПАПКЕ` существует.
2. Проверить, что в `ПУТЬ_К_ПАПКЕ/index.html` существует.
3. Показать структуру `ПУТЬ_К_ПАПКЕ` (первый уровень).
4. Определить production whitelist (см. п. 1.3).
5. Определить exclude-list (см. п. 1.4).

### 1.3 Production whitelist (что можно переносить)

Только файлы, которые действительно используются в production-версии:

| Категория | Что входит |
|-----------|-----------|
| HTML | `index.html` — единственный entry point |
| CSS | Все `*.css`, реально подключённые через `<link>` в `index.html` |
| JS entry | `js/app.js` (или указанный в `<script type="module" src="...">`) |
| JS modules | Все `*.js`, реально импортируемые через `import` в app.js и модулях |
| Fonts | Файлы шрифтов из `assets/fonts/`, реально используемые через `@font-face` |
| Assets | Изображения, иконки, видео, аудио — только если есть локальные ссылки в проекте |

**Правила определения:**
- Парсить `index.html` из исходной папки (НЕ из deploy) на `<link rel="stylesheet" href="...">`.
- Парсить `index.html` на `<script type="module" src="...">`.
- Парсить `js/app.js` на ES-импорты (`import ... from './modules/...'`).
- Не переносить CSS/JS, которые не подключены/не импортированы.

### 1.4 Exclude-list (что запрещено к переносу)

Файлы и папки с любым из этих признаков:

- `*.bak`, `*.bak-*` — бэкап-файлы
- `backup/`, `backup-*` — папки бэкапов
- `old/`, `*-old.*` — старые версии
- `copy/`, `*-copy.*` — копии
- `draft*`, `*-draft.*` — черновики
- `experiment*`, `*-experiment.*` — эксперименты
- `screenshots/`, `screenshot*` — скриншоты
- `test-results/` — результаты тестов
- `playwright-report/` — отчёты Playwright
- `preview-check/`, `*-preview.*` — предпросмотр
- `tmp/`, `temp/`, `*.tmp` — временные файлы
- `node_modules/` — зависимости
- `.cache/` — кэш
- Любые файлы, не входящие в production whitelist

### 1.5 Backup

Перед копированием новых файлов создать backup заменяемых production-файлов:

- Путь: `C:\Users\svoro\Downloads\Бэкап-2\malea_landing_backups\YYYY-MM-DD_HHmmss\`
- Копировать туда ВСЕ файлы из production whitelist, которые СУЩЕСТВУЮТ в `malea_landing_deploy`
- Backup делается ДО переноса

### 1.6 Diff и Summary

Перед копированием показать пользователю:

```diff
Будут изменены:
  index.html
  css/00-tokens.css
  css/01-base.css
  ...

Будут добавлены:
  css/09-new-file.css

Будут удалены (из deploy, но не из Git):
  css/old-file.css

Backup: C:\Users\svoro\Downloads\Бэкап-2\malea_landing_backups\YYYY-MM-DD_HHmmss\
```

Запросить подтверждение у пользователя перед применением.

### 1.7 Копирование

- Копировать только production whitelist.
- Не копировать всю папку целиком.
- Не создавать внутри `malea_landing_deploy` подпапки `new-version`, `lab`, `archive`, `backup` и т.п.
- Не удалять служебные папки: `.git`, `.roo`, `scripts`, `docs`, `plans`, `qa`, `rebuild_1`, `.github`.
- Сохранять структуру папок относительно `malea_landing_deploy` (т.е. `css/file.css` → `malea_landing_deploy/css/file.css`).

### 1.8 Локальная проверка

После копирования запустить статический сервер для проверки:

```powershell
npx http-server . -p 8080 -c-1
```

Проверить:
- [ ] `index.html` загружается
- [ ] Все CSS подключены
- [ ] JS выполняется без ошибок консоли
- [ ] JS modules импортируются
- [ ] Шрифты загружаются
- [ ] Базовый UI отображается

### 1.9 После проверки

Показать `git diff --stat` и `git status`.

Спросить пользователя:
- «Запустить safe-save (commit + push в dev)?»
- Если да → выполнить `. \scripts\safe-save.ps1 "Import new version from <source>"`
- Если нет → только перенос, commit не делать

---

## 2. Команда: «Опубликуй» / «Опубликуй на сайт»

### 2.1 Pre-flight

- [ ] Текущая директория — `malea_landing_deploy`.
- [ ] Ветка — `dev`.
- [ ] `git status` — чистый (нет незакоммиченных изменений).
- [ ] Если есть изменения → сначала выполнить safe-save.

### 2.2 Публикация

Только после явной команды пользователя выполнить:

```powershell
.\scripts\publish.ps1 PUBLISH
```

### 2.3 После публикации

Доложить:
- Production домен: `https://events.malea-soundhealing.com`
- Ветка main обновлена
- Vercel деплой запущен

---

## 3. Запреты (нарушение недопустимо)

Без явной команды пользователя ЗАПРЕЩЕНО:

- запускать `publish.ps1`
- делать production-публикацию
- делать `git push -f` (force push)
- делать `git reset --hard`
- делать `git clean -fd`
- удалять старые папки проекта
- массово копировать всю новую папку внутрь `malea_landing_deploy`
- создавать внутри `malea_landing_deploy` подпапки `new-version`, `lab`, `archive`, `backup`
- переключаться на ветку `main`
- делать merge в `main`
- запускать `import-version.ps1` без параметра `-SourcePath`
- использовать `-CommitAndPush` без согласования с пользователем

---

## 4. Что делать при ошибках

| Ситуация | Действие |
|----------|----------|
| SourcePath не существует | Остановиться. Сообщить. Не создавать папку. |
| В SourcePath нет index.html | Остановиться. Папка не является версией лендинга. |
| Ветка не dev | Запросить `git checkout dev`. Не продолжать без смены ветки. |
| Remote не совпадает | Остановиться. Показать ожидаемый и фактический remote. |
| Dirty status (неожиданные изменения) | Остановиться. Показать diff. Запросить решение. |
| Backup не создался | Остановиться. Не переносить файлы. |
| Локальная проверка не пройдена | Откатить изменения из backup. Сообщить. |

---

## 5. Скрипты

| Скрипт | Назначение | Флаг |
|--------|-----------|------|
| `scripts/import-version.ps1` | Перенос новой версии | `-SourcePath` (обяз.), `-CommitAndPush` (опц.) |
| `scripts/safe-save.ps1` | Commit + push в dev | `-Message` (опц., по умолч. "Safe checkpoint") |
| `scripts/publish.ps1` | Публикация dev → main → production | `PUBLISH` (обяз.) |

---

## 6. Полный workflow в одной команде для Roo

Когда пользователь говорит:
> «Подготовь к деплою новую версию из: C:\путь\к\папке»

Roo выполняет (через код ИЛИ через вызов `import-version.ps1`):

1. `cd C:\Users\svoro\Downloads\Бэкап-2\malea_landing_deploy`
2. Проверка ветки/статуса/remote
3. Аудит исходной папки
4. Определение whitelist
5. Backup
6. Diff/summary → запрос подтверждения
7. Копирование whitelist
8. Локальная проверка (http-server)
9. Опционально: safe-save → push в dev
10. Отчёт

Когда пользователь говорит:
> «Опубликуй»

Roo выполняет:
1. Проверка ветки/статуса/remote
2. `.\scripts\publish.ps1 PUBLISH`
3. Отчёт
