# 🥅 Error Handling

Cano-TS provides **built-in error tracking** using the `PipeError` class, which helps debug issues by showing **function execution history**. This ensures that when an error occurs, you can trace **which function failed and what ran before it**.  

## 🔎 How Errors Are Handled  

By default, errors inside `pipe()` and `pipeSync()` are **wrapped in a `PipeError`**. This provides:  

- **A detailed execution chain** showing which functions were called.  
- **A clear error location**, marking where the error happened.  
- **The original error stack**, so you can still access the root cause.  

### ❌ Without Cano-TS (Difficult Debugging)
Normally, debugging errors in promise chains can be **frustrating** because **stack traces don't show execution history**:  

```ts
async function failStep(value: number) {
  throw new Error("Something went wrong!");
}

try {
  const result = await fetchData(1)
    .then(processData)
    .then(failStep) // Where did the error happen?
    .then(saveToDB);
} catch (error) {
  console.error(error); // Hard to see the function history!
}
```

### ✅ With Cano-TS (Clear Error Tracing)

Using Cano-TS, errors show the execution chain before failure:
```ts
async function failStep(value: number) {
  throw new Error("Something went wrong!");
}

try {
  const result = await pipe(1)
    .next(fetchData)
    .next(processData)
    .next(failStep) // 🚨 Error occurs here
    .next(saveToDB)
    .result();
} catch (error) {
  console.error(error);
}
```

**📝 Console Output:**
```
PipeError:
🔗 Execution Chain:
  1. fetchData
  2. processData
  3. ❌ ERROR in "failStep"
↓↓↓  ORIGINAL ERROR  ↓↓↓
Error: Something went wrong!
    at failStep (example.ts:10:10)
```

## ⚙️ Disabling PipeError for Raw Errors
If you prefer to **disable** `PipeError` **wrapping**, you can pass `{ usePipeError: false }` in the pipeline config:
```ts
const result = await pipe(1, { usePipeError: false })
  .next(fetchData)
  .next(failStep) // Throws a raw error instead of a PipeError
  .result();
```

**📝 Console Output:**
```
Error: Something went wrong!
    at failStep (example.ts:10:10)
```
::: tip
Use this when you want to handle errors manually without execution history.
:::
