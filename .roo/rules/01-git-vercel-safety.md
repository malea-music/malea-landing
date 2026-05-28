# Git / Vercel Safety Rules for MALEA Landing

## Главная схема

- dev = тестовая рабочая ветка.
- main = production-ветка.
- events.malea-soundhealing.com обновляется только из main.
- Все обычные правки выполняются только в dev.

## Перед любой работой

Всегда выполнить:

- git status
- git branch --show-current

Если текущая ветка не dev — остановиться и попросить пользователя выполнить:

- git checkout dev

## Обычная работа Roo Code

После каждой успешно завершённой задачи Roo Code должен автоматически выполнить safe-save:

- .\scripts\safe-save.ps1 "краткое описание изменений"

Safe-save создаёт обычную безопасную копию только в dev:

- commit в dev;
- push в dev;
- Vercel preview;
- production не обновляется.

## Запреты без прямой команды пользователя "опубликуй"

Запрещено:

- переходить в main;
- делать merge в main;
- делать push в main;
- публиковать production;
- выполнять git push -f;
- выполнять git reset --hard;
- выполнять git clean -fd.

## Production publish

Публикация разрешена только если пользователь прямо написал:

- "опубликуй"
- "опубликуй на сайт"
- "обнови основной домен"
- "залей в production"

Только после этого можно выполнить:

- .\scripts\publish.ps1 PUBLISH

## Никогда не коммитить

Никогда не добавлять в Git:

- .env
- .env.local
- node_modules/
- .vercel/
- API-ключи
- токены
- пароли
- секреты
- qa/screenshots/
- screenshots-stage-f/

## Отчёт после каждой задачи

После каждой задачи сообщить:

- текущую ветку;
- какие файлы изменены;
- что изменено;
- был ли commit;
- был ли push;
- это dev/preview или production.
