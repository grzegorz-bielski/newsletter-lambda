import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import * as t from 'io-ts';
import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { flow } from 'fp-ts/lib/function';
import 'source-map-support/register';

import { EmailRepo } from './EmailRepo';
import * as Errors from './Errors';
import { pipe } from 'fp-ts/lib/pipeable';

const emailRepo = new EmailRepo(new DynamoDB());

export const register: APIGatewayProxyHandler = (event, _context) =>
  pipe(
    EmailService.extractEmail(event),
    TE.fromEither,
    TE.chain(a => emailRepo.put(a.email)),
    TE.fold(
      err =>
        T.of({
          statusCode: Errors.toStatusCode(err),
          body: Errors.toErrorMsg(err),
        }),
      () => T.of({ statusCode: 201, body: 'ok' }),
    ),
  )();

namespace EmailService {
  const EmailPayload = t.type({
    email: t.string, // this probably could be a type refinement
  });

  export const extractEmail = flow(
    (e: APIGatewayProxyEvent) => e.body,
    E.fromNullable(Errors.ServiceError.noRequestBody()),
    E.chain(e => E.parseJSON(e, error => Errors.ServiceError.couldNotParseBody({ error }))),
    E.chain(flow(EmailPayload.decode, Errors.fromDecoded)),
  );
}
