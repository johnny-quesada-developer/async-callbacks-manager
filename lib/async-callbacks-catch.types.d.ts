import { TCancelablePromise } from './async-callbacks-promises.types';
export type TExceptionHandlingType = 'error' | 'warn' | 'ignore';
export type TTryCatchCallbackConfig<TResult = unknown> = {
    type?: TExceptionHandlingType;
    defaultResult?: Partial<TResult> | null;
};
export type TTryCatchCallbackPromiseConfig<TResult = unknown> = {
    type?: TExceptionHandlingType;
    defaultResult?: Partial<TResult> | null;
    ignoreCancel?: boolean;
};
export type TTryCatchResult<TResult, TError = unknown> = {
    error: TError;
    result?: TResult;
};
export type TTryCatchPromiseResult<TResult, TError = unknown> = Promise<TTryCatchResult<TResult, TError> & {
    promise: TCancelablePromise<TResult>;
}>;
//# sourceMappingURL=async-callbacks-catch.types.d.ts.map