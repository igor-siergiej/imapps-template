import type { Item } from '@__APP_NAME__/types';
import type { Logger, MongoDbConnection } from '@imapps/api-utils';

import type { IdGenerator } from '../domain/IdGenerator';
import type { ItemRepository } from '../domain/ItemRepository';
import type { ItemService } from '../domain/ItemService';
import { CollectionNames } from '../types';

export type Collections = {
    [CollectionNames.Items]: Item;
};

export enum DependencyToken {
    Database = 'Database',
    Logger = 'Logger',
    ItemRepository = 'ItemRepository',
    ItemService = 'ItemService',
    IdGenerator = 'IdGenerator',
}

export type Dependencies = {
    [DependencyToken.Database]: MongoDbConnection<Collections>;
    [DependencyToken.Logger]: Logger;
    [DependencyToken.ItemRepository]: ItemRepository;
    [DependencyToken.ItemService]: ItemService;
    [DependencyToken.IdGenerator]: IdGenerator;
};
