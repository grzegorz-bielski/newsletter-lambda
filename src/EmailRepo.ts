import { DynamoDB } from 'aws-sdk';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ServiceError } from './Errors';

export class EmailRepo {
  constructor(
    private readonly db: DynamoDB,
    private readonly tableName = process.env.SUBSCRIBERS_TABLE ?? '',
  ) {}

  put(email: string) {
    return pipe(
      TE.tryCatch(
        () =>
          this.db.putItem({ TableName: this.tableName, Item: { email: { S: email } } }).promise(),
        error => ServiceError.networkError({ error }),
      ),
      TE.map(e => e.$response.data as DynamoDB.PutItemOutput),
    );
  }
}
