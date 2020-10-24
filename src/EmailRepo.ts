import type { DynamoDB } from 'aws-sdk';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import * as A from 'fp-ts/lib/Array';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { flow } from 'fp-ts/lib/function';

import { fromDecoded } from './Errors';
import { Result, fromAWSCall } from './';

export const Emails = t.array(t.string);
export type Emails = t.TypeOf<typeof Emails>;

export class EmailRepo {
  constructor(
    private readonly db: DynamoDB,
    private readonly dc: DynamoDB.DocumentClient,
    private readonly tableName = process.env.SUBSCRIBERS_TABLE ?? '',
  ) {}

  put(email: string): Result<DynamoDB.PutItemOutput> {
    return fromAWSCall(() =>
      this.db.putItem({ TableName: this.tableName, Item: { email: { S: email } } }).promise(),
    );
  }

  getAll(): Result<Emails> {
    return pipe(
      fromAWSCall(() => this.dc.scan({ TableName: this.tableName }).promise()),
      TE.chain(
        flow(
          a => a.Items,
          O.fromNullable,
          O.map(A.chain(a => Object.values(a))),
          O.getOrElse<unknown[]>(() => []),
          Emails.decode,
          fromDecoded,
          TE.fromEither,
        ),
      ),
    );
  }
}
