import {
  IPromiseStatus,
  IResolveCallback,
  IRejectCallback,
  ICancelablePromise,
  ICancelCallback,
  ICancelablePromiseCallback,
  IDecoupledCancelablePromise,
} from './async-callbacks-promises.types';

/**
 * CancelablePromise is a Promise that can be canceled.
 * It is a Promise that has a status property that can be 'pending', 'resolved', 'rejected' or 'canceled'.
 * It has an onCancel method that allows to register a callback that will be called when the promise is canceled.
 * It has a cancel method that allows to cancel the promise.
 * @param {ICancelablePromiseCallback<IResult>} [callback] the callback of the promise
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
export class CancelablePromise<IResult>
  extends Promise<IResult>
  implements ICancelablePromise<IResult>
{
  /**
   * The status of the promise.
   */
  public status: IPromiseStatus = 'pending';

  private cancelCallbacks: ICancelCallback[] = [];

  private resolve: IResolveCallback<IResult>;
  private reject: IRejectCallback;

  constructor(callback: ICancelablePromiseCallback<IResult>) {
    super((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      callback(
        (value) => {
          this.status = 'resolved';
          this.resolve(value);
        },
        (reason) => {
          this.status = 'rejected';
          this.reject(reason);
        },
        this.cancel
      );
    });
  }

  /**
   * Cancel the promise.
   * @param {unknown} [reason] the reason of the cancellation
   * */
  public cancel: ICancelCallback = (reason) => {
    // we cannot cancel promises that are completed
    if (this.status !== 'pending') return;

    this.status = 'canceled';
    this.cancelCallbacks.forEach((callback) => callback(reason));

    this.reject(reason);
    this.cancelCallbacks = [];
  };

  /**
   * Cancel the promise.
   * @param {ICancellablePromiseCallback} [callback] the callback to be called when the promise is canceled
   * @returns {CancelablePromise} the promise itself
   * */
  public onCancel: ICancelablePromise<IResult>['onCancel'] = (callback) => {
    this.cancelCallbacks.push(callback);

    return this as CancelablePromise<IResult>;
  };
}

/**
 * Create a decoupled promise.
 * @param {ICreateCancelablePromiseConfig} [callback] the callback of the promise
 * @returns {IDecoupledCancelablePromise} the decoupled promise
 */
export const createDecoupledPromise = <
  IResult
>(): IDecoupledCancelablePromise<IResult> => {
  let resolve: IResolveCallback<IResult>;
  let reject: IRejectCallback;
  let cancel: ICancelCallback;

  const promise = new CancelablePromise<IResult>(
    (_resolve, _reject, _cancel) => {
      resolve = _resolve;
      reject = _reject;
      cancel = _cancel;
    }
  );

  return { resolve, reject, cancel, promise };
};

/**
 * Create a cancelable promise from a promise.
 * @param {Promise<IResult>} promise the promise to convert
 * @returns {ICancelablePromise<IResult>} the cancelable promise
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
export const toCancelablePromise = <IResult = unknown>(
  promise: Promise<IResult>
): ICancelablePromise<IResult> => {
  let reject: IRejectCallback;

  const cancelable = new CancelablePromise<IResult>(
    async (resolve, _reject) => {
      reject = _reject;

      promise.then(resolve, reject);
    }
  );

  cancelable.onCancel((reason) => {
    reject(reason);
  });

  return cancelable;
};
