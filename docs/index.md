---
layout: doc
next:
   text: '🚀 Get Started'
   link: '/get-started'
---

# 📚 Introduction
<div class="tip custom-block" style="padding-top: 8px">

Just want to try it out? Skip to the [🚀 Get Started ](./get-started).

</div>

## 👀 Overview
**Cano TS** is a lightweight and type-safe utility for **function composition** in TypeScript, inspired by [Elixir’s pipe operator](https://hexdocs.pm/elixir/Kernel.html#%7C%3E/2) `(|>)`. It allows you to build **fluent, readable, and maintainable pipelines** for both **synchronous** and **asynchronous** operations.



```typescript
import { pipeSync } from "cano-ts";

const applyDiscount =
  (price: number, discount: number) => price - discount;
const applyTax =
  (price: number, taxRate: number) => price + price * taxRate;
const formatPrice =
  (price: number, currency: string) => `${currency} ${price.toFixed(2)}`;

const finalPrice = pipeSync(100)
  .next(applyDiscount, 10) // 100 - 10 = 90
  .next(applyTax, 0.2) // 90 + 20% tax = 108
  .next(formatPrice, "$") // Format as "$ 108.00"
  .result();

console.log(finalPrice); // "$ 108.00"
```

## ✨ Features

- ✅ **Fluent API** – Chain functions using `.next()`
- ✅ **Supports async & sync pipelines** – `pipe()` for `async`, `pipeSync()` for sync
- ✅ **Error Handling – Configurable PipeError** for better debugging
- ✅ **Function History Tracking** – Debug easily with `.log()`
- ✅ **Fully Type-Safe** – Leverages TypeScript generics for strong typings

