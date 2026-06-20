import { describe, expect, it } from 'bun:test';

import type { Item } from '@__APP_NAME__/types';

import type { ItemRepository } from './ItemRepository';
import { ItemService } from './ItemService';

const makeRepository = (): ItemRepository & { items: Array<Item> } => {
    const items: Array<Item> = [];

    return {
        items,
        async insert(item) {
            items.push(item);
        },
        async getAll() {
            return items;
        },
        async getById(id) {
            return items.find((i) => i.id === id) ?? null;
        },
        async delete(id) {
            const index = items.findIndex((i) => i.id === id);

            if (index === -1) {
                return false;
            }

            items.splice(index, 1);

            return true;
        },
    };
};

describe('ItemService', () => {
    it('creates an item with a generated id', async () => {
        const repository = makeRepository();
        const service = new ItemService(repository, { generate: () => 'fixed-id' });

        const item = await service.createItem('Widget');

        expect(item.id).toBe('fixed-id');
        expect(item.name).toBe('Widget');
        expect(repository.items).toHaveLength(1);
    });

    it('deletes an existing item', async () => {
        const repository = makeRepository();
        const service = new ItemService(repository, { generate: () => 'fixed-id' });
        await service.createItem('Widget');

        expect(await service.deleteItem('fixed-id')).toBe(true);
        expect(await service.deleteItem('missing')).toBe(false);
    });
});
