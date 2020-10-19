import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'newsletter-app',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    localstack: {
      stages: ['local'],
      docker: { 
        sudo: true
       }
    }
  },
  plugins: ['serverless-webpack', 'serverless-localstack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    register: {
      handler: 'handler.register',
      events: [
        {
          http: {
            method: 'post',
            path: 'register',
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      "usersTable": {
        "Type": "AWS::DynamoDB::Table",
        "Properties": {
          "TableName": "usersTable",
          "AttributeDefinitions": [
            {
              "AttributeName": "email",
              "AttributeType": "S"
            }
          ],
          "KeySchema": [
            {
              "AttributeName": "email",
              "KeyType": "HASH"
            }
          ]
        }
      },
      // "emailService": {
      //   "Type": "AWS::"
      // }
    } 
  },
}

module.exports = serverlessConfiguration;
