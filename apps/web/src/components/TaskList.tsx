'use client';

import { completeTask } from '@/app/actions';
import { useState } from 'react';

type Task = {
    id: string;
    title: string;
    location: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

function formatDate(dateString: string) {
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
}

function TaskItem({ task }: { task: Task }) {
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        setLoading(true);
        const result = await completeTask(task.id);
        setLoading(false);
        if (result?.error) {
            alert(result.error);
        }
    };

    return (
        <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium text-indigo-600 truncate">{task.title}</h3>
                    <div className="mt-2 text-sm text-gray-500 flex flex-col gap-1">
                        <span className="flex items-center font-medium">
                            📍 {task.location}
                        </span>
                        <span suppressHydrationWarning className="flex items-center text-xs text-gray-400">
                            🗓️ Created: {formatDate(task.createdAt)}
                        </span>
                    </div>
                </div>
                <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex flex-col items-end gap-2">
                        <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                        >
                            {task.status}
                        </span>
                        {task.status !== 'Completed' ? (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="text-sm text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm bg-white"
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'Completing...' : 'Mark Completed'}
                            </button>
                        ) : (
                            <div suppressHydrationWarning className="text-xs text-gray-500 italic mt-1 bg-gray-50 px-2 py-1 rounded">
                                Completed at:<br />
                                {formatDate(task.updatedAt)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
    const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');

    if (!tasks || tasks.length === 0) {
        return (
            <div className="p-8 text-gray-500 text-center bg-white rounded-lg shadow-sm border border-gray-100">
                No tasks found. Dispatch one to get started!
            </div>
        );
    }

    const filteredTasks = tasks.filter((t) => t.status === activeTab);

    return (
        <div className="bg-white shadow-sm overflow-hidden rounded-lg border border-gray-100">
            <div className="flex border-b border-gray-100 bg-gray-50">
                <button
                    onClick={() => setActiveTab('Pending')}
                    className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'Pending' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                    Pending ({tasks.filter(t => t.status === 'Pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('Completed')}
                    className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'Completed' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                    Completed ({tasks.filter(t => t.status === 'Completed').length})
                </button>
            </div>
            
            <ul role="list" className="divide-y divide-gray-100">
                {filteredTasks.length === 0 ? (
                    <li className="p-8 text-center text-gray-400 italic">
                        No {activeTab.toLowerCase()} tasks found.
                    </li>
                ) : (
                    filteredTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                    ))
                )}
            </ul>
        </div>
    );
}
