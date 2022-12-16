import { ICancelablePromise } from './async-callbacks-promises.types';

export type IExceptionHandlingType = 'error' | 'warn' | 'ignore';

export type ITryCatchCallbackConfig<IResult = unknown> = {
  type?: IExceptionHandlingType;
  defaultResult?: Partial<IResult> | null;
};

export type ITryCatchCallbackPromiseConfig<IResult = unknown> = {
  type?: IExceptionHandlingType;
  defaultResult?: Partial<IResult> | null;
  ignoreCancel?: boolean;
};

export type ITryCatchResult<IResult, IError = unknown> = {
  error: IError;
  result?: IResult;
};

export type ITryCatchPromiseResult<IResult, IError = unknown> = Promise<
  ITryCatchResult<IResult, IError> & {
    promise: ICancelablePromise<IResult>;
  }
>;
