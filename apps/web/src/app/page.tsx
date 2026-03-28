import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import OfflineIndicator from '@/components/OfflineIndicator';
import SocketListener from '@/components/SocketListener';
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

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <OfflineIndicator />
      <SocketListener />
      <div className="pt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <img src="/logo.jpg" alt="Brokai Logo" className="h-[72px] w-auto mx-auto mb-6 drop-shadow-sm rounded-2xl" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Dispatch Dashboard
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Manage field tasks for engineers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white/50 p-6 rounded-xl border border-gray-200">
            <div className="md:col-span-1">
              <TaskForm />
            </div>
            <div className="md:col-span-2">
              <Suspense fallback={<TaskListSkeleton />}>
                <TasksData />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
