'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function SocketListener() {
  const router = useRouter();

  useEffect(() => {
    // Connect to the Node.js API server using the .env URL or fallback
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiURL);

    // Whenever a task is created or completed via ANY connected client, the Server triggers this!
    socket.on('task_created', () => {
      // Background re-fetch to instantly sync changes across devices without reloading!
      router.refresh();
    });

    socket.on('task_completed', (task: any) => {
      const actor = task.source === 'admin' ? 'Admin' : 'Field Engineer';
      toast.success(
        `${actor} marked task as completed!\n${task.title}`,
        { duration: 5000, icon: task.source === 'admin' ? '🛡️' : '👷' }
      );
      router.refresh();
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  // It renders absolutely nothing gracefully!
  return null;
}
