# Web3Market API

Небольшой HTTP‑сервер на Express + SQLite. Его можно развернуть отдельно от фронтенда
(например, на VPS под `web3market.duckdns.org`) и держать в нём все данные магазинов,
товаров, профилей и заказов.

## Быстрый старт

```bash
cd server
cp .env.example .env          # при необходимости поправьте DATABASE_PATH/PORT
npm install
npm run dev                   # локальный режим через tsx
```

Для продакшена:

```bash
npm run build
PORT=4000 DATABASE_PATH=/var/www/web3market/data/data.sqlite npm run start
```

или через pm2:

```bash
pm2 start npm --name web3market-api -- start --watch --cwd /var/www/web3market/server \
  --env PORT=4000 --env DATABASE_PATH=/var/www/web3market/data/data.sqlite
pm2 save
```

## Переменные окружения

| Переменная      | По умолчанию      | Описание                                      |
|-----------------|-------------------|-----------------------------------------------|
| `PORT`          | `4000`            | Порт HTTP‑сервера                             |
| `DATABASE_PATH` | `./data.sqlite`   | Путь к файлу SQLite (создаётся автоматически) |

## Конечные точки

| Метод | Путь                 | Описание                                 |
|-------|----------------------|------------------------------------------|
| GET   | `/health`            | Проверка статуса сервера                 |
| GET   | `/shops`             | Список магазинов                         |
| POST  | `/shops`             | Создать/обновить магазин                 |
| GET   | `/items`             | Список товаров (опционально по магазину) |
| GET   | `/items/:id`         | Карточка товара                          |
| POST  | `/items`             | Создать/обновить товар                   |
| GET   | `/profiles/:wallet`  | Профиль покупателя                       |
| PUT   | `/profiles/:wallet`  | Сохранить адрес доставки                 |
| GET   | `/orders`            | Список заказов (фильтр по buyer/shop)    |
| POST  | `/orders`            | Создать заказ                            |
| PATCH | `/orders/:id`        | Обновить статус заказа                   |

> ⚠️ Авторизация и платёжная логика зависят от фронтенда и TonConnect,
> здесь хранится только состояние.
