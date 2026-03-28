import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import OfflineIndicator from '@/components/OfflineIndicator';
import SocketListener from '@/components/SocketListener';
import Header from '@/components/Header';
import { fetchTasks } from './actions';
import { Suspense } from 'react';

// Local Shimmer for Task List only
function TaskListSkeleton() {
  return (
    <div className="bg-white shadow-sm overflow-hidden rounded-lg border border-gray-100 p-6 space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <hr className="border-gray-100" />
      <div className="space-y-3">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <hr className="border-gray-100" />
      <div className="space-y-3">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

// Data fetching wrapper
async function TasksData() {
  const tasks = await fetchTasks();
  return <TaskList tasks={tasks} />;
}

export default async function Home() {
  const tasks = await fetchTasks();

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-gray-900 font-sans flex flex-col">
      <OfflineIndicator />
      <SocketListener />

      {/* Top Navigation Bar with Search & Notifications */}
      <Header tasks={tasks} />

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column: Form */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <TaskForm />
          </div>

          {/* Right Column: List & Stats */}
          <div className="xl:col-span-8 flex flex-col gap-8 min-w-0">
            <Suspense fallback={<TaskListSkeleton />}>
              <TasksData />
            </Suspense>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1500px] mx-auto px-6 lg:px-10 pb-8 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-gray-400 gap-4">
        <span>&copy; 2026 Brokai Labs. All rights reserved.</span>
        <div className="flex items-center gap-6 uppercase tracking-wider">
          <a href="https://www.brokailabs.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition">Privacy Policy</a>
          <a href="https://www.brokailabs.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition">Terms of Service</a>
          <a href="https://www.brokailabs.com/faq" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition">Support</a>
        </div>
      </footer>
    </div>
  );
}

