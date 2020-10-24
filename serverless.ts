import type { Serverless, Functions, IamRoleStatement } from 'serverless/aws';

const functions: Functions = {
  register: {
    handler: 'src/handler.register',
    events: [
      {
        http: {
          method: 'post',
          path: 'register',
        },
      },
    ],
  },
  publish: {
    handler: 'src/handler.publish',
    events: [
      {
        http: {
          method: 'post',
          path: 'publish',
        },
      },
    ],
  },
};

const dynamoDBPermissions: IamRoleStatement = {
  Effect: 'Allow',
  Action: ['dynamodb:Query', 'dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:PutItem'],
  Resource: '*',
};

const sesPermissions: IamRoleStatement = {
  Effect: 'Allow',
  Action: ['ses:SendEmail', 'ses:SendRawEmail'],
  Resource: '*',
};

const providerOptions: Pick<Serverless, 'resources' | 'provider'> = {
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-central-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SUBSCRIBERS_TABLE: '${self:service}-${opt:stage, self:provider.stage}',
    },
    iamRoleStatements: [dynamoDBPermissions, sesPermissions],
  },
  resources: {
    Resources: {
      usersTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.SUBSCRIBERS_TABLE}',
          AttributeDefinitions: [
            {
              AttributeName: 'email',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'email',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
};

const serverlessConfiguration: Serverless = {
  service: {
    name: 'newsletter-app',
  },
  frameworkVersion: '2',
  plugins: ['serverless-webpack', 'serverless-localstack'],
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    localstack: {
      stages: ['local'],
      docker: {
        sudo: true,
      },
    },
  },

  ...providerOptions,
  functions,
};

module.exports = serverlessConfiguration;
