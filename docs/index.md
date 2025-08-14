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
- ✅ **Function History Tracking** – Debug easily with `.log()`
- ✅ **Array Utilities** – Built-in `E` module with functional array operations
- ✅ **Fully Type-Safe** – Leverages TypeScript generics for strong typings

## 🔧 Array Utilities with E Module

The `E` module provides functional array operations that integrate seamlessly with pipes:

```typescript
import { pipeSync, E } from "cano-ts";

// Data processing pipeline
const users = [
  { id: 1, name: "Alice", age: 25, active: true },
  { id: 2, name: "Bob", age: 30, active: false },
  { id: 3, name: "Charlie", age: 35, active: true },
  { id: 4, name: "Diana", age: 28, active: true },
];

const activeUserNames = pipeSync(users)
  .next(E.filter, (user) => user.active)     // Filter active users
  .next(E.sort, (a, b) => b.age - a.age)     // Sort by age (desc)
  .next(E.map, (user) => user.name)          // Extract names
  .next(E.slice, 0, 2)                       // Take first 2
  .next(E.join, " & ")                       // Join with "&"
  .result();

console.log(activeUserNames); // "Charlie & Diana"
```

**Available E Functions:**
- `E.map`, `E.filter`, `E.reduce`, `E.find` - Core transformations
- `E.sort`, `E.reverse`, `E.slice` - Array manipulation  
- `E.concat`, `E.flat`, `E.join` - Combining and formatting
- `E.every`, `E.some`, `E.includes` - Boolean operations

## 🌟 Real-World Examples

### Data Processing Pipeline
```typescript
import { pipe, E } from "cano-ts";

// Process sales data
const salesData = [
  { product: "Laptop", price: 999, category: "Electronics", inStock: true },
  { product: "Phone", price: 699, category: "Electronics", inStock: false },
  { product: "Book", price: 25, category: "Education", inStock: true },
  { product: "Tablet", price: 399, category: "Electronics", inStock: true },
];

const electronicsReport = pipeSync(salesData)
  .next(E.filter, (item) => item.category === "Electronics" && item.inStock)
  .next(E.sort, (a, b) => b.price - a.price)
  .next(E.map, (item) => `${item.product}: $${item.price}`)
  .next(E.join, "\n")
  .result();

console.log(electronicsReport);
// Laptop: $999
// Tablet: $399
```

### Async Data Fetching with Processing
```typescript
async function fetchUsers() {
  const response = await fetch('/api/users');
  return response.json();
}

async function enrichUserData(user) {
  const profile = await fetch(`/api/profiles/${user.id}`);
  return { ...user, profile: await profile.json() };
}

const topActiveUsers = await pipe()
  .next(fetchUsers)                           // Fetch all users
  .next(E.filter, (user) => user.active)     // Filter active users
  .next(E.slice, 0, 5)                       // Take top 5
  .next(E.map, enrichUserData)               // Enrich each user (parallel)
  .result();
```

