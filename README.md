# News API and Frontend

![Screenshot](frontend/images/image.webp)

JS backend + TS frontend in a single repo.

## Project Structure

```txt
news-api/
  src/          # Express API (JavaScript)
  frontend/     # React + TypeScript + Tailwind frontend
```

## Setup

1. Install backend dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
npm install --prefix frontend
```

## Development

Run API + frontend together:

```bash
npm run dev
```

Run API only:

```bash
npm run dev:api
```

Run frontend only:

```bash
npm run dev:web
```

Run frontend tests:

```bash
npm run test:web
```

Run both:

```bash
npm run dev:all
```

`dev:all` is an alias for `npm run dev`.

Frontend runs on `http://localhost:5173` and proxies `/api` + `/health` to the backend on `http://localhost:4000`.

## Railway DB

Use Railway's `DATABASE_PUBLIC_URL` for local development (not `DATABASE_URL`, which is for Railway private networking).

Example `.env` values:

```bash
DATABASE_PUBLIC_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_SSL=true
```

`DATABASE_SSL` is optional. If omitted, SSL is enabled automatically for non-local database hosts.

Railway-style template values like `${{PGUSER}}` are supported and resolved from env vars.

`db:setup` and `db:seed` now refuse non-local databases by default.

