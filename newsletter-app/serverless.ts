import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'newsletter-app',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
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
      // lambda: {
      //   mountCode: true
      // }
    }
  },
  // Add the serverless-webpack plugin
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
      
    }
  }
}

module.exports = serverlessConfiguration;
