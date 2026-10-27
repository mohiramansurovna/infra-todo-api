import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { db, TABLE_NAME } from './db.js';

export const todosRouter = Router();

todosRouter.post('/', async (req, res) => {
    const { title } = req.body ?? {};
    if (typeof title !== 'string' || title.trim() === '') {
        res.status(400).json({ error: 'title is required' });
        return;
    }
    const todo = {
        id: randomUUID(),
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
    };
    await db.send(new PutCommand({ TableName: TABLE_NAME, Item: todo }));
    res.status(201).json(todo);
});

todosRouter.get('/', async (_req, res) => {
    const result = await db.send(new ScanCommand({ TableName: TABLE_NAME }));
    res.json(result.Items ?? []);
});

todosRouter.get('/:id', async (req, res) => {
    const result = await db.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { id: req.params.id } })
    );
    if (!result.Item) {
        res.status(404).json({ error: 'not found' });
        return;
    }
    res.json(result.Item);
});

todosRouter.put('/:id', async (req, res) => {
    const { title, completed } = req.body ?? {};
    if (typeof title !== 'string' || title.trim() === '' || typeof completed !== 'boolean') {
        res.status(400).json({ error: 'title (string) and completed (boolean) are required' });
        return;
    }
    try {
        const result = await db.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { id: req.params.id },
                UpdateExpression: 'SET title = :t, completed = :c',
                ConditionExpression: 'attribute_exists(id)',
                ExpressionAttributeValues: { ':t': title.trim(), ':c': completed },
                ReturnValues: 'ALL_NEW',
            })
        );
        res.json(result.Attributes);
    } catch (err) {
        if (err instanceof ConditionalCheckFailedException) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        throw err;
    }
});

todosRouter.delete('/:id', async (req, res) => {
    try {
        await db.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { id: req.params.id },
                ConditionExpression: 'attribute_exists(id)',
            })
        );
        res.status(204).send();
    } catch (err) {
        if (err instanceof ConditionalCheckFailedException) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        throw err;
    }
});
