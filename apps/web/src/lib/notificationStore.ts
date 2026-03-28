// Client-side in-memory notification store (no backend needed)

export type Notification = {
  id: string;
  message: string;
  icon: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
  read: boolean;
};

let notifications: Notification[] = [];
let listeners: (() => void)[] = [];

function emit() {
  listeners.forEach((fn) => fn());
}

export function addNotification(n: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  notifications = [
    { ...n, id: crypto.randomUUID(), timestamp: new Date(), read: false },
    ...notifications,
  ];
  emit();
}

export function getNotifications(): Notification[] {
  return notifications;
}

export function getUnreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}

export function markAllRead() {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  emit();
}

export function clearAll() {
  notifications = [];
  emit();
}

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
