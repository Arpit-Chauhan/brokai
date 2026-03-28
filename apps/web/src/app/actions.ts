'use server'

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

export async function createTask(formData: FormData) {
    const title = formData.get('title')?.toString().trim();
    const location = formData.get('location')?.toString().trim();

    if (!title || !location) {
        return { error: 'Please enter valid non-empty values for both Title and Location.' };
    }

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, location, status: 'Pending' })
        });
        if (!res.ok) throw new Error('Failed to create task');
    } catch (error) {
        console.error('API Error:', error);
        return { error: 'Failed to create task on server. Check connection.' };
    }

    revalidatePath('/');
    return { success: true };
}

export async function completeTask(id: string) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Completed', source: 'admin' }),
        });

        if (!response.ok) throw new Error('Failed to complete task');
    } catch (error) {
        console.error('API Error:', error);
        return { error: 'Failed to complete task on server. Check connection.' };
    }

    revalidatePath('/');
    return { success: true };
}
