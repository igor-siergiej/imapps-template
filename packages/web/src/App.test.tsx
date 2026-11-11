import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { App } from './App';

describe('App', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response(JSON.stringify([{ id: '1', name: 'Widget', createdAt: '' }])))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders items from the api', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Widget')).toBeDefined();
        });
    });
});
