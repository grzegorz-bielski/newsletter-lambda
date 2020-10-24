import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB, SES } from 'aws-sdk';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import 'source-map-support/register';

import { EmailRepo } from './EmailRepo';
import { EmailService } from './EmailService';
import * as Errors from './Errors';
import { email } from './';

const emailRepository = new EmailRepo(new DynamoDB(), new DynamoDB.DocumentClient());
const emailService = new EmailService(new SES(), email);

export const register: APIGatewayProxyHandler = (event, _context) =>
  pipe(
    TE.fromEither(emailService.extractEmail(event)),
    TE.chain(a => emailRepository.put(a.email)),
    TE.fold(
      err =>
        T.of({
          statusCode: Errors.toStatusCode(err),
          body: Errors.toErrorMsg(err),
        }),
      () => T.of({ statusCode: 201, body: 'ok' }),
    ),
  )();

export const publish: APIGatewayProxyHandler = (event, _context) =>
  pipe(
    TE.fromEither(emailService.extractNewsletterMsg(event)),
    TE.chain(({ msg }) =>
      pipe(
        emailRepository.getAll(),
        TE.chain(emails => emailService.sendEmail(emails, msg)),
      ),
    ),
    TE.fold(
      err =>
        T.of({
          statusCode: Errors.toStatusCode(err),
          body: Errors.toErrorMsg(err),
        }),
      a => T.of({ statusCode: 201, body: JSON.stringify(a) }),
    ),
  )();
