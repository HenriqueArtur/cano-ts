<h1 align="center">Cano Ts</h1>

<p align="center">
A lightweight utility, inspired by <a href="https://hexdocs.pm/elixir/Kernel.html#%7C%3E/2" target="_blank">Elixir’s pipe operator |></a>, for composing sync and async functions in a clean, readable pipeline. 
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/cano-ts" target="_blank">
    <img src="https://img.shields.io/npm/v/cano-ts.svg" alt="npm version" height="18">
  </a>
  <a href="https://github.com/HenriqueArtur/cano-ts" target="_blank">
    <img src="https://img.shields.io/npm/l/cano-ts.svg" alt="MIT license" height="18">
  </a>
  <a href="https://gitmoji.dev">
    <img
      src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg"
      alt="Gitmoji"
    />
  </a>
</p>
<p align="center">
  <a href="https://github.com/HenriqueArtur/cano-ts/actions/workflows/unit-tests.yaml">
    <img src="https://github.com/HenriqueArtur/cano-ts/actions/workflows/unit-tests.yaml/badge.svg" alt="tests">
  </a>
  <a href="https://github.com/HenriqueArtur/cano-ts/actions/workflows/test-build.yaml">
    <img src="https://github.com/HenriqueArtur/cano-ts/actions/workflows/test-build.yaml/badge.svg" alt="tests">
  </a>
  <a href="https://github.com/HenriqueArtur/cano-ts/actions/workflows/type-safe.yaml">
    <img src="https://github.com/HenriqueArtur/cano-ts/actions/workflows/type-safe.yaml/badge.svg" alt="tests">
  </a>
</p>

📚 **Full Documentation**: [Cano Ts Docs](https://HenriqueArtur.github.io/cano-ts/)

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

When working with transformations in **JavaScript** and **TypeScript**, we often end up with deeply nested function calls or complex `.then()` chains for asynchronous operations. **Cano Ts** solves this problem by introducing a *fluent, pipeline-based API for function chaining*.

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
<p align="center"> Made with 💜 by <a href="https://github.com/HenriqueArtur" target="_blank">Henrique Artur</a></p>
