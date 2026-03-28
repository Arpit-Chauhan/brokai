import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    location: z.string().min(1, 'Location is required'),
    status: z.enum(['Pending', 'Completed']).optional(),
});

export const updateTaskSchema = z.object({
    status: z.enum(['Pending', 'Completed']),
    source: z.string().optional(),
});
