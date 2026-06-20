import { ConfigService, parsers } from '@imapps/api-utils';

const schema = {
    port: { parser: parsers.number, from: 'PORT' },
    connectionUri: { parser: parsers.string, from: 'CONNECTION_URI' },
    databaseName: { parser: parsers.string, from: 'DATABASE_NAME' },
} as const;

export const config = new ConfigService(schema);
