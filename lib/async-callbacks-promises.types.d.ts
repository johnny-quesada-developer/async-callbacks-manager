export type TPromiseStatus = 'canceled' | 'pending' | 'resolved' | 'rejected';
export type TResolveCallback<TResult> = (value?: TResult | PromiseLike<TResult>) => void;
export type TRejectCallback = (reason?: unknown) => void;
export type TCancelCallback = (reason?: unknown) => void;
export type TCancelablePromiseUtils<T = unknown> = {
    resolve: TResolveCallback<T>;
    reject: TRejectCallback;
    cancel: TCancelCallback;
    onCancel: (callback: TCancelCallback) => void;
};
/**
 * A callback that receives a set of utilities to resolve, reject, cancel,
 * it also receives a onCancel callback to register a callback to be called when the promise is canceled.
 * @param {TCancellablePromiseUtils} utils the utilities to resolve, reject, cancel, and register a callback to be called when the promise is canceled.
 */
export type TCancelablePromiseCallback<TResult = unknown> = (utils: TCancelablePromiseUtils<TResult>) => void;
export interface TCancelablePromise<TResult = unknown> extends Promise<TResult> {
    status: TPromiseStatus;
    onCancel: (callback: TCancelCallback) => TCancelablePromise<TResult>;
}
export type TDecoupledCancelablePromise<TResult = unknown> = {
    resolve: TResolveCallback<TResult>;
    reject: TRejectCallback;
    cancel: TCancelCallback;
    promise: TCancelablePromise<TResult>;
};
//# sourceMappingURL=async-callbacks-promises.types.d.ts.map