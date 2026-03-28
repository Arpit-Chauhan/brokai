'use client';

import { createTask } from '@/app/actions';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5"
        >
            {pending && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {pending ? 'Dispatching...' : 'Dispatch Task'}
        </button>
    );
}

export default function TaskForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        const title = formData.get('title')?.toString().trim();
        const location = formData.get('location')?.toString().trim();

        if (!title || !location || title.length === 0 || location.length === 0) {
            setError('Title and Location cannot be empty or just spaces.');
            return;
        }

        const result = await createTask(formData);

        if (result?.error) {
            setError(result.error);
        } else {
            formRef.current?.reset();
        }
    };

    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Dispatch New Task
            </h2>

            {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 flex items-start">
                    <svg className="w-5 h-5 mr-2 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    <span>{error}</span>
                </div>
            )}

            <form ref={formRef} action={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border placeholder-gray-400 bg-white"
                        placeholder="e.g. Fix broken router"
                    />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="location"
                        id="location"
                        required
                        className="block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border placeholder-gray-400 bg-white"
                        placeholder="e.g. Room 402"
                    />
                </div>
                <SubmitButton />
            </form>
        </div>
    );
}
