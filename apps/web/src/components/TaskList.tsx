'use client';

import { completeTask } from '@/app/actions';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { addNotification } from '@/lib/notificationStore';

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
        } else {
            // toast.success(`Task completed: ${task.title}`, { duration: 3000, icon: '✅' });
            // addNotification({
            //     message: `You completed: ${task.title}`,
            //     icon: '✅',
            //     type: 'success',
            // });
        }
    };

    return (
        <li className={`relative rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-3 overflow-hidden flex flex-col sm:flex-row border ${task.status === 'Completed' ? 'bg-white border-gray-100/50' : 'bg-white border-gray-100/50'}`}>
            {/* Left Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.status === 'Completed' ? 'bg-green-500' : 'bg-amber-400'}`} />

            <div className="flex-1 p-3 pl-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {/* Top Row: Date */}
                    <div className="flex items-center gap-3">
                        <span className="text-[12px] font-semibold text-gray-500 tracking-wide">Created: {formatDate(task.createdAt)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[16px] font-black text-gray-900 break-words leading-tight">{task.title}</h3>

                    {/* Sub Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-4 gap-y-2 text-[13px] text-gray-500 font-medium mt-0.5">
                        <div className="flex items-start w-full">
                            <span className="mr-1.5 mt-[3px] text-gray-400 flex-shrink-0">
                                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </span>
                            <span className="break-words w-full pe-2">{task.location}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Badges & Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                        className={`px-3 py-1 inline-flex text-[11px] leading-5 font-black uppercase tracking-widest rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                        {task.status}
                    </span>

                    {task.status !== 'Completed' ? (
                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="text-[11px] font-black tracking-wider text-blue-600 hover:text-white border-2 border-blue-600 px-3 py-1 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center bg-white uppercase transition-colors"
                        >
                            {loading ? 'WAIT...' : 'MARK DONE'}
                        </button>
                    ) : (
                        <div suppressHydrationWarning className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-right">
                            Completed at: <span className="text-gray-700 font-black tracking-normal normal-case">{formatDate(task.updatedAt)}</span>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
    const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');

    const pendingCount = tasks.filter(t => t.status === 'Pending').length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    
    // JS safe precision for percentage
    const completionPercentage = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 1000) / 10;

    const filteredTasks = tasks.filter((t) => t.status === activeTab).sort((a, b) => {
        if (activeTab === 'Completed') {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="flex flex-col w-full h-full min-h-[500px] bg-[#eef2f7] rounded-[20px] p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-200/50">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 mb-5 gap-8 px-2">
                <button
                    onClick={() => setActiveTab('Pending')}
                    className={`pb-3 text-[14px] font-bold transition-all relative ${activeTab === 'Pending' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Pending ({pendingCount})
                    {activeTab === 'Pending' && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('Completed')}
                    className={`pb-3 text-[14px] font-bold transition-all relative ${activeTab === 'Completed' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Completed ({completedCount})
                    {activeTab === 'Completed' && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />}
                </button>
            </div>
            
            {/* Task List */}
            <ul role="list" className="max-h-[430px] overflow-y-auto pr-2 pb-2 scrollbar-hide">
                {filteredTasks.length === 0 ? (
                    <li className="p-12 text-center text-gray-400 font-bold bg-white rounded-[20px] border border-gray-100 flex flex-col items-center justify-center min-h-[200px] shadow-sm">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        No {activeTab.toLowerCase()} tasks actively tracked.
                    </li>
                ) : (
                    filteredTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                    ))
                )}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto pt-6">
                <div className="bg-[#f0f4f8] py-4 px-4 rounded-[16px] flex flex-col items-center justify-center transition hover:bg-[#e8edf4]">
                    <div className="text-[22px] font-black text-gray-900 leading-none">{pendingCount}</div>
                    <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em] mt-1.5">PENDING</div>
                </div>
                <div className="bg-[#f8f9fc] py-4 px-4 rounded-[16px] flex flex-col items-center justify-center transition hover:bg-[#f0f3f8]">
                    <div className="text-[22px] font-black text-gray-900 leading-none">{completedCount}</div>
                    <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em] mt-1.5">COMPLETED</div>
                </div>
                <div className="bg-[#f4fbf8] py-4 px-4 rounded-[16px] flex flex-col items-center justify-center transition hover:bg-[#e9f6ef]">
                    <div className="text-[22px] font-black text-[#0f766e] leading-none">{completionPercentage}%</div>
                    <div className="text-[10px] font-extrabold text-emerald-700/70 uppercase tracking-[0.2em] mt-1.5">COMPLETE %</div>
                </div>
            </div>
            
            {/* Custom scrollbar hider css explicitly for the list */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
