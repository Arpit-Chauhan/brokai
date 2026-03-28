'use client';

import { createTask } from '@/app/actions';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';
import { addNotification } from '@/lib/notificationStore';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(13,110,253,0.39)] text-[14px] font-black tracking-widest text-white bg-[#0d6efd] hover:bg-[#0b5ed7] focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 uppercase mt-8"
        >
            {pending && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {pending ? 'DISPATCHING...' : 'DISPATCH TASK ⚡'}
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
            const taskTitle = title || 'Untitled';
            // toast.success(`Task dispatched: ${taskTitle}`, { duration: 3000, icon: '🚀' });
            // addNotification({
            //     message: `You dispatched: ${taskTitle}`,
            //     icon: '🚀',
            //     type: 'info',
            // });
            formRef.current?.reset();
        }
    };

    return (
        <div className="bg-white rounded-[20px] p-6 lg:p-8 relative">
            <div className="mb-8">
                <h2 className="text-[19px] font-black text-gray-900 flex items-center gap-3 tracking-tight">
                    <svg className="w-5 h-5 text-blue-600 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Dispatch New Task
                </h2>
                <p className="text-[13px] text-gray-500 mt-2 ml-8 font-medium leading-relaxed max-w-[300px]">Initialize a new task for field engineer</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 text-[13px] rounded-xl font-medium flex items-start">
                    <svg className="w-5 h-5 mr-2 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    <span>{error}</span>
                </div>
            )}

            <form ref={formRef} action={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Task Title</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="block w-full text-gray-900 rounded-xl sm:text-sm px-4 py-3.5 bg-[#f0f4f8] border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all placeholder-gray-400 font-medium"
                        placeholder="e.g., Fix Core Router Alpha"
                    />
                </div>
                <div>
                    <label htmlFor="location" className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Location</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <svg className="h-[18px] w-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            name="location"
                            id="location"
                            required
                            className="block w-full text-gray-900 rounded-xl sm:text-sm pl-[38px] pr-4 py-3.5 bg-[#f0f4f8] border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all placeholder-gray-400 font-medium"
                            placeholder="Sector 7G - Data Center"
                        />
                    </div>
                </div>
                <SubmitButton />
            </form>
        </div>
    );
}
