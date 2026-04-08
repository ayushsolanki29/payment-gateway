# UPI Pay Kit

Installable browser package for React, Next.js, or plain JavaScript apps.

## Install

```bash
npm install upi-pay-kit
```

For the React wrapper:

```bash
npm install react
```

## Basic Usage

```js
import { createUPIPaymentGateway } from "upi-pay-kit";

const gateway = createUPIPaymentGateway({
  amount: 1000,
  merchantName: "My Store",
  merchantUpiId: "mystore@upi",
  theme: "light",
  size: "md",
  onSuccess(transaction) {
    console.log("success", transaction);
  },
});

gateway.open();
```

## React Component

```jsx
"use client";

import { UPIPaymentButton } from "upi-pay-kit/react";

export default function CheckoutButton() {
  return (
    <UPIPaymentButton
      className="pay-button"
      gatewayOptions={{
        amount: 1000,
        merchantName: "My Store",
        merchantUpiId: "mystore@upi",
        theme: "dark",
        size: "lg",
      }}
    >
      Pay Now
    </UPIPaymentButton>
  );
}
```

## React Imperative Control

```jsx
"use client";

import { useRef } from "react";
import { UPIPaymentButton } from "upi-pay-kit/react";

export default function CheckoutButton() {
  const paymentRef = useRef(null);

  return (
    <UPIPaymentButton
      ref={paymentRef}
      gatewayOptions={{
        amount: 1200,
        merchantName: "My Store",
        merchantUpiId: "mystore@upi",
      }}
    >
      Pay Now
    </UPIPaymentButton>
  );
}
```

The forwarded ref exposes:

- `open(overrides?)`
- `close()`
- `update(options)`
- `destroy()`
- `isOpen()`

## Next.js Note

Initialize this package only in a client component because it needs `window` and `document`.

## API

```js
const gateway = createUPIPaymentGateway(options);
```

Available methods:

- `gateway.open(overrides?)`
- `gateway.close()`
- `gateway.update(options)`
- `gateway.destroy()`
- `gateway.isOpen()`

Important options:

- `amount`: amount in paise
- `merchantName`
- `merchantUpiId`
- `theme`: `"light"` or `"dark"`
- `size`: `"sm"`, `"md"`, or `"lg"`
- `themeColor`
- `ctaLabel`
- `appButtonLabel`
- `paymentTimeout`
- `successRate`
- `onSuccess(transaction)`
- `onFailure(transaction)`
- `onClose(transaction)`

## Demo

Open [index.html](./index.html) in a browser to try the package locally.
