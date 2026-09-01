# Mekari POS

A small Point of Sale web application. One frontend (Vue 3 + Mekari Pixel), one backend (NestJS + PostgreSQL).

## Run

Requirements: Docker with Compose.

```bash
docker compose up --build
```

First build takes a few minutes. When ready:

| Service  | URL                          |
| -------- | ---------------------------- |
| Web app  | http://localhost:8080        |
| API      | http://localhost:3000/api    |
| API docs (Swagger) | http://localhost:3000/api (interactive) |

The database is seeded automatically on first start (product catalog and one cashier account).

## Sign in

| Field    | Value                    |
| -------- | ------------------------ |
| Email    | `cashier@mekaripos.test` |
| Password | `PixelPos123!`           |

## Documents

- `SPEC.md` — business rules of the application
- `API.md` — API reference

## Reset

To reset all data back to the seeded state:

```bash
docker compose down -v && docker compose up --build
```
