'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { addNotification } from '@/lib/notificationStore';

export default function SocketListener() {
  const router = useRouter();

  useEffect(() => {
    // Connect to the Node.js API server using the .env URL or fallback
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiURL);

    // Whenever a task is created or completed via ANY connected client, the Server triggers this!
    socket.on('task_created', (task: any) => {
      const title = task?.title || 'New task';
      toast.success(`New task dispatched!\n${title}`, { duration: 4000, icon: '📋' });
      addNotification({
        message: `New task dispatched: ${title}`,
        icon: '📋',
        type: 'info',
      });
      router.refresh();
    });

    socket.on('task_completed', (task: any) => {
      const actor = task.source === 'admin' ? 'Admin' : 'Field Engineer';
      const msg = `${actor} marked task as completed!\n${task.title}`;
      toast.success(msg, { duration: 5000, icon: task.source === 'admin' ? '🛡️' : '👷' });
      addNotification({
        message: `${actor} completed: ${task.title}`,
        icon: task.source === 'admin' ? '🛡️' : '👷',
        type: 'success',
      });
      router.refresh();
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  // It renders absolutely nothing gracefully!
  return null;
}
