"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCancelablePromise = exports.createDecoupledPromise = exports.CancelablePromise = void 0;
const tslib_1 = require("tslib");
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
class CancelablePromise extends Promise {
    constructor(callback) {
        super((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            callback({
                resolve: (value) => {
                    this.status = 'resolved';
                    this.resolve(value);
                },
                reject: (reason) => {
                    this.status = 'rejected';
                    this.reject(reason);
                },
                cancel: (reason) => this.cancel(reason),
                onCancel: (callback) => this.subscribeToOwnCancelEvent(callback),
            });
        });
        /**
         * The status of the promise.
         */
        this.status = 'pending';
        this.cancelCallbacks = [];
        this.ownCancelCallbacks = [];
        this.subscribeToOwnCancelEvent = (callback) => {
            this.ownCancelCallbacks.push(callback);
        };
        /**
         * Cancel the promise.
         * @param {unknown} [reason] the reason of the cancellation
         * */
        this.cancel = (reason) => {
            // we cannot cancel promises that are completed
            if (this.status !== 'pending')
                return;
            this.status = 'canceled';
            // the own promise cancel callbacks are called first
            this.ownCancelCallbacks.forEach((callback) => callback(reason));
            // then the promise cancel second level subscribers
            this.cancelCallbacks.forEach((callback) => callback(reason));
            this.reject(reason);
            this.cancelCallbacks = [];
        };
        /**
         * Cancel the promise.
         * @param {TCancellablePromiseCallback} [callback] the callback to be called when the promise is canceled
         * @returns {CancelablePromise} the promise itself
         * */
        this.onCancel = (callback) => {
            this.cancelCallbacks.push(callback);
            return this;
        };
    }
}
exports.CancelablePromise = CancelablePromise;
/**
 * Create a decoupled promise.
 * @param {TCreateCancelablePromiseConfig} [callback] the callback of the promise
 * @returns {TDecoupledCancelablePromise} the decoupled promise
 */
const createDecoupledPromise = () => {
    let resolve;
    let reject;
    let cancel;
    const promise = new CancelablePromise((utils) => {
        resolve = utils.resolve;
        reject = utils.reject;
        cancel = utils.cancel;
    });
    return { resolve, reject, cancel, promise };
};
exports.createDecoupledPromise = createDecoupledPromise;
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
const toCancelablePromise = (promise) => {
    let utils;
    const cancelable = new CancelablePromise((_utils) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        utils = _utils;
        const { resolve, reject } = utils;
        promise.then(resolve, reject);
    }));
    cancelable.onCancel((reason) => {
        const { reject } = utils;
        reject(reason);
    });
    return cancelable;
};
exports.toCancelablePromise = toCancelablePromise;
