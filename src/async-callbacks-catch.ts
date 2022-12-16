import {
  ITryCatchCallbackConfig,
  ITryCatchCallbackPromiseConfig,
  ITryCatchPromiseResult,
  ITryCatchResult,
} from './async-callbacks-catch.types';
import {
  CancelablePromise,
  toCancelablePromise,
} from './async-callbacks-promises';
import { ICancelablePromise } from './async-callbacks-promises.types';

/**
 * Try to execute a callback and catch any error.
 * @param {TFunction} callback the callback to be executed
 * @param {ITryCatchCallbackConfig} config parameters to configure the execution
 * @returns {ITryCatchResult} the result of the execution
 * @template IError the type of the error
 * @template TFunction the type of the callback
 * @template IResult the type of the result
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
export const tryCatch = <
  IError,
  TFunction extends () => unknown,
  TResult = ReturnType<TFunction>
>(
  callback: TFunction,
  config: ITryCatchCallbackConfig<TResult> = {}
): ITryCatchResult<TResult, IError> => {
  const { defaultResult: errorResult = null, type = 'error' } = config;

  try {
    const result = callback() as TResult;

    return {
      error: null,
      result,
    };
  } catch (error) {
    if (type !== 'ignore') {
      console[type](error);
    }

    return {
      error: error as IError,
      result: errorResult as TResult,
    };
  }
};

/**
 * try to execute an async callback and catch any error.
 * @param {TFunction} callback the callback to be executed, should be a function that returns a promise || cancelable promise
 * @param {ITryCatchCallbackPromiseConfig} config parameters to configure the execution
 * @returns {ITryCatchPromiseResult} the result of the execution
 * @template IError the type of the error
 * @template TFunction the type of the callback
 * @template IResult the type of the result
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
export const tryCatchPromise = async <
  IError,
  TFunction extends () => ICancelablePromise<unknown> | Promise<unknown>,
  TResult = Awaited<ReturnType<TFunction>>
>(
  callback: TFunction,
  config: ITryCatchCallbackPromiseConfig<TResult>
): ITryCatchPromiseResult<TResult, IError> => {
  const {
    defaultResult: errorResult = null,
    type = 'error',
    ignoreCancel,
  } = config;
  let promise: ICancelablePromise<TResult> = null;
  let result: TResult = null;
  let error: IError = null;

  try {
    promise = callback() as ICancelablePromise<TResult>;

    const isCancelablePromise = promise instanceof CancelablePromise;
    if (!isCancelablePromise) {
      promise = toCancelablePromise(promise);
    }

    result = await promise;
  } catch (error) {
    error = error as IError;
    result = errorResult as TResult;

    if (type == 'ignore') return;

    const isCancel = promise.status === 'canceled';
    if (isCancel && ignoreCancel) return;

    console[type](error);
  } finally {
    return {
      error,
      result,
      promise,
    };
  }
};
