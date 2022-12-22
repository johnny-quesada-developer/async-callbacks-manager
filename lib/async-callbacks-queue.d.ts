import { TAsyncQueue, TAsyncQueueCallback } from './async-callbacks-queue.types';
export type TAsyncQueueConfig = {
    executeImmediately?: boolean;
};
export declare class AsyncQueue implements TAsyncQueue {
    private config;
    queue: TAsyncQueueCallback<unknown>[][];
    private currentPromise;
    constructor(config?: TAsyncQueueConfig);
    enqueue(callback: TAsyncQueueCallback<unknown>): void;
    enqueueAll<T>(callbacks: TAsyncQueueCallback<T>[]): void;
    run<TResult extends []>(): Promise<TResult>;
    wait(): Promise<void>;
    cancel(): void;
    private runNext;
}
export default AsyncQueue;
//# sourceMappingURL=async-callbacks-queue.d.ts.map