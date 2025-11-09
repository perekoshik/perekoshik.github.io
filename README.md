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
