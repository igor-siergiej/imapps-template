import { Hono } from 'hono';

import { dependencyContainer } from '../dependencies/container';
import { DependencyToken } from '../dependencies/types';
import { addItem, deleteItem, getItem, getItems } from '../interfaces/ItemHandlers';

export const createRoutes = (): Hono => {
    const router = new Hono();

    router.get('/api/health', async (c) => {
        const databaseConnected = await dependencyContainer.resolve(DependencyToken.Database).ping();

        return c.json({ status: databaseConnected ? 'healthy' : 'unhealthy' }, databaseConnected ? 200 : 500);
    });

    router.get('/api/items', getItems);
    router.post('/api/items', addItem);
    router.get('/api/items/:id', getItem);
    router.delete('/api/items/:id', deleteItem);

    return router;
};
