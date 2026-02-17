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
- `.catch(handler)` → Catches and handles errors in the pipeline.
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

### 🔹 `.catch(handler)`

**Definition**
```typescript
// Synchronous
.catch<U>(handler: (error: unknown) => U): PipeSync<T | U>

// Asynchronous
.catch<U>(handler: (error: unknown) => U | Promise<U>): Pipe<T | U>
```

The `.catch()` method handles errors that occur anywhere in the pipeline, allowing you to recover gracefully by returning a fallback value.

- Catches errors from **any previous `.next()` call** in the pipeline.
- Once an error occurs, subsequent `.next()` calls are **skipped** until `.catch()` handles it.
- After catching and recovering, the pipeline can **continue normally**.
- Works in both sync (`pipeSync`) and async (`pipe`) pipelines.
- If not caught, errors are thrown when `.result()` is called.

**Example:** *Basic Error Handling*
```typescript
import { pipeSync } from "cano-ts";

function divide(x: number, y: number) {
  if (y === 0) throw new Error("Division by zero");
  return x / y;
}

const result = pipeSync(10)
  .next((x) => x * 2) // 10 * 2 = 20
  .next(divide, 0) // ❌ Throws error
  .catch((error) => {
    console.error("Error caught:", error.message);
    return 0; // Recovery value
  })
  .next((x) => x + 5) // 0 + 5 = 5
  .result();

console.log(result); // 5
```

**Example:** *Catching Errors from Any Step*
```typescript
const result = pipeSync(10)
  .next((x) => x * 2) // ✅ Executes: 10 * 2 = 20
  .next((x) => {
    throw new Error("Error in step 2");
  }) // ❌ Throws error
  .next((x) => x + 5) // ⏭️ Skipped (error state)
  .next((x) => x * 3) // ⏭️ Skipped (error state)
  .catch((error) => {
    console.log("Caught:", error.message);
    return 0; // Recover with 0
  })
  .result();

console.log(result); // 0
```

**Example:** *Async Error Handling with API Calls*
```typescript
import { pipe } from "cano-ts";

async function fetchUser(id: number) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  if (!response.ok) throw new Error(`User ${id} not found`);
  return response.json();
}

async function getEmail(user: { email: string }) {
  return user.email;
}

const result = await pipe(999)
  .next(fetchUser) // ❌ Throws "User 999 not found"
  .next(getEmail) // ⏭️ Skipped
  .catch((error) => {
    console.error("API Error:", error.message);
    return { email: "default@example.com" }; // Fallback user
  })
  .next(getEmail) // ✅ Continues with fallback
  .result();

console.log(result); // "default@example.com"
```

**Example:** *Multiple Catch Handlers*
```typescript
const result = pipeSync(10)
  .next(() => {
    throw new Error("First error");
  })
  .catch(() => {
    console.log("First catch - rethrowing");
    throw new Error("Second error");
  })
  .catch((error) => {
    console.log("Second catch:", error.message);
    return 42; // Final recovery
  })
  .result();

console.log(result); // 42
```

**Example:** *Conditional Error Recovery*
```typescript
function processData(data: string) {
  if (!data) throw new Error("Empty data");
  if (data.length < 5) throw new Error("Data too short");
  return data.toUpperCase();
}

const result = pipeSync("")
  .next(processData) // ❌ Throws "Empty data"
  .catch((error) => {
    const message = (error as Error).message;

    if (message === "Empty data") {
      return "DEFAULT"; // Use default value
    }
    if (message === "Data too short") {
      return "SHORT"; // Different fallback
    }

    throw error; // Re-throw unknown errors
  })
  .result();

console.log(result); // "DEFAULT"
```

### 🔹 `.result()`

**Definition**
```typescript
.result(): Promise<T> | T
```

The `.result()` method resolves and returns the final computed value in the pipeline.
- For `pipeSync()`, it returns a synchronous value (`T`).
- For `pipe()`, it returns a Promise (`Promise<T>`), requiring `await`.

## 🔧 E Module - Array Utilities

The `E` module provides a comprehensive set of functional array operations designed to work seamlessly with Cano TS pipelines. All functions are curried, meaning they can be partially applied with additional arguments.

### Core Transformation Functions

#### `E.map(fn)`
Transforms each element in an array using the provided function.

