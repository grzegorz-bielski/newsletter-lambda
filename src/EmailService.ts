import type { APIGatewayProxyEvent } from 'aws-lambda';
import { SES } from 'aws-sdk';
import * as E from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { flow } from 'fp-ts/lib/function';
import 'source-map-support/register';

import * as Errors from './Errors';
import type { Emails } from './EmailRepo';
import { Result, fromAWSCall } from './';

const EmailPayload = t.type({
  email: t.string, // this probably could be a type refinement
});

const NewsletterMsg = t.type({
  msg: t.string,
});

export class EmailService {
  constructor(private readonly ses: SES, private readonly emailAddress: string) {}

  extractEmail = fromAPIGatewayEvent(EmailPayload.decode);
  extractNewsletterMsg = fromAPIGatewayEvent(NewsletterMsg.decode);

  sendEmail(recipients: Emails, msg: string): Result<SES.SendEmailResponse> {
    return fromAWSCall(() =>
      this.ses
        .sendEmail({
          Destination: {
            ToAddresses: recipients,
          },
          Message: {
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: `<html><body><h1>Hello There</h1><p style='color:red'>${msg}</p></body></html>`,
              },
            },

            Subject: { Data: 'Test Email' },
          },
          Source: this.emailAddress,
        })
        .promise(),
    );
  }
}

const fromAPIGatewayEvent = <A>(decode: (i: E.Json) => t.Validation<A>) =>
  flow(
    (e: APIGatewayProxyEvent) => e.body,
    E.fromNullable(Errors.ServiceError.noRequestBody()),
    E.chain(e => E.parseJSON(e, error => Errors.ServiceError.couldNotParseBody({ error }))),
    E.chain(flow(decode, Errors.fromDecoded)),
  );
