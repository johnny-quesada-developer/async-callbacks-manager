import { AsyncQueue } from '../src/AsyncQueue';

describe('AsyncQueue', () => {
  describe('enqueue', () => {
    it('should create an AsyncQueue', () => {
      const queue = new AsyncQueue();

      expect(queue).toBeInstanceOf(AsyncQueue);
    });

    it('should add a task to the queue and execute it', async () => {
      const queue = new AsyncQueue();
      const task = jest.fn();

      queue.enqueue(task);
      expect(task).toBeCalledTimes(1);
    });

    it('should add a task to the queue and execute it after the previous task', async () => {
      const queue = new AsyncQueue();
      const task1 = jest.fn();
      const task2 = jest.fn();

      queue.enqueue(task1);
      queue.enqueue(task2);

      expect(task1).toBeCalledTimes(1);
      expect(task2).toBeCalledTimes(1);
    });
  });

  describe('executeInOrder', () => {
    it('should execute the tasks in order and wait for the previous task to finish before executing the next one', async () => {
      const queue = new AsyncQueue({ executeInOrder: true });
      const task1 = jest.fn();
      const task2 = jest.fn();

      const first = queue.enqueue(task1);
      queue.enqueue(task2);

      expect(task1).toBeCalledTimes(1);
      expect(task2).not.toBeCalled();

      await first;

      expect(task2).toBeCalledTimes(1);
    });

    it('should execute the tasks in order and wait for the previous task to finish before executing the next one', async () => {
      const queue = new AsyncQueue({ executeInOrder: true });
      const task1 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const task2 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 50))
      );

      const task3 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 0))
      );

      const first = queue.enqueue(task1);
      const second = queue.enqueue(task2);
      const third = queue.enqueue(task3);

      expect(task1).toBeCalledTimes(1);
      expect(task2).not.toBeCalled();
      expect(task3).not.toBeCalled();

      await new Promise<void>(
        (resolve) =>
          setTimeout(() => {
            resolve();
          }, 1) // 0
      );

      expect(first.status).toBe('pending');
      expect(second.status).toBe('pending');
      expect(third.status).toBe('pending');

      await new Promise<void>(
        (resolve) =>
          setTimeout(() => {
            resolve();
          }, 55) // 50
      );

      expect(first.status).toBe('pending');
      expect(second.status).toBe('pending');

      await new Promise<void>(
        (resolve) =>
          setTimeout(() => {
            resolve();
          }, 105) // 100
      );

      expect(first.status).toBe('resolved');
    });

    it('should not wait for the previous task to finish before executing the next one', async () => {
      const queue = new AsyncQueue({ executeInOrder: false });
      const task1 = jest.fn();
      const task2 = jest.fn();
      const task3 = jest.fn();

      queue.enqueue(task1);
      queue.enqueue(task2);
      queue.enqueue(task3);

      expect(task1).toBeCalledTimes(1);
      expect(task2).toBeCalledTimes(1);
      expect(task3).toBeCalledTimes(1);
    });

    it('should execute the task in parallel and resolve the promises as soon as the task is done', async () => {
      const queue = new AsyncQueue({ executeInOrder: false });
      const task1 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const task2 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 50))
      );

      const task3 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 0))
      );

      const first = queue.enqueue(task1);
      const second = queue.enqueue(task2);
      const third = queue.enqueue(task3);

      expect(task1).toBeCalledTimes(1);
      expect(task2).toBeCalledTimes(1);
      expect(task3).toBeCalledTimes(1);

      await new Promise<void>(
        (resolve) =>
          setTimeout(() => {
            resolve();
          }, 1) // 0
      );

      expect(first.status).toBe('pending');
      expect(second.status).toBe('pending');
      expect(third.status).toBe('resolved');

      await new Promise<void>(
        (resolve) =>
          setTimeout(() => {
            resolve();
          }, 55) // 50
      );

      expect(first.status).toBe('pending');
      expect(second.status).toBe('resolved');

      await new Promise<void>(
        (resolve) =>
          setTimeout(() => {
            resolve();
          }, 105) // 100
      );

      expect(first.status).toBe('resolved');
    });
  });

  describe('maxConcurrentTasks', () => {
    it('should execute the tasks in parallel but not more than the maxConcurrentTasks', async () => {
      const queue = new AsyncQueue({
        maxConcurrent: 2,
        executeInOrder: false,
        executeImmediately: false,
      });

      const task1 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const task2 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const task3 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      queue.enqueue(task1);
      queue.enqueue(task2);
      queue.enqueue(task3);

      const promise = queue.execute();

      expect(task1).toBeCalledTimes(1);
      expect(task2).toBeCalledTimes(1);
      expect(task3).not.toBeCalled();

      await promise;

      expect(task3).toBeCalledTimes(1);
    });

    it('should execute the tasks in parallel as long as the maxConcurrentTasks is not reached', async () => {
      const queue = new AsyncQueue({
        maxConcurrent: 3,
        executeInOrder: false,
        executeImmediately: false,
      });

      const task1 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const task2 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const task3 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      queue.enqueue(task1);
      queue.enqueue(task2);
      queue.enqueue(task3);

      expect(queue.queueLength).toBe(3);

      const promise = queue.execute();

      expect(task1).toBeCalledTimes(1);
      expect(task2).toBeCalledTimes(1);
      expect(task3).toBeCalledTimes(1);

      expect(queue.runningPromisesLength).toBe(3);

      await promise;

      expect(queue.queueLength).toBe(0);
      expect(queue.runningPromisesLength).toBe(0);
    });
  });

  describe('executeImmediately', () => {
    it('should execute the tasks immediately', async () => {
      const queue = new AsyncQueue({
        executeImmediately: true,
      });

      const task1 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      queue.enqueue(task1);

      expect(task1).toBeCalledTimes(1);
    });
  });

  describe('execute', () => {
    it('should execute the queued tasks', async () => {
      const queue = new AsyncQueue({
        executeImmediately: false,
      });

      const task1 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      queue.enqueue(task1);

      expect(task1).not.toBeCalled();

      const promise = queue.execute();

      expect(task1).toBeCalledTimes(1);

      await promise;
    });
  });

  describe('pop', () => {
    it('should execute and remove the task from the queue', async () => {
      const queue = new AsyncQueue({
        executeImmediately: false,
      });

      const task1 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      queue.enqueue(task1);

      expect(queue.queueLength).toBe(1);

      queue.pop();

      expect(queue.queueLength).toBe(0);
      expect(task1).toBeCalledTimes(1);
    });
  });

  describe('equeueAll', () => {
    it('should enqueue all the tasks', async () => {
      const queue = new AsyncQueue({
        executeImmediately: false,
        maxConcurrent: 2,
      });

      const task1 = jest.fn(
        () =>
          new Promise<number>((resolve) =>
            setTimeout(() => {
              resolve(1);
            }, 100)
          )
      );

      const task2 = jest.fn(
        () =>
          new Promise<number>((resolve) =>
            setTimeout(() => {
              resolve(2);
            }, 100)
          )
      );

      const task3 = jest.fn(
        () =>
          new Promise<number>((resolve) =>
            setTimeout(() => {
              resolve(3);
            }, 100)
          )
      );

      const promise = queue.enqueueAll([task1, task2, task3]);

      expect(queue.queueLength).toBe(3);

      const result = await queue.execute();
      const result2 = await promise;

      expect(result).toEqual([1, 2, 3]);
      expect(result2).toEqual([1, 2, 3]);
    });
  });

  describe('cancelAll', () => {
    it('should cancel all the tasks', async () => {
      const queue = new AsyncQueue({
        executeImmediately: false,
        maxConcurrent: 2,
      });

      const task1 = jest.fn(
        () =>
          new Promise<number>((resolve) =>
            setTimeout(() => {
              resolve(1);
            }, 100)
          )
      );

      const task2 = jest.fn(
        () =>
          new Promise<number>((resolve) =>
            setTimeout(() => {
              resolve(2);
            }, 100)
          )
      );

      const task3 = jest.fn(
        () =>
          new Promise<number>((resolve) =>
            setTimeout(() => {
              resolve(3);
            }, 100)
          )
      );

      queue.enqueueAll([task1, task2, task3]);

      expect(queue.queueLength).toBe(3);

      queue.cancelAll();

      expect(queue.queueLength).toBe(0);
      expect(task1).not.toBeCalled();
      expect(task2).not.toBeCalled();
      expect(task3).not.toBeCalled();
    });
  });
});
