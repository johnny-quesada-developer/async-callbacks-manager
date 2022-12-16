export type IPromiseStatus = 'canceled' | 'pending' | 'resolved' | 'rejected';

export type IResolveCallback<IResult> = (
  value?: IResult | PromiseLike<IResult>
) => void;

export type IRejectCallback = (reason?: unknown) => void;

export type ICancelCallback = (reason?: unknown) => void;

export type ICancelablePromiseCallback<T = unknown> = (
  resolve: IResolveCallback<T>,
  reject: IRejectCallback,
  cancel: ICancelCallback
) => void;

export interface ICancelablePromise<IResult> extends Promise<IResult> {
  status: IPromiseStatus;
  onCancel: (callback: ICancelCallback) => ICancelablePromise<IResult>;
}

export type IDecoupledCancelablePromise<IResult = unknown> = {
  resolve: IResolveCallback<IResult>;
  reject: IRejectCallback;
  cancel: ICancelCallback;
  promise: ICancelablePromise<IResult>;
};
