import type { Item } from '@__APP_NAME__/types';
import { type FormEvent, useCallback, useEffect, useState } from 'react';

export const App = () => {
    const [items, setItems] = useState<Array<Item>>([]);
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loadItems = useCallback(async () => {
        try {
            const response = await fetch('/api/items');

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            setItems(await response.json());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load items');
        }
    }, []);

    useEffect(() => {
        void loadItems();
    }, [loadItems]);

    const addItem = async (event: FormEvent) => {
        event.preventDefault();

        if (!name.trim()) {
            return;
        }

        await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        setName('');
        await loadItems();
    };

    return (
        <main>
            <h1>__APP_TITLE__</h1>
            <form onSubmit={addItem}>
                <input
                    aria-label="Item name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="New item"
                />
                <button type="submit">Add</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </main>
    );
};
