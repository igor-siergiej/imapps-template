import { Logger, MongoDbConnection } from '@imapps/api-utils';

import { ItemService } from '../domain/ItemService';
import { MongoItemRepository } from '../infrastructure/MongoItemRepository';
import { UuidGenerator } from '../infrastructure/UuidGenerator';
import { dependencyContainer } from './container';
import { DependencyToken } from './types';

export { dependencyContainer };

export const registerDependencies = () => {
    dependencyContainer.registerSingleton(DependencyToken.Database, MongoDbConnection);
    dependencyContainer.registerSingleton(DependencyToken.Logger, Logger);
    dependencyContainer.registerSingleton(DependencyToken.IdGenerator, UuidGenerator);

    dependencyContainer.registerSingleton(
        DependencyToken.ItemRepository,
        // @ts-expect-error - Dependency injection requires constructor return override
        class {
            constructor() {
                return new MongoItemRepository(dependencyContainer.resolve(DependencyToken.Database));
            }
        }
    );

    dependencyContainer.registerSingleton(
        DependencyToken.ItemService,
        // @ts-expect-error - Dependency injection requires constructor return override
        class {
            constructor() {
                return new ItemService(
                    dependencyContainer.resolve(DependencyToken.ItemRepository),
                    dependencyContainer.resolve(DependencyToken.IdGenerator)
                );
            }
        }
    );
};
