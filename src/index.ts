import express from 'express';
import { todosRouter } from './todos.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/todos', todosRouter);

app.use((err: unknown, _req: express.Request, res: express.Response) => {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
