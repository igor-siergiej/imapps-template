import type { Item } from '@__APP_NAME__/types';

import type { IdGenerator } from './IdGenerator';
import type { ItemRepository } from './ItemRepository';

export class ItemService {
    constructor(
        private readonly repository: ItemRepository,
        private readonly idGenerator: IdGenerator
    ) {}

    listItems(): Promise<Array<Item>> {
        return this.repository.getAll();
    }

    getItem(id: string): Promise<Item | null> {
        return this.repository.getById(id);
    }

    async createItem(name: string): Promise<Item> {
        const item: Item = {
            id: this.idGenerator.generate(),
            name,
            createdAt: new Date().toISOString(),
        };

        await this.repository.insert(item);

        return item;
    }

    deleteItem(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}
