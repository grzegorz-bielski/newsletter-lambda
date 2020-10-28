import { DynamoDB, SES } from 'aws-sdk';

import { EmailRepo } from './EmailRepo';
import { EmailService } from './EmailService';

const email = process.env.EMAIL;

if (!email) {
  throw new Error('Email must be provided in the .env file and loaded in the lambda!');
}

const dynamoDbTable = process.env.SUBSCRIBERS_TABLE;

if (!dynamoDbTable) {
  throw new Error('DynamoDB Table must be provided in the .env file and loaded in the lambda!');
}

export const emailRepository = new EmailRepo(
  new DynamoDB(),
  new DynamoDB.DocumentClient(),
  dynamoDbTable,
);
export const emailService = new EmailService(new SES(), email);
