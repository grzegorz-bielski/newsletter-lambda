import { AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { pipe } from 'fp-ts/lib/pipeable';
import * as TE from 'fp-ts/lib/TaskEither';

import { ServiceError } from './Errors';

export type Result<T> = TE.TaskEither<ServiceError, T>;

export const fromAWSCall = <T>(serviceCall: () => Promise<PromiseResult<T, AWSError>>): Result<T> =>
  pipe(
    TE.tryCatch(serviceCall, error => ServiceError.networkError({ error })),
    TE.map(e => e.$response.data as T),
  );
