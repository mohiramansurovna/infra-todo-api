import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION ?? 'us-east-1',
    // Only set locally, to talk to DynamoDB Local. Empty on EC2.
    ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});

export const db = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = process.env.TABLE_NAME ?? 'todos';
