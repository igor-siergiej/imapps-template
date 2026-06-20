import { z } from 'zod';

export const ItemSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    createdAt: z.string(),
});

export const CreateItemSchema = ItemSchema.pick({ name: true });

export type Item = z.infer<typeof ItemSchema>;
export type CreateItem = z.infer<typeof CreateItemSchema>;
