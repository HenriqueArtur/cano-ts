# 🚀 Get Started
This guide will walk you through *installing* **Cano TS** and using it in both *synchronous* and *asynchronous* pipelines.

## 📦 Installation

::: code-group

```shell [npm]
npm install cano-ts
```

```shell [pnpm]
pnpm add cano-ts
```

```shell [yarn]
yarn add cano-ts
```

:::

## 🔥 Basic Usage
### 🔹 Sync Pipeline (`pipeSync`)

Use `pipeSync()` when working with synchronous functions.

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

✅ Key Benefits:
- **Readable & Maintainable** – *No deeply nested function calls.*
- **Pass Additional Arguments** – *Each function can take extra parameters.*
- **Simple & Efficient** – *Works well for transformations like data formatting.*

### 🔹 Async Pipeline (`pipe`)

Use `pipe()` for asynchronous functions like API calls or database operations.

```typescript
import { pipe } from "cano-ts";
import DB from "../db"

async function fetchUser(id: number, db: DbInstance): Promise<User> {
  return db.getUserById(id);
}

async function updateRole(user: User, newRole: string): User {
  return { ...user, role: newRole };
}

async function saveToDB(user: User, db: DbInstance): Promise<User> {
  await db.updateUser(user);
  return user;
}

// Use Cano Ts
const result = await pipe(1)
  .next(fetchUser, DB)
  .next(updateRoleTo, "admin")
  .next(saveToDB, DB)
  .result();

console.log(result); // { id: 1, name: "Alice", role: "admin" }
```

✅ Key Benefits:
- **No More `.then()` Chains** – *Functions execute sequentially.*
- **Readable Flow** – *Data flows top to bottom.*
- **Works with Promises** – *Handles async/await operations easily.*

## 📌 Debugging with `.log()`

Use `.log()` to inspect intermediate values without breaking the pipeline:
```typescript
await pipe(5)
  .next(async (x) => x * 2)
  .log() // [PipeAsync] anonymous -> 10
  .next(async (x) => x + 1)
  .log("After increment:") // After increment: 11
  .result();
```