```typescript
import { pipeSync, E } from "cano-ts";

const numbers = [1, 2, 3, 4, 5];

const doubled = pipeSync(numbers)
  .next(E.map, (x: number) => x * 2)
  .result();

console.log(doubled); // [2, 4, 6, 8, 10]

// With objects
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 }
];

const names = pipeSync(users)
  .next(E.map, (user) => user.name)
  .result();

console.log(names); // ["Alice", "Bob"]
```

#### `E.filter(predicate)`
Filters array elements based on a predicate function.

```typescript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evenNumbers = pipeSync(numbers)
  .next(E.filter, (x: number) => x % 2 === 0)
  .result();

console.log(evenNumbers); // [2, 4, 6, 8, 10]

// Complex filtering
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 17, active: false },
  { name: "Charlie", age: 30, active: true }
];

const activeAdults = pipeSync(users)
  .next(E.filter, (user) => user.active && user.age >= 18)
  .result();

console.log(activeAdults); // [{ name: "Alice", age: 25, active: true }, { name: "Charlie", age: 30, active: true }]
```

#### `E.reduce(reducer, initialValue)`
Reduces an array to a single value using a reducer function.

```typescript
const numbers = [1, 2, 3, 4, 5];

const sum = pipeSync(numbers)
  .next(E.reduce, (acc: number, curr: number) => acc + curr, 0)
  .result();

console.log(sum); // 15

// Complex reduction
const transactions = [
  { type: "credit", amount: 100 },
  { type: "debit", amount: 50 },
  { type: "credit", amount: 75 }
];

const balance = pipeSync(transactions)
  .next(E.reduce, (acc, tx) => {
    return tx.type === "credit" ? acc + tx.amount : acc - tx.amount;
  }, 0)
  .result();

console.log(balance); // 125
```

#### `E.find(predicate)`
Finds the first element that matches the predicate.

```typescript
const users = [
  { id: 1, name: "Alice", role: "user" },
  { id: 2, name: "Bob", role: "admin" },
  { id: 3, name: "Charlie", role: "user" }
];

const admin = pipeSync(users)
  .next(E.find, (user) => user.role === "admin")
  .result();

console.log(admin); // { id: 2, name: "Bob", role: "admin" }
```

### Array Manipulation Functions

#### `E.sort(compareFn?)`
Sorts array elements using an optional compare function.

```typescript
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];

// Ascending order (default)
const ascending = pipeSync(numbers)
  .next(E.sort)
  .result();

console.log(ascending); // [1, 1, 2, 3, 4, 5, 6, 9]

// Custom sorting
const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 }
];

const sortedByAge = pipeSync(users)
  .next(E.sort, (a, b) => a.age - b.age)
  .result();

console.log(sortedByAge); // Sorted by age ascending
```

#### `E.reverse()`
Reverses the order of elements in an array.

```typescript
const numbers = [1, 2, 3, 4, 5];

const reversed = pipeSync(numbers)
  .next(E.reverse)
  .result();

console.log(reversed); // [5, 4, 3, 2, 1]
```

#### `E.slice(start, end?)`
Extracts a section of an array and returns a new array.

```typescript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const middle = pipeSync(numbers)
  .next(E.slice, 2, 7)
  .result();

console.log(middle); // [3, 4, 5, 6, 7]

// First 3 elements
const first3 = pipeSync(numbers)
  .next(E.slice, 0, 3)
  .result();

console.log(first3); // [1, 2, 3]
```

### Array Combining Functions

#### `E.concat(...arrays)`
Combines multiple arrays into one.

```typescript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const arr3 = [7, 8, 9];

const combined = pipeSync(arr1)
  .next(E.concat, arr2, arr3)
  .result();

console.log(combined); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

#### `E.flat(depth?)`
Flattens nested arrays to the specified depth (default: 1).

```typescript
const nested = [1, [2, 3], [4, [5, 6]]];

const flattened = pipeSync(nested)
  .next(E.flat)
  .result();

console.log(flattened); // [1, 2, 3, 4, [5, 6]]

// Flatten all levels
const deepFlattened = pipeSync(nested)
  .next(E.flat, Infinity)
  .result();

console.log(deepFlattened); // [1, 2, 3, 4, 5, 6]
```

#### `E.join(separator?)`
Joins array elements into a string with an optional separator.

```typescript
const words = ["Hello", "world", "from", "Cano", "TS"];

