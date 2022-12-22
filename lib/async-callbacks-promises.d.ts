import { TPromiseStatus, TCancelablePromise, TCancelCallback, TCancelablePromiseCallback, TDecoupledCancelablePromise } from './async-callbacks-promises.types';
/**
 * CancelablePromise is a Promise that can be canceled.
 * It is a Promise that has a status property that can be 'pending', 'resolved', 'rejected' or 'canceled'.
 * It has an onCancel method that allows to register a callback that will be called when the promise is canceled.
 * It has a cancel method that allows to cancel the promise.
 * @param {TCancelablePromiseCallback<TResult>} [callback] the callback of the promise
 * @constructor
 * @example
 * const promise = new CancelablePromise((resolve, reject, cancel) => {
 *  setTimeout(() => {
 *   resolve('hello world');
 *  }, 1000);
 * });
 * promise.onCancel(() => {
 *  console.log('promise canceled');
 * });
 * promise.cancel();
 * // promise canceled
 */
export declare class CancelablePromise<TResult> extends Promise<TResult> implements TCancelablePromise<TResult> {
    /**
     * The status of the promise.
     */
    status: TPromiseStatus;
    private cancelCallbacks;
    private ownCancelCallbacks;
    private resolve;
    private reject;
    constructor(callback: TCancelablePromiseCallback<TResult>);
    private subscribeToOwnCancelEvent;
    /**
     * Cancel the promise.
     * @param {unknown} [reason] the reason of the cancellation
     * */
    cancel: TCancelCallback;
    /**
     * Cancel the promise.
     * @param {TCancellablePromiseCallback} [callback] the callback to be called when the promise is canceled
     * @returns {CancelablePromise} the promise itself
     * */
    onCancel: TCancelablePromise<TResult>['onCancel'];
}
/**
 * Create a decoupled promise.
 * @param {TCreateCancelablePromiseConfig} [callback] the callback of the promise
 * @returns {TDecoupledCancelablePromise} the decoupled promise
 */
export declare const createDecoupledPromise: <TResult>() => TDecoupledCancelablePromise<TResult>;
/**
 * Create a cancelable promise from a promise.
 * @param {Promise<TResult>} promise the promise to convert
 * @returns {TCancelablePromise<TResult>} the cancelable promise
 * @example
 * const promise = new Promise((resolve) => {
 * setTimeout(() => {
 *  resolve('hello world');
 * }, 1000);
 * });
 * const cancelablePromise = toCancelablePromise(promise);
 * cancelablePromise.onCancel(() => {
 * console.log('promise canceled');
 * });
 * cancelablePromise.cancel();
 * // promise canceled
 * */
export declare const toCancelablePromise: <TResult = unknown>(promise: Promise<TResult>) => TCancelablePromise<TResult>;
//# sourceMappingURL=async-callbacks-promises.d.ts.map