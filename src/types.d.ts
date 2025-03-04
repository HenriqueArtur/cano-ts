export type SyncPipeFn<T, U, Args extends unknown[]> = (arg: T, ...args: Args) => U;

export type AsyncPipeFn<T, U, Args extends unknown[]> = (arg: T, ...args: Args) => U | Promise<U>;
