# Web3Market Mini Apps

Монорепозиторий содержит два фронтенда и бэкенд:

- **Market** (`apps/market`) — публичная витрина mini‑app (`/`).
- **Seller Console** (`apps/seller`) — кабинет продавца (`/seller`).
- **API** (`server/`) — Express + SQLite: авторизация ton-proof, товары, заказы, рейтинг, загрузка изображений.

## Требования

- Node.js ≥ 22 и npm.
- Docker + Docker Compose (для продакшена).
- SQLite хранится внутри `server/data`.

## Установка и разработка

```bash
npm install                # фронтенды и тулчейн
cd server && npm install   # API
cp .env.example .env       # заполните TOKEN_SECRET, PUBLIC_BASE_URL и др.
```

### Режим разработки

1. API:
   ```bash
   cd server
   npm run dev
   ```
2. Фронтенды:
   ```bash
   npm run dev:market
   npm run dev:seller
   ```

В корневой `.env` установите `VITE_API_URL=http://localhost:4000`, чтобы SPA ходили в локальный сервер. Переключение на mainnet — через `TON_NETWORK=mainnet`.

### Сборка

```bash
npm run build             # market + seller → dist/market и dist/seller
cd server && npm run build   # компиляция API (dist/index.js)
```

Проверка:

```bash
npm run preview:market
npm run preview:seller
npm run lint
```

## API (Express)

| Метод | Путь                   | Описание                                                     |
|-------|------------------------|--------------------------------------------------------------|
| POST  | `/auth/challenge`     | Генерирует payload для ton-proof                             |
| POST  | `/auth/verify`        | Проверяет подпись, создаёт запись продавца и JWT‑токен       |
| GET   | `/products` / `/:id`  | Общий список / карточка товара                               |
| POST  | `/products`           | Создать товар (ton-proof токен, изображение как data URL)    |
| POST  | `/products/:id/rating`| Поставить рейтинг 1–5                                        |
| GET   | `/orders`             | Заказы текущего продавца (JWT)                               |
| POST  | `/orders`             | Создать заказ (учитывается комиссия 3%)                      |
| PATCH | `/orders/:id`         | Обновить статус (pending/paid/delivered/canceled/refunded)   |

Изображения пережимаются `sharp` (JPEG, ≤600×600px, ≤600 KB) и хранятся в `UPLOADS_DIR`. Все публичные URL строятся от `PUBLIC_BASE_URL` (пример: `https://web3market.shop/uploads/...`).

## Docker Compose

В корне есть `docker-compose.yml`, который запускает два контейнера:

| Сервис | Описание                             | Dockerfile        |
|--------|---------------------------------------|-------------------|
| `api`  | Express + SQLite + `/uploads`         | `server/Dockerfile` |
| `web`  | Nginx со статикой + proxy `/api`,`/uploads` | `Dockerfile.web`  |

### Подготовка

1. Скопируйте `.env.example` → `.env` и задайте значения:
   ```env
   TOKEN_SECRET=<длинный случайный>
   PUBLIC_BASE_URL=https://web3market.shop
   TON_PROOF_DOMAIN=web3market.shop
   VITE_API_URL=/api           # для сборки SPA
   DATABASE_PATH=/app/data/data.sqlite
   UPLOADS_DIR=/app/uploads
   ```
2. Соберите и запустите:
   ```bash
   docker compose up --build -d
   ```
   По умолчанию Nginx слушает `8080`, API сидит внутри сети на `api:4000`.
3. Настройте внешний reverse‑proxy/SSL (у вас уже есть сертификат для `https://web3market.shop/`) и прокиньте 443/80 → `localhost:8080`.

Тома:

- `./server/data` — SQLite.
- `./server/uploads` — изображения.

## Развёртывание на 185.216.87.125 / web3market.shop

1. Укажите DNS домена на IP сервера.
2. Склонируйте репозиторий, установите Docker/Compose.
3. `cp .env.example .env`, заполните `TOKEN_SECRET`, `PUBLIC_BASE_URL=https://web3market.shop`, `TON_PROOF_DOMAIN=web3market.shop`.
4. `docker compose up --build -d`.
5. Настройте SSL‑прокси (nginx/Caddy/traefik) и прокиньте запросы на контейнер `web` (порт 8080).
6. Проверьте:
   - `https://web3market.shop/` — Market SPA.
   - `https://web3market.shop/seller/` — Seller Console (подпись ton-proof).
   - `https://web3market.shop/api/health` → `{ ok: true }`.
   - Создание товара загружает изображение в `server/uploads` и запись в `server/data`.

## Дополнительно

- Комиссия владельца задаётся в `.env` (`PLATFORM_FEE=0.03` = 3%).
- Seller Console хранит токен в `localStorage` (`useSellerSession`), выход — в UI.
- Для mainnet измените `TON_NETWORK=mainnet`, `PUBLIC_BASE_URL` и пересоберите API/SPA.
- `npm run lint`, `npm run build:market`, `npm run build:seller`, `npm run build --prefix server` — базовый чек перед деплоем.

Репозиторий готов к дальнейшей кастомизации (добавление оплаты, CI/CD, внешних CDN) — все настройки сосредоточены в `.env` и `server/src/config.ts`.
