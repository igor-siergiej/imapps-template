import { CreateItemSchema } from '@__APP_NAME__/types';
import type { Context } from 'hono';
import type { BlankEnv } from 'hono/types';

import { dependencyContainer } from '../../dependencies/container';
import { DependencyToken } from '../../dependencies/types';

type ItemContext = Context<BlankEnv, '/api/items/:id'>;

const getItemService = () => dependencyContainer.resolve(DependencyToken.ItemService);

export const getItems = async (c: Context) => c.json(await getItemService().listItems(), 200);

export const getItem = async (c: ItemContext) => {
    const item = await getItemService().getItem(c.req.param('id'));

    if (!item) {
        return c.json({ message: 'Item not found' }, 404);
    }

    return c.json(item, 200);
};

export const addItem = async (c: Context) => {
    const parsed = CreateItemSchema.safeParse(await c.req.json());

    if (!parsed.success) {
        return c.json({ message: 'Invalid item payload' }, 400);
    }

    return c.json(await getItemService().createItem(parsed.data.name), 201);
};

export const deleteItem = async (c: ItemContext) => {
    const deleted = await getItemService().deleteItem(c.req.param('id'));

    if (!deleted) {
        return c.json({ message: 'Item not found' }, 404);
    }

    return new Response(null, { status: 204 });
};
