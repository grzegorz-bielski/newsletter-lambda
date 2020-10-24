import * as t from 'io-ts';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { PathReporter } from 'io-ts/PathReporter';
import { unionize, ofType, UnionOf } from 'unionize';

export const ServiceError = unionize({
  noRequestBody: {},
  couldNotParseBody: ofType<{ error: unknown }>(),
  networkError: ofType<{ error: unknown }>(),
  invalidStructure: ofType<{ report: string[] }>(),
});
export type ServiceError = UnionOf<typeof ServiceError>;

export const toErrorMsg = (error: ServiceError): string =>
  ServiceError.match(error, {
    noRequestBody: () => 'No request body was provided',
    couldNotParseBody: ({ error }) => `Could not parse the request body: ${error}`,
    networkError: ({ error }) => `Network error: ${error}`,
    invalidStructure: ({ report }) => `Invalid structure: ${report.join(' ')}`,
  });

export const toStatusCode = (error: ServiceError): number =>
  ServiceError.match(error, {
    noRequestBody: () => 400,
    couldNotParseBody: () => 400,
    networkError: () => 500,
    invalidStructure: () => 400,
  });

export const fromDecoded = <R>(decoded: E.Either<t.Errors, R>): E.Either<ServiceError, R> => {
  const report = PathReporter.report(decoded);

  return pipe(
    decoded,
    E.mapLeft(() => ServiceError.invalidStructure({ report })),
  );
};
