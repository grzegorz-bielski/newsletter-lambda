import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import 'source-map-support/register';

const dynamoDB = new AWS.DynamoDB();
const tableName = process.env.SUBSCRIBERS_TABLE ?? '';

export const register: APIGatewayProxyHandler = async (event, _context) => {
    const email = event.body ? (JSON.parse(event.body) as string) : '';
    const res = await dynamoDB
        .putItem({
            TableName: tableName,
            Item: { email: { S: email } },
        })
        .promise();

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message:
                    'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
                input: event,
            },
            null,
            2,
        ),
    };
};
