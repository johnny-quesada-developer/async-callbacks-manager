export class AsyncCallbacksManager {
  private callbacks: Map<string, Function | Function[]> = new Map();
  private callbacksCounter: number = 0;
}
