import type { Item } from '@__APP_NAME__/types';
import type { MongoDbConnection } from '@imapps/api-utils';

import type { Collections } from '../dependencies/types';
import type { ItemRepository } from '../domain/ItemRepository';
import { CollectionNames } from '../types';

export class MongoItemRepository implements ItemRepository {
    constructor(private readonly database: MongoDbConnection<Collections>) {}

    private get collection() {
        return this.database.getCollection(CollectionNames.Items);
    }

    async insert(item: Item): Promise<void> {
        await this.collection.insertOne(item);
    }

    async getAll(): Promise<Array<Item>> {
        return this.collection.find({}, { projection: { _id: 0 } }).toArray();
    }

    async getById(id: string): Promise<Item | null> {
        return this.collection.findOne({ id }, { projection: { _id: 0 } });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ id });

        return result.deletedCount === 1;
    }
}
