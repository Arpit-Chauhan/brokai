'use client';

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        setIsOffline(!navigator.onLine);

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="bg-red-500 text-white text-center py-2 px-4 shadow border-b border-red-700 font-medium text-sm w-full top-0 sticky z-50">
            ⚠️ You are currently offline. Tasks cannot be dispatched or updated until connection is restored.
        </div>
    );
}
