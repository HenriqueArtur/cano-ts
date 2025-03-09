# Cano TS


## 🚀 Get Started
```typescript
import { pipeSync } from "cano-ts";

const add = (x: number, y: number) => x + y;
const multiply = (x: number, factor: number) => x * factor;
const format = (x: number, prefix: string) => `${prefix} ${x}`;

const result = pipeSync(5)
  .next(add, 3) // 5 + 3 = 8
  .next(multiply, 2) // 8 * 2 = 16
  .next(format, "Result:")
  .result();

console.log(result); // "Result: 16"
```

## 📖 About cano-ts

When working with transformations in **JavaScript** and **TypeScript**, we often end up with deeply nested function calls or complex `.then()` chains for asynchronous operations. **cano-ts** solves this problem by introducing a *fluent, pipeline-based API for function chaining*.

```typescript
/* BEFORE: Traditional Promise Chaining */
async function fetchUser(id: number, db: DbInstance): Promise<User> {
  return db.getUserById(id);
}

function updateRoleTo(user: User, newRole: string): User {
  return { ...user, role: newRole };
}

async function saveToDB(user: User, db: DbInstance): Promise<User> {
  await db.updateUser(user);
  return user;
}

// ❌ Callbacks required for passing extra arguments
fetchUser(1, DB)
  .then((user) => updateRoleTo(user, "admin"))
  .then((updatedUser) => saveToDB(updatedUser, DB))
  .then(console.log)
  .catch(console.error);

/* ✅ AFTER: Using cano-ts for a Clean Pipeline */
const result = await pipe(1)
  .next(fetchUser, DB)
  .next(updateRoleTo, "admin")
  .next(saveToDB, DB)
  .result();

console.log(result);
```

## ✨ Features

- ✅ **Fluent API** – Chain functions using `.next()`
- ✅ **Supports async & sync pipelines** – `pipe()` for `async`, `pipeSync()` for sync
- ✅ **Error Handling – Configurable PipeError** for better debugging
- ✅ **Function History Tracking** – Debug easily with `.log()`
- ✅ **Fully Type-Safe** – Leverages TypeScript generics for strong typings

## 📦 Installation
**npm**
```sh
npm install cano-ts
```

You can also use other package manager:
```sh
pnpm add cano-ts
# OR
yarn add cano-ts
```
