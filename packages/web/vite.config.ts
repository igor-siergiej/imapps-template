import path from 'node:path';

import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig(({ mode }) => ({
    plugins: lazyPlugins(() => [react()]),
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
            '@__APP_NAME__/types': path.resolve(import.meta.dirname, '../types/src'),
        },
    },
    define: {
        __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || 'localhost'),
        __IS_PROD__: JSON.stringify(mode !== 'development'),
    },
    build: {
        outDir: './build',
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: false,
                secure: false,
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        exclude: [...configDefaults.exclude, 'e2e/**'],
    },
}));
