"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatchPromise = exports.tryCatch = void 0;
const tslib_1 = require("tslib");
const async_callbacks_promises_1 = require("./async-callbacks-promises");
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
const tryCatch = (callback, config = {}) => {
    const { defaultResult: errorResult = null, type = 'error' } = config;
    try {
        const result = callback();
        return {
            error: null,
            result,
        };
    }
    catch (error) {
        if (type !== 'ignore') {
            console[type](error);
        }
        return {
            error: error,
            result: errorResult,
        };
    }
};
exports.tryCatch = tryCatch;
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
const tryCatchPromise = (callback, config) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { defaultResult: errorResult = null, type = 'error', ignoreCancel, } = config;
    let promise = null;
    let result = null;
    let error = null;
    try {
        promise = callback();
        const isCancelablePromise = promise instanceof async_callbacks_promises_1.CancelablePromise;
        if (!isCancelablePromise) {
            promise = (0, async_callbacks_promises_1.toCancelablePromise)(promise);
        }
        result = yield promise;
    }
    catch (error) {
        error = error;
        result = errorResult;
        if (type == 'ignore')
            return;
        const isCancel = promise.status === 'canceled';
        if (isCancel && ignoreCancel)
            return;
        console[type](error);
    }
    finally {
        return {
            error,
            result,
            promise,
        };
    }
});
exports.tryCatchPromise = tryCatchPromise;
