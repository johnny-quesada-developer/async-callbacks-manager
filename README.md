# async-callbacks-manager

A utility for managing asynchronous callbacks in JavaScript.

# Introduction

**async-callbacks-manager** is a lightweight library that helps you manage and organize asynchronous callbacks in your JavaScript code. It provides a simple interface for registering and triggering callbacks, as well as managing their execution order.

# API Documentation

## Class: AsyncQueue

The AsyncQueue class is a queue of callbacks that are executed in a FIFO order. Here is a basic example of how to use the AsyncQueue class to manage the execution of callbacks in a queue:

### Basic Example

```ts
const queue = new AsyncQueue({ executeImmediately: false });
queue.add(() => {
  console.log('callback 1');
});

queue.add(() => {
  console.log('callback 2');
});

queue.add(() => {
  console.log('callback 3');
});

queue.execute();

// callback 1
// callback 2
// callback 3
```

In this example, we create an AsyncQueue and add three callbacks to it. Then, we call the execute method to execute all the callbacks in the queue. With the option `executeImmediately=false ` the callbacks are executed in the order they were added, so the output is "callback 1", "callback 2", "callback 3".

## Executing Callbacks Concurrently

By setting the `executeInOrder` configuration option to `false`, you can configure the queue to execute the callbacks concurrently

## Limiting Concurrent Execution

You can also use the AsyncQueue to limit the number of callbacks that can be executed concurrently. For example, you can use it to limit the number of concurrent HTTP requests you make to a server:

```ts
import { AsyncQueue } from 'async-callbacks-manager';

const queue = new AsyncQueue({ maxConcurrent: 5 });

for (let i = 0; i < 10; i++) {
  queue.add(() => {
    return fetch(`http://example.com/endpoint/${i}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  });
}

queue.execute();
```

In this example, we create an AsyncQueue with a maxConcurrent value of 5, and add 10 HTTP requests to it. The AsyncQueue will only execute 5 of these requests concurrently, and will execute the remaining requests once the first batch finish

### Properties

#### **queueLength**: number

Indicates the quantity of callbacks in the queue pending to be executed.

#### **runningPromisesLength**: number

Indicates the quantity of callbacks currently executing.
