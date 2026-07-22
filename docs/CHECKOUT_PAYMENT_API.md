# Website checkout / payment API contract

Browser calls same-origin Worker BFF paths. The Worker already proxies
`/_drswift/checkout/*` → `{ORIGIN}/api/v1/public/checkout/*` with Basic Auth.

Wire these on CMS (or payment service) when ready.

## Endpoints

### `POST /_drswift/checkout/orders`

Create a pending order from cart + patient details.

Request body (from `assets/js/checkout-api.js`):

```json
{
  "amount": 2499,
  "currency": "INR",
  "patient": {
    "name": "Ada Lovelace",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "gender": "Female",
    "age": "32",
    "phone": "9876543210",
    "firebaseUid": null
  },
  "address": { "city": "Hyderabad", "line1": "…" },
  "schedule": {
    "sampleDay": "Tomorrow",
    "sampleDayLabel": "Tomorrow",
    "sampleWindow": "Morning"
  },
  "lineItems": [{ "slug": "…", "name": "…", "price": 2499, "customPanels": null }],
  "paymentMethod": "upi",
  "paymentBrand": "gpay",
  "bank": null
}
```

Response:

```json
{ "ok": true, "orderId": "ORD-…", "amount": 2499, "currency": "INR", "status": "pending_payment" }
```

### `POST /_drswift/checkout/payments`

Start a payment session for an order.

```json
{
  "orderId": "ORD-…",
  "amount": 2499,
  "currency": "INR",
  "method": "card | upi | netbanking",
  "brand": "gpay | phonepe | upi | card | netbanking",
  "bank": "HDFC Bank",
  "returnUrl": "https://drswift.in/book?payment=return"
}
```

Response (card / netbanking):

```json
{
  "ok": true,
  "paymentId": "PAY-…",
  "orderId": "ORD-…",
  "status": "requires_action",
  "checkoutUrl": "https://payment-partner/…",
  "amount": 2499,
  "currency": "INR"
}
```

Response (UPI):

```json
{
  "ok": true,
  "paymentId": "PAY-…",
  "orderId": "ORD-…",
  "status": "pending",
  "upiId": "merchant@upi",
  "upiIntent": "upi://pay?…",
  "qrDataUrl": "data:image/png;base64,…",
  "amount": 2499,
  "currency": "INR"
}
```

### `GET /_drswift/checkout/payments/:paymentId`

Poll / return-from-redirect confirmation.

```json
{
  "ok": true,
  "paymentId": "PAY-…",
  "orderId": "ORD-…",
  "status": "pending | paid | failed | cancelled",
  "reference": "DS-…",
  "method": "UPI",
  "amount": 2499,
  "paidAt": "2026-07-22T10:00:00.000Z"
}
```

After gateway redirect, the site opens `/book?payment=return&paymentId=…` and calls this GET.

## Frontend behaviour today

- Card / netbanking: create order → create payment → redirect to `checkoutUrl` (or error if missing).
- UPI: create order → create payment → show QR / intent → poll status; “Check payment status” re-queries.
- Confirmation + cart clear only when status is `paid` / `captured` / `success`.
- No PAN/CVV collected on-site.

## Local UI stub (until APIs exist)

```js
localStorage.setItem("drswift.payment.stub", "1");
```

Uses the same screens; marks confirmation copy as stub. Remove before production.