const sentence = pipeSync(words)
  .next(E.join, " ")
  .result();

console.log(sentence); // "Hello world from Cano TS"

// CSV format
const data = ["Alice", "25", "Developer"];

const csv = pipeSync(data)
  .next(E.join, ",")
  .result();

console.log(csv); // "Alice,25,Developer"
```

### Boolean Operation Functions

#### `E.every(predicate)`
Tests whether all elements pass the provided predicate.

```typescript
const numbers = [2, 4, 6, 8, 10];

const allEven = pipeSync(numbers)
  .next(E.every, (x: number) => x % 2 === 0)
  .result();

console.log(allEven); // true

const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 17 }
];

const allAdults = pipeSync(users)
  .next(E.every, (user) => user.age >= 18)
  .result();

console.log(allAdults); // false
```

#### `E.some(predicate)`
Tests whether at least one element passes the provided predicate.

```typescript
const numbers = [1, 3, 5, 8, 9];

const hasEven = pipeSync(numbers)
  .next(E.some, (x: number) => x % 2 === 0)
  .result();

console.log(hasEven); // true

const users = [
  { name: "Alice", role: "user" },
  { name: "Bob", role: "admin" },
  { name: "Charlie", role: "user" }
];

const hasAdmin = pipeSync(users)
  .next(E.some, (user) => user.role === "admin")
  .result();

console.log(hasAdmin); // true
```

#### `E.includes(searchElement)`
Determines whether an array includes a certain value.

```typescript
const fruits = ["apple", "banana", "orange"];

const hasBanana = pipeSync(fruits)
  .next(E.includes, "banana")
  .result();

console.log(hasBanana); // true

const numbers = [1, 2, 3, 4, 5];

const hasEight = pipeSync(numbers)
  .next(E.includes, 8)
  .result();

console.log(hasEight); // false
```

## 🌟 Advanced E Module Examples

### Data Processing Pipeline
```typescript
import { pipeSync, E } from "cano-ts";

const orders = [
  { id: 1, customer: "Alice", amount: 150, status: "completed", date: "2024-01-15" },
  { id: 2, customer: "Bob", amount: 75, status: "pending", date: "2024-01-16" },
  { id: 3, customer: "Charlie", amount: 200, status: "completed", date: "2024-01-17" },
  { id: 4, customer: "Diana", amount: 90, status: "completed", date: "2024-01-18" },
  { id: 5, customer: "Eve", amount: 300, status: "cancelled", date: "2024-01-19" }
];

// Get total revenue from completed orders over $100
const highValueRevenue = pipeSync(orders)
  .next(E.filter, (order) => order.status === "completed")
  .next(E.filter, (order) => order.amount > 100)
  .next(E.map, (order) => order.amount)
  .next(E.reduce, (sum: number, amount: number) => sum + amount, 0)
  .result();

console.log(highValueRevenue); // 350

// Get customer names with pending orders
const pendingCustomers = pipeSync(orders)
  .next(E.filter, (order) => order.status === "pending")
  .next(E.map, (order) => order.customer)
  .next(E.join, ", ")
  .result();

console.log(pendingCustomers); // "Bob"
```

### Complex Data Transformation
```typescript
const salesData = [
  { region: "North", products: [{ name: "Laptop", sales: [100, 150, 200] }] },
  { region: "South", products: [{ name: "Phone", sales: [80, 90, 120] }] },
  { region: "East", products: [{ name: "Tablet", sales: [60, 70, 80] }] }
];

// Calculate total sales across all regions and products
const totalSales = pipeSync(salesData)
  .next(E.map, (region) => region.products)
  .next(E.flat)
  .next(E.map, (product) => product.sales)
  .next(E.flat)
  .next(E.reduce, (sum: number, sale: number) => sum + sale, 0)
  .result();

console.log(totalSales); // 950
```

### Text Processing Pipeline
```typescript
const text = "The Quick Brown Fox Jumps Over The Lazy Dog";

const processedText = pipeSync(text)
  .next((str) => str.toLowerCase())
  .next((str) => str.split(" "))
  .next(E.filter, (word) => word.length > 3)
  .next(E.sort)
  .next(E.map, (word) => word.charAt(0).toUpperCase() + word.slice(1))
  .next(E.join, " → ")
  .result();

console.log(processedText); // "Brown → Jumps → Lazy → Over → Quick"
```
