import {
  createDecoupledPromise,
  groupAsCancelablePromise,
  TCancelablePromise,
  TDecoupledCancelablePromise,
  toCancelablePromise,
} from 'cancelable-promise-jq/lib';

import {
  TAsyncQueue,
  TAsyncQueueCallback,
  TAsyncQueueConfig,
} from './AsyncQueue.types';

/**
 * The AsyncQueue class is a queue of callbacks that are executed in a FIFO order
 * @param config - The configuration object to configure the queue execution behavior
 * @param config.executeImmediately - If true, the queue will execute immediately, if false, the queue will wait for the execute method to be called
 * @param config.maxConcurrent - The maximum number of callbacks that can be executed concurrently, defaults to 8 simultaneous callbacks groups
 * @param config.executeInOrder - If true, the queue will execute the callbacks in order, if false, the queue will execute the callbacks concurrently
 * @param config.beforeExecute - A callback that is executed before each callback is executed
 * @param config.afterExecute - A callback that is executed after each callback is executed
 * @param config.onQueueEmpty - A callback that is executed after all the callbacks are executed
 * @example const queue = new AsyncQueue({ executeImmediately: false });
 * queue.add(() => {
 *  console.log('callback 1');
 * });
 *
 * queue.add(() => {
 *  console.log('callback 2');
 * });
 *
 * queue.add(() => {
 *  console.log('callback 3');
 * });
 *
 * queue.execute();
 *
 * // callback 1
 * // callback 2
 * // callback 3
 *
 * @example const queue = new AsyncQueue({ executeImmediately: true });
 * queue.addAll([
 *  () => {
 *    console.log('callback 1');
 *  },
 *  () => {
 *    console.log('callback 2');
 *  },
 *  () => {
 *    console.log('callback 3');
 *  },
 * ]);
 *
 * // callback 1
 * // callback 2
 * // callback 3
 */
export class AsyncQueue implements TAsyncQueue {
  /**
   * Indicates the quantity of callbacks in the queue pending to be executed
   * */
  public get queueLength(): number {
    return this.queue.length;
  }

  /**
   * Indicates the quantity of callbacks currently executing
   * */
  public get runningPromisesLength(): number {
    return this.runningPromises.size;
  }

  /**
   * The queue is an array of arrays, where each array is a group of callbacks to be executed
   * along with the callbacks we also store a decoupled promise, which is resolved when the group of callbacks is executed
   */
  private queue: [TDecoupledCancelablePromise, TAsyncQueueCallback<unknown>][] =
    [];

  /**
   * The currentPromises is a set of promises that are currently executing
   * */
  private runningPromises: Set<TCancelablePromise> = new Set();

  public config: TAsyncQueueConfig = {
    executeImmediately: true,
    maxConcurrent: 8,
    executeInOrder: false,
  };

  constructor(
    config: TAsyncQueueConfig = {
      executeImmediately: true,
      maxConcurrent: 8,
      executeInOrder: false,
    }
  ) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * compute the execution config based on the queue config and the config passed to the add method
   * @param config - The config passed to the add method
   * @returns The execution config
   * */
  private getExecutionConfig = (
    config: TAsyncQueueConfig
  ): TAsyncQueueConfig => {
    const {
      executeImmediately: executeImmediatelyOverride,
      executeInOrder: executeInOrderOverride,
      maxConcurrent: maxConcurrentOverride,
    } = config;

    const executeImmediately =
      executeImmediatelyOverride !== undefined
        ? executeImmediatelyOverride
        : this.config.executeImmediately;

    const maxConcurrent =
      maxConcurrentOverride !== undefined
        ? maxConcurrentOverride
        : this.config.maxConcurrent;

    const executeInOrder =
      executeInOrderOverride !== undefined
        ? executeInOrderOverride
        : this.config.executeInOrder;

    return {
      executeImmediately,
      maxConcurrent,
      executeInOrder,
    };
  };

  /**
   * Computed whether the queue should execute the next callback group immediately or not
   * @param config - The config passed to the add method
   * @param config.executeImmediately - If true, the queue will execute immediately, if false, the queue will wait for the execute method to be called
   * @param config.executeInOrder - If true, the queue will execute the callbacks in order, if false, the queue will execute the callbacks concurrently
   * @param config.maxConcurrent - The maximum number of callbacks that can be executed concurrently, defaults to 8 simultaneous callbacks groups
   * @param config.beforeExecute - A callback that is executed before each callback is executed
   * @param config.afterExecute - A callback that is executed after each callback is executed
   * @param config.onQueueEmpty - A callback that is executed after all the callbacks are executed
   * @returns A promise that is resolved when the callback is executed
   * */
  private computeNextTick = (
    config: Omit<TAsyncQueueConfig, 'executeImmediately'> = {}
  ): void => {
    if (this.queue.length === 0) {
      this.config.onQueueEmptyCallback?.();
      config.onQueueEmptyCallback?.();

      return;
    }

    const { executeImmediately, executeInOrder, maxConcurrent } =
      this.getExecutionConfig(config);

    // If the queue should not be executed immediately, we do not run the next promise.
    if (!executeImmediately) return;

    // If the queue is already running the maximum number of promises, we do not run the next promise.
    if (this.runningPromises.size >= maxConcurrent) return;

    // If the queue should execute promises in order and there are already promises running, we do not run the next promise.
    if (executeInOrder && this.runningPromises.size > 0) return;

    this.pop(config);
  };

