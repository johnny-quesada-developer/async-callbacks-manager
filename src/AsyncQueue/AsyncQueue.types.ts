import { TCancelablePromise } from 'cancelable-promise-jq';

export type TAsyncQueueCallback<T = unknown> = () =>
  | Promise<T>
  | TCancelablePromise<T>;

export type TAsyncQueueConfig = {
  executeImmediately?: boolean;
  maxConcurrent?: number;
  executeInOrder?: boolean;
  beforeEachCallback?: () => void;
  afterEachCallback?: (result: unknown) => void;
  onQueueEmptyCallback?: () => void;
};

export type TAsyncQueue = {
  config: TAsyncQueueConfig;

  /**
   * Enqueue a single callback to the queue and return a promise that is resolved when the callback is executed
   * @param callback - The callback to be enqueued
   * @param config - The config to be used to execute the callback
   * @param config.executeImmediately - If true, the callback will be executed immediately, if false, the callback will be enqueued
   * @param config.maxConcurrent - The maximum number of callbacks that can be executed concurrently
   * @param config.executeInOrder - If true, the callback will be executed after all the callbacks that were enqueued before it
   * @param config.beforeExecute - A callback that is executed before each callback is executed
   * @param config.afterExecute - A callback that is executed after each callback is executed
   * @param config.onQueueEmpty - A callback that is executed when the queue is empty
   * @returns A promise that is resolved when the callback is executed
   * */
  enqueue: <TResult>(
    callback: TAsyncQueueCallback,
    config: TAsyncQueueConfig
  ) => TCancelablePromise<TResult>;

  /**
   * Enqueue a group of callbacks to the be executed and return a promise that is resolved when all the callbacks are executed
   * @param callbacks - The callbacks to be enqueued
   * @param config - The config to be used to execute the callbacks
   * @param config.executeImmediately - If true, the callbacks will be executed immediately, if false, the callbacks will be enqueued
   * @param config.maxConcurrent - The maximum number of callbacks that can be executed concurrently
   * @param config.executeInOrder - If true, the callbacks will be executed after all the callbacks that were enqueued before it
   * @param config.beforeExecute - A callback that is executed before each callback is executed
   * @param config.afterExecute - A callback that is executed after each callback is executed
   * @param config.onQueueEmpty - A callback that is executed when the queue is empty
   * @returns A promise that is resolved when all the callbacks are executed
   * */
  enqueueAll: <TResult extends Array<unknown>>(
    callbacks: TAsyncQueueCallback[],
    config: TAsyncQueueConfig
  ) => TCancelablePromise<TResult>;

  /**
   * Execute all the callbacks that are currently in the queue
   * @param config - The config to be used to execute the callbacks
   * @param config.maxConcurrent - The maximum number of callbacks that can be executed concurrently
   * @param config.beforeExecute - A callback that is executed before each callback is executed
   * @param config.afterExecute - A callback that is executed after each callback is executed
   * @param config.onQueueEmpty - A callback that is executed when the queue is empty
   * @returns A promise that is resolved when all the callbacks are executed
   * @template {Array<Array<unknown>>} TResult - The type of the result of the execution of the callbacks in the queue (an array of arrays)  since all callbacks in the queue are groups of callbacks
   * */
  execute: <TResult extends Array<Array<unknown>>>(
    config: Omit<TAsyncQueueConfig, 'executeImmediately'>
  ) => TCancelablePromise<TResult> | null;

  /**
   * Execute the next callback in the queue and return a promise that is resolved when the callback is executed
   * the callback is removed from the queue
   * @param config - The config to be used to execute the callback
   * @param config.maxConcurrent - The maximum number of callbacks that can be executed concurrently
   * @param config.beforeExecute - A callback that is executed before each callback is executed
   * @param config.afterExecute - A callback that is executed after each callback is executed
   * @param config.onQueueEmpty - A callback that is executed when the queue is empty
   * @returns A promise that is resolved when the callback is executed
   * @template {Array<Array<unknown>>} TResult - The type of the result of the execution of the callback (an array of arrays) since all callbacks in the queue are groups of callbacks
   * */
  pop: <TResult extends Array<Array<unknown>>>(
    config: Omit<TAsyncQueueConfig, 'executeImmediately'>
  ) => TCancelablePromise<TResult> | null;

  /**
   * Cancels all the promises in the queue and the current promises
   * */
  cancelAll: () => void;
};
