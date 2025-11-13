# Web3Market Mini Apps

Репозиторий содержит два отдельных фронтенда:

- **Market** (`apps/market`) — публичная витрина /mini-app по адресу `/`
- **Seller Console** (`apps/seller`) — управление магазином и товарами, деплой в подпапку `/seller`

## Установка
```
npm i
```

## Разработка
```
npm run dev:market   # главная витрина
npm run dev:seller   # консоль продавца
```

## Сборка и предпросмотр
```
npm run build            # market + seller
npm run preview:market   # прогон dist/market
npm run preview:seller   # прогон dist/seller
```

Скрипт `npm run postbuild` автоматически кладёт `404.html` в обе папки, чтобы SPA корректно работали на GitHub Pages.

## Telegram ссылки
- Market: `https://perekoshik.github.io/`
- Seller Console: `https://perekoshik.github.io/seller/`

Открывайте мини‑аппы внутри Telegram — тогда подтягивается `initData` и TonConnect.

## Деплой
Контрактные артефакты по-прежнему хранятся в корневой папке `build/`, поэтому для GitHub Pages используем отдельный worktree (например, `pages/`).

```
git worktree add pages gh-pages   # один раз
npm run build                     # собираем dist/market и dist/seller
rsync -av dist/market/ pages/
rsync -av dist/seller/ pages/seller/
cd pages && git add . && git commit -m "deploy" && git push origin gh-pages
```

Для удобства есть скрипт `scripts/deploy.sh`, который выполняет весь цикл сразу:

```
scripts/deploy.sh "feat: update"
```

Команда последовательно коммитит код в `main`, запускает `npm run build`, синхронизирует `dist` → `pages/` и пушит `gh-pages`.

После пуша Pages раздаёт витрину по `https://perekoshik.github.io/`, а консоль продавца по `https://perekoshik.github.io/seller/`.

## Сеть TON
По умолчанию все хуки/клиенты работают в **testnet** (см. `packages/shared/src/config.ts`). Чтобы переключиться на mainnet, задайте в `.env` переменную `VITE_TON_NETWORK=mainnet` и перезапустите dev/build. Seller UI показывает предупреждение, если кошелёк подключён к другой сети, и блокирует транзакции до переключения.

## Backend API
В каталоге `server/` живёт отдельное приложение на Express + SQLite.

Запуск локально:
```
cd server
cp .env.example .env           # DATABASE_PATH/PORT можно оставить по умолчанию
npm install
npm run dev
```

Для продакшена:
```
npm run build
PORT=4000 DATABASE_PATH=/var/www/web3market/data/data.sqlite npm run start
```
или `pm2 start npm --name web3market-api -- start`.

> **Важно:** база данных теперь хранится в SQLite‑файле (по умолчанию `server/data.sqlite`).
> Путь можно перенести на сервер через переменную `DATABASE_PATH`.

Фронтенды используют переменную `VITE_API_URL`. Для разработки добавьте в `.env` (в корне репо):
```
VITE_API_URL=http://localhost:4000
```

В продакшене соберите мини‑аппы с `VITE_API_URL=https://web3market.duckdns.org` (или вашим доменом), а API запустите на том же домене через HTTPS.
