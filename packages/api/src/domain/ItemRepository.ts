import type { Item } from '@__APP_NAME__/types';

export interface ItemRepository {
    insert(item: Item): Promise<void>;
    getAll(): Promise<Array<Item>>;
    getById(id: string): Promise<Item | null>;
    delete(id: string): Promise<boolean>;
}
