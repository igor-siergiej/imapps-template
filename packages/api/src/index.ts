import 'dotenv/config';

import { createApp } from '@imapps/api-utils/hono';

import { config } from './config';
import { dependencyContainer, registerDependencies } from './dependencies';
import { DependencyToken } from './dependencies/types';
import { createRoutes } from './routes';

const port = config.get('port');

const allowedOrigins: Array<string> = ['http://localhost:3000'];

export const onStartup = async () => {
    try {
        registerDependencies();

        const logger = dependencyContainer.resolve(DependencyToken.Logger);
        const database = dependencyContainer.resolve(DependencyToken.Database);

        if (!database) {
            throw new Error('Database dependency not found');
        }

        const app = createApp({ logger, allowedOrigins });

        logger.info('Starting API server - connecting to database');
        await database.connect({
            connectionUri: config.get('connectionUri'),
            databaseName: config.get('databaseName'),
        });
        logger.info('Connected to database');

        app.route('/', createRoutes());

        Bun.serve({
            port,
            fetch: app.fetch,
        });

        logger.info(`API server running on port ${port}`);
    } catch (error) {
        const logger = dependencyContainer.resolve(DependencyToken.Logger);
        logger.error('Encountered an error on start up', error);
        process.exit(1);
    }
};

onStartup();
