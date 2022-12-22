"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncQueue = void 0;
const tslib_1 = require("tslib");
class AsyncQueue {
    constructor(config = { executeImmediately: true }) {
        this.config = config;
        this.queue = [];
        this.currentPromise = null;
    }
    enqueue(callback) {
        this.queue.push(callback);
        if (!this.config.executeImmediately)
            return;
        this.runNext();
    }
    enqueueAll(callbacks) {
        this.queue.push(callbacks);
        if (!this.config.executeImmediately)
            return;
        this.runNext();
    }
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.queue.length)
                return [];
            const results = [];
            for (const callbacks of this.queue) {
                const result = yield Promise.all(callbacks.map((callback) => callback()));
                results.push(...result);
            }
            return results;
        });
    }
    wait() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.currentPromise) {
                yield this.currentPromise;
            }
        });
    }
    cancel() {
        this.isCancelled = true;
        if (this.currentPromise) {
            this.currentPromise.cancel();
        }
    }
    runNext() {
        if (this.currentPromise || this.queue.length === 0 || this.isCancelled) {
            return;
        }
        const next = this.queue.shift();
        if (!next) {
            return;
        }
        this.currentPromise = makeCancelable(Promise.all(next.map((callback) => callback())));
        this.currentPromise.then((result) => {
            this.currentPromise = null;
            this.runNext();
        }, (error) => {
            this.currentPromise = null;
            this.runNext();
        });
    }
}
exports.AsyncQueue = AsyncQueue;
function makeCancelable(promise) {
    let isCancelled = false;
    const cancelablePromise = new Promise((resolve, reject) => {
        promise.then((value) => (isCancelled ? reject({ isCancelled }) : resolve(value)), (error) => (isCancelled ? reject({ isCancelled }) : reject(error)));
    });
    cancelablePromise.cancel = () => {
        isCancelled = true;
    };
    return cancelablePromise;
}
exports.default = AsyncQueue;
