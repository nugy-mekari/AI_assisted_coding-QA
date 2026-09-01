# Mekari POS — API Reference

Base URL: `http://localhost:3000/api`

Interactive documentation (Swagger UI) is served at the base URL itself: open `http://localhost:3000/api` in a browser. The OpenAPI JSON is at `http://localhost:3000/api-json`.

All endpoints except `POST /auth/login` and `GET /health` require a bearer token:
`Authorization: Bearer <access_token>`.

## Auth

### POST /auth/login

Request:

```json
{ "email": "cashier@mekaripos.test", "password": "PixelPos123!" }
```

Response `200`:

```json
{ "access_token": "…", "user": { "id": "…", "email": "…", "name": "…" } }
```

`401` on invalid credentials.

## Products

### GET /products

Returns the product catalog with current stock levels.

```json
[
  { "id": "uuid", "name": "Kopi Susu Gula Aren", "sku": "BEV-001", "price": 24000, "stock": 120 }
]
```

### GET /products/{id}

Single product. `404` if unknown, `400` if the id is not a UUID.

## Orders

### POST /orders

Request:

```json
{
  "items": [ { "product_id": "uuid", "qty": 2 } ],
  "discount_pct": 10
}
```

- `items`: required, at least one entry; `qty` is an integer ≥ 1.
- `discount_pct`: optional number 0–100, defaults to 0.

Response `201` — the created order:

```json
{
  "id": "uuid",
  "orderNumber": "POS-…",
  "items": [ { "productId": "uuid", "productName": "…", "unitPrice": 24000, "qty": 2, "lineTotal": 48000 } ],
  "subtotal": 48000,
  "discountPct": 10,
  "discountAmount": 4800,
  "taxAmount": 4752,
  "grandTotal": 47952,
  "status": "COMPLETED",
  "createdAt": "ISO-8601"
}
```

Errors: `400` invalid payload, `422` unknown product, `401` missing/invalid token.

### GET /orders

Most recent orders (up to 100).

### GET /orders/{id}

Single order with items. `404` if unknown.

### POST /orders/{id}/void

Voids a completed order: restores the stock of every item and excludes the order from the sales report.

Response `200` — the order with `"status": "VOIDED"`.

Errors: `404` unknown order, `409` if the order is already voided, `400` if the id is not a UUID.

## Reports

### GET /reports/sales?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD

Response `200`:

```json
{
  "start_date": "2026-08-01",
  "end_date": "2026-08-26",
  "transaction_count": 12,
  "gross": 1250000,
  "discount": 75000,
  "tax": 129250,
  "net": 1304250
}
```

Errors: `400` for missing/invalid dates or `start_date` after `end_date`.

## Misc

### GET /health

Unauthenticated liveness check: `{ "status": "ok" }`.
