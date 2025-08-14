# 👽️ API

This section provides a *detailed explanation* of the Cano-TS API with examples, covering both synchronous and asynchronous pipelines.

## 🏗 Creating a Pipeline
Cano-TS offers two ways to create pipelines:

- `pipeSync()` → for synchronous function composition.
- `pipe()` → for asynchronous function composition.

Each pipeline starts with an initial value, processes it through a sequence of functions, and returns the final result.

## 📌 Reference

**Methods:**
- `.next(fn, ...args)` → Chains functions in the pipeline.
- `.log(message?)` → Logs intermediate values for debugging.
- `.result()` → Resolves and returns the final computed value.

### 🔹 .next(fn, ...args)

**Definition**
```typescript
.next<
  T,
  U,
  Args extends unknown[]
>(fn: (value: T, ...args: Args) => U, ...args: Args): Pipe<U>
```

The `.next()` method applies a function to the current value in the pipeline and returns a *new pipeline* with the transformed value.
- Works with both synchronous (`pipeSync`) and asynchronous (`pipe`) pipelines.
- Accepts extra arguments (`...args`) which are passed to `fn`.
- Preserves function history for debugging.

**Example:** *Sync Pipeline with Extra Arguments*
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

**Example:** *Async Pipeline with API Calls*
```typescript
import { pipe } from "cano-ts";

async function fetchUser(id: number) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  return response.json();
}

async function updateRole(user: { id: number; name: string; role: string }, newRole: string) {
  return { ...user, role: newRole };
}

async function saveToDB(user: { id: number; name: string; role: string }) {
  await fetch(`https://api.example.com/users/${user.id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
  return user;
}

const result = await pipe(1)
  .next(fetchUser) // Fetch user from API
  .next(updateRole, "admin") // Update user role
  .next(saveToDB) // Save updated user to DB
  .result();

console.log(result); // { id: 1, name: "Alice", role: "admin" }
```

### 🔹 `.log(message?)`
**Definition**
```typescript
.log(message?: string): Pipe<T>
```

The `.log()` method logs the current value of the pipeline to the console without modifying it.

- Helps debug intermediate values.
- Works in both sync (`pipeSync`) and async (`pipe`) pipelines.
- Accepts an optional message to label the log.

**Example:** *Debugging a Sync Pipeline*
```typescript
pipeSync(10)
  .next((x) => x * 2) // 10 * 2 = 20
  .log()
  .next((x) => x + 5) // 20 + 5 = 25
  .log("After Addition")
  .result();
```

**📝 Console Output:**
```
[PipeSync] anonymous -> 20
After Addition 25
```

**Example:** *Debugging an Async Pipeline*
```typescript
await pipe(5)
  .next(async (x) => x * 2) // 5 * 2 = 10
  .log() // Logs: [PipeAsync] anonymous -> 10
  .next(async (x) => x + 1) // 10 + 1 = 11
  .log("After increment:")
  .result();
```
**📝 Console Output:**
```
[PipeAsync] anonymous -> 10
After increment: 11```
```

### 🔹 `.result()`

**Definition**
```typescript
.result(): Promise<T> | T
```

The `.result()` method resolves and returns the final computed value in the pipeline.
- For `pipeSync()`, it returns a synchronous value (`T`).
- For `pipe()`, it returns a Promise (`Promise<T>`), requiring `await`.
