# DevPulse Mini App — Premium Template

## Backend (Go + PostgreSQL)

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `ADMIN_TOKEN`, etc. The admin token stays local (ignored by git).
2. Build the API binary locally (requires Go 1.22 and module cache with dependencies):

   ```bash
   cd server
   GOOS=linux GOARCH=amd64 go build -o bin/api ./cmd/api
   cd ..
   ```

3. Start Postgres + API (set `POSTGRES_PORT` in `.env` if 5432 is busy):

   ```bash
   docker compose up --build
   ```

   The compose file will reuse the prebuilt `server/bin/api` without downloading modules.

## Frontend (React + Vite)

```bash
npm install
npm run dev   # or npm run build
```

- `VITE_API_BASE_URL` (default `http://localhost:8080/api`) can be overridden in `.env`.
- Admin panel lives at `/#/admin`; paste the admin token once, upload assets, and publish products.

## Telegram
- Set Menu Button → Web App → https://perekoshik.github.io/
- Open inside Telegram to see profile data