  /**
   * Add a callback to the queue
   * @param callback - the callback to be added to the queue
   * @returns A promise that is resolved when the callback is executed
   * */
  private addOneCallbacksToTheQueue = <TResult>(
    callback: TAsyncQueueCallback
  ): TCancelablePromise<TResult> => {
    const decoupledPromise = createDecoupledPromise<TResult>();
    this.queue.push([
      decoupledPromise as TDecoupledCancelablePromise<unknown>,
      callback,
    ]);

    // if the queue is not configured to execute immediately, we return the decoupled promise
    return decoupledPromise.promise;
  };

  /**
   * Execute a new callback
   * @param callback - The callback to be executed
   * @param config - The config to be used to execute the callback
   * @returns The decoupled promise that is resolved when the callback is executed
   * */
  private executeCallback = <TResult = unknown>(
    [decoupledPromise, callback]: [
      TDecoupledCancelablePromise,
      TAsyncQueueCallback<unknown>
    ],
    config: TAsyncQueueConfig
  ): TCancelablePromise<TResult> => {
    config.beforeEachCallback?.();

    let promise = toCancelablePromise(callback);
    this.runningPromises.add(promise);

    promise
      .finally(() => {
        this.runningPromises.delete(promise);
      })
      .then((result) => {
        config.afterEachCallback?.(result);
      });

    promise.then(decoupledPromise.resolve, decoupledPromise.reject);
    // if the parent promise is canceled, we cancel the in progress promise
    decoupledPromise.onCancel(promise.cancel);

    return decoupledPromise.promise as TCancelablePromise<TResult>;
  };

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
  public enqueue = <TResult>(
    callback: TAsyncQueueCallback,
    config: TAsyncQueueConfig = {}
  ): TCancelablePromise<TResult> => {
    const promise = this.addOneCallbacksToTheQueue<TResult>(callback);

    this.computeNextTick(config);

    return promise;
  };

  /**
   * Enqueue a group of callbacks to the be executed and return a promise that is resolved when all the callbacks are executed
   * @param callbacks - The callbacks to be enqueued
   * @param config - The config to be used to execute the callbacks
   * @param config.executeImmediately - If true, the callbacks will be executed immediately, if false, the callbacks will be enqueued
   * @param config.maxConcurrent - The maximum number of callbacks that can be executed concurrently
   * @param config.executeInOrder - If true, the callbacks will be executed after all the callbacks that were enqueued before it
   * @param config.beforeEachcCallback - A callback that is executed before each callback is executed
   * @param config.afterEachCallback - A callback that is executed after each callback is executed
   * @param config.onQueueEmpty - A callback that is executed when the queue is empty
   * @returns A promise that is resolved when all the callbacks are executed
   *
   * @example
   * const queue = new AsyncQueue();
   *
   * const result = await queue.enqueueAll([
   *  () => Promise.resolve(1),
   *  () => Promise.resolve(2),
   *  () => Promise.resolve(3),
   * ]);
   *
   * // result = [1, 2, 3]
   * */
  public enqueueAll = <TResult extends Array<unknown>>(
    callbacks: TAsyncQueueCallback[],
    config: TAsyncQueueConfig = {}
  ): TCancelablePromise<TResult> => {
    const promise = groupAsCancelablePromise<TResult>(
      callbacks.map((callback) => this.addOneCallbacksToTheQueue(callback)),
      {
        ...this.config,
        ...config,
      }
    );

    this.computeNextTick(config);

    return promise;
  };

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
  public execute = <TResult extends Array<Array<unknown>>>(
    config: Omit<TAsyncQueueConfig, 'executeImmediately'> = {}
  ): TCancelablePromise<TResult> | null => {
    if (!this.queue.length) return null;

    const callbacks = this.queue.map(
      (next) => () => this.executeCallback(next, config)
    );

    const promise = groupAsCancelablePromise(callbacks, {
      ...this.config,
      ...config,
    });

    promise.finally(() => {
      this.queue = [];
    });

    return promise as TCancelablePromise<TResult>;
  };

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
  public pop = <TResult extends Array<Array<unknown>>>(
    config: Omit<TAsyncQueueConfig, 'executeImmediately'> = {}
  ): TCancelablePromise<TResult> => {
    if (!this.queue.length) return null;

    const promise = this.executeCallback(this.queue.shift(), config);

    promise.finally(() => this.computeNextTick(config));

    return promise as TCancelablePromise<TResult>;
  };

  /**
   * Clean all the callbacks in the queue and cancel all the active promises
   * */
  public cancelAll = () => {
    // Cancel all the active promises in the queue
    this.runningPromises.forEach((promise) => promise.cancel());
    this.runningPromises.clear();

    // Clear the queue
    this.queue = [];
  };
}

export default AsyncQueue;
