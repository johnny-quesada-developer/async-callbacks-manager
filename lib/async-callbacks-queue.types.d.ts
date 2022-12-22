import { TCancelablePromise } from './async-callbacks-promises.types';
export type TAsyncQueueCallback<T = unknown> = () => Promise<T> | TCancelablePromise<T>;
export type TAsyncQueue = {
    queue: (TAsyncQueueCallback<unknown> | TAsyncQueueCallback<unknown>[])[];
};
//# sourceMappingURL=async-callbacks-queue.types.d.ts.map