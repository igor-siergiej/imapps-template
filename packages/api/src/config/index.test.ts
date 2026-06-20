import { describe, expect, it } from 'bun:test';

import { config } from './index';

describe('config', () => {
    it('reads PORT from env', () => {
        expect(config.get('port')).toBe(3001);
    });
});
