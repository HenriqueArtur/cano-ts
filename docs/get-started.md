# 🚀 Get Started
This guide will walk you through *installing* **Cano TS** and using it in both *synchronous* and *asynchronous* pipelines, plus the powerful array utilities.

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

## 🔧 Array Processing with E Module

Cano TS includes powerful array utilities that work seamlessly with pipes:

```typescript
import { pipeSync, E } from "cano-ts";

// Transform and filter data
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = pipeSync(numbers)
  .next(E.filter, (x) => x % 2 === 0)       // [2, 4, 6, 8, 10]
  .next(E.map, (x) => x * x)                // [4, 16, 36, 64, 100]
  .next(E.slice, 0, 3)                      // [4, 16, 36]
  .next(E.reduce, (sum, x) => sum + x, 0)   // 56
  .result();

console.log(result); // 56
```

### Real-World Example: Processing User Data
```typescript
import { pipeSync, E } from "cano-ts";

const users = [
  { name: "Alice", age: 25, role: "admin", active: true },
  { name: "Bob", age: 30, role: "user", active: false },
  { name: "Charlie", age: 35, role: "admin", active: true },
  { name: "Diana", age: 28, role: "user", active: true },
];

// Get names of active admins, sorted by age
const activeAdmins = pipeSync(users)
  .next(E.filter, (user) => user.active && user.role === "admin")
  .next(E.sort, (a, b) => a.age - b.age)  
  .next(E.map, (user) => user.name)
  .next(E.join, ", ")
  .result();

console.log(activeAdmins); // "Alice, Charlie"
```

## 📌 Debugging with `.log()`

Use `.log()` to inspect intermediate values without breaking the pipeline:

### Sync Pipeline Debugging
```typescript
pipeSync([1, 2, 3, 4, 5])
  .log("Initial array")                     // Initial array [1, 2, 3, 4, 5]
  .next(E.filter, (x) => x % 2 === 0)
  .log("After filter")                      // After filter [2, 4]
  .next(E.map, (x) => x * 10)
  .log("After map")                         // After map [20, 40]
  .result();
```

### Async Pipeline Debugging
```typescript
await pipe(5)
  .next(async (x) => x * 2)
  .log() // [PipeAsync] anonymous -> 10
  .next(async (x) => x + 1)
  .log("After increment:") // After increment: 11
  .result();
```

## 🌟 Advanced Examples

### Combining Sync and Async Operations
```typescript
import { pipe, E } from "cano-ts";

async function fetchUserData(userId) {
  // Simulate API call
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

async function fetchUserPosts(user) {
  const response = await fetch(`/api/users/${user.id}/posts`);
  const posts = await response.json();
  return { ...user, posts };
}

// Process user data pipeline
const userReport = await pipe(123)
  .next(fetchUserData)                    // Fetch user
  .next(fetchUserPosts)                   // Fetch their posts
  .next((user) => user.posts)             // Extract posts
  .next(E.filter, (post) => post.published) // Only published posts
  .next(E.sort, (a, b) => new Date(b.date) - new Date(a.date)) // Sort by date
  .next(E.slice, 0, 5)                    // Take latest 5
  .next(E.map, (post) => post.title)      // Extract titles
  .result();

console.log(userReport); // ["Latest Post", "Another Post", ...]
```

### Data Validation Pipeline
```typescript
const validateAndProcess = pipeSync([
  { email: "alice@example.com", age: 25 },
  { email: "invalid-email", age: 17 },
  { email: "bob@example.com", age: 30 },
  { email: "charlie@example.com", age: 22 },
])
  .next(E.filter, (user) => user.email.includes("@"))  // Valid email
  .next(E.filter, (user) => user.age >= 18)            // Adults only
  .next(E.sort, (a, b) => a.age - b.age)               // Sort by age
  .next(E.map, (user) => ({
    ...user,
    domain: user.email.split("@")[1]
  }))
  .log("Processed users")
  .result();
```

## 💡 Best Practices

### 1. Use Descriptive Function Names
```typescript
// ❌ Hard to understand
const result = pipeSync(data)
  .next((x) => x.filter(y => y.status === 'active'))
  .next((x) => x.map(y => y.name))
  .result();

// ✅ Clear and readable
const getActiveUserNames = (users) => users.filter(user => user.status === 'active');
const extractNames = (users) => users.map(user => user.name);

const result = pipeSync(data)
  .next(getActiveUserNames)
  .next(extractNames)
  .result();
```

### 2. Leverage E Module for Common Operations
```typescript
// ❌ Verbose inline functions
const result = pipeSync(numbers)
  .next((arr) => arr.filter(x => x > 5))
  .next((arr) => arr.map(x => x * 2))
  .next((arr) => arr.slice(0, 3))
  .result();

// ✅ Clean with E module
const result = pipeSync(numbers)
  .next(E.filter, (x) => x > 5)
  .next(E.map, (x) => x * 2)
  .next(E.slice, 0, 3)
  .result();
```

### 3. Use `.log()` for Development
```typescript
const debugResult = pipeSync(complexData)
  .log("Input data")
  .next(transformStep1)
  .log("After step 1")
  .next(transformStep2)
  .log("After step 2")
  .result();
```
