# Mekari POS — Business Rules

## Scope

The application covers one end-to-end flow: a cashier creates a customer order (transaction), stock is validated and deducted, and the sales report reflects the transaction's financial figures.

## Ordering & stock

1. An order contains one or more line items, each referencing a product and a quantity of at least 1.
2. An order cannot be created for a quantity greater than the available stock of any item in the order.
3. Stock is deducted at the moment the order is created.
4. Orders for unknown products are rejected.

## Money

All amounts are integer Indonesian Rupiah (IDR).

1. `line_total = unit_price × qty`
2. `subtotal = Σ line_total`
3. A percentage discount (0–100) applies to the subtotal: `discount_amount = round(subtotal × discount_pct / 100)`
4. PPN 11% tax applies **after** the discount: `tax_amount = round((subtotal − discount_amount) × 0.11)`
5. `grand_total = subtotal − discount_amount + tax_amount`

## Order void

1. A completed order can be voided.
2. Voiding an order restores the stock of **every** item in the order.
3. A voided order is **excluded from the sales report** — it must not contribute to any report figure.
4. An order can be voided only once; voiding an already-voided order is rejected with a conflict response.
5. Voiding an unknown order returns a not-found response.

## Sales report

1. The report takes `start_date` and `end_date` (format `YYYY-MM-DD`); **both boundary dates are inclusive**.
2. `start_date` must not be after `end_date`; both parameters are required and must be valid dates. Invalid input is rejected with a 400 response.
3. The report returns: `transaction_count`, `gross` (sum of subtotals), `discount`, `tax`, and `net` (sum of grand totals). Voided orders are excluded from all figures.
4. Report figures must reconcile with the underlying orders in the period.

## Performance targets

At 20 concurrent users:

| Endpoint                 | Target                    |
| ------------------------ | ------------------------- |
| `POST /api/orders`       | p95 latency < 300 ms      |
| `GET /api/reports/sales` | p95 latency < 500 ms      |
| All endpoints            | Error rate < 1%           |
