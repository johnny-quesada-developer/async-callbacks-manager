import { TTryCatchCallbackConfig, TTryCatchCallbackPromiseConfig, TTryCatchPromiseResult, TTryCatchResult } from './async-callbacks-catch.types';
import { TCancelablePromise } from './async-callbacks-promises.types';
/**
 * Try to execute a callback and catch any error.
 * @param {TFunction} callback the callback to be executed
 * @param {TTryCatchCallbackConfig} config parameters to configure the execution
 * @returns {TTryCatchResult} the result of the execution
 * @template TError the type of the error
 * @template TFunction the type of the callback
 * @template TResult the type of the result
 * @example const { error, result } = tryCatch(() => {
 *  throw new Error('Error');
 * });
 * console.log(error); // Error: Error
 * console.log(result); // null
 * @example const { error, result } = tryCatch(() => {
 * return 'result';
 * });
 * console.log(error); // null
 * console.log(result); // result
 * */
export declare const tryCatch: <TError, TFunction extends () => unknown, TResult = ReturnType<TFunction>>(callback: TFunction, config?: TTryCatchCallbackConfig<TResult>) => TTryCatchResult<TResult, TError>;
/**
 * try to execute an async callback and catch any error.
 * @param {TFunction} callback the callback to be executed, should be a function that returns a promise || cancelable promise
 * @param {TTryCatchCallbackPromiseConfig} config parameters to configure the execution
 * @returns {TTryCatchPromiseResult} the result of the execution
 * @template TError the type of the error
 * @template TFunction the type of the callback
 * @template TResult the type of the result
 * @example const { error, result, promise } = await tryCatchPromise(async () => {
 * throw new Error('Error');
 * });
 * console.log(error); // Error: Error
 * console.log(result); // null
 * console.log(promise); // CancelablePromise {status: "rejected", value: Error: Error}
 * @example const { error, result, promise } = await tryCatchPromise(async () => {
 * return 'result';
 * });
 * console.log(error); // null
 * console.log(result); // result
 * console.log(promise); // CancelablePromise {status: "resolved", value: "result"}
 * @example const promise = new CancelablePromise((resolve, reject) => {
 * setTimeout(() => {
 * resolve('result');
 * }, 2000);
 * });
 * setTimeout(() => {
 * promise.cancel('canceled');
 * }, 1000);
 * const { error, result, promise } = await tryCatchPromise(async () => {
 * return promise;
 * }, { ignoreCancel: true });
 * console.log(error); // null
 * console.log(result); // result
 * console.log(promise); // CancelablePromise {status: "canceled", value: null, error: "canceled"}
 */
export declare const tryCatchPromise: <TError, TFunction extends () => TCancelablePromise<unknown> | Promise<unknown>, TResult = Awaited<ReturnType<TFunction>>>(callback: TFunction, config: TTryCatchCallbackPromiseConfig<TResult>) => TTryCatchPromiseResult<TResult, TError>;
//# sourceMappingURL=async-callbacks-catch.d.ts.map