'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  clearAll,
  subscribe,
  type Notification,
} from '@/lib/notificationStore';

function formatTime(d: Date) {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function Header({ tasks }: { tasks: { id: string; title: string; location: string; status: string }[] }) {
  // --- Search ---
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = query.trim().length > 0
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.location.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- Notifications ---
  const notifications = useSyncExternalStore(subscribe, getNotifications, getNotifications);
  const unreadCount = useSyncExternalStore(subscribe, getUnreadCount, getUnreadCount);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setBellOpen((v) => !v);
    if (!bellOpen) markAllRead();
  };

  // --- Profile Dropdown & Theme ---
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  // Initialize from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem('brokai-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('brokai-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('brokai-theme', 'light');
    }
  };

  return (
    <header className={`border-b sticky top-0 z-10 w-full h-[72px] flex items-center justify-between px-6 lg:px-10 transition-colors ${isDark ? 'bg-[#1a1d27] border-[#2a2d3a] shadow-[0_2px_10px_rgba(0,0,0,0.3)]' : 'bg-white border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}>
      {/* Left: Branding */}
      <div className="flex items-center gap-4 min-w-[240px]">
        <img src="/logo.jpg" alt="Logo" className="w-[42px] h-[42px] rounded-xl object-cover shadow-sm bg-blue-50" />
        <div className="flex flex-col">
          <h1 className={`text-[17px] font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Dispatch Task</h1>
          <span className={`text-[10px] uppercase font-bold tracking-[0.1em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Dashboard</span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl px-8 w-full relative">
        <div className="relative group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className={`w-[18px] h-[18px] group-focus-within:text-blue-500 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            className={`block w-full pl-11 pr-4 py-2.5 border border-transparent text-[13px] rounded-xl outline-none transition-all font-medium ${isDark ? 'bg-[#2a2d3a] text-white placeholder-gray-500 focus:bg-[#1a1d27] focus:border-blue-500' : 'bg-[#f0f4f8] text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500'}`}
            placeholder="Search tasks or locations..."
          />
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && query.trim().length > 0 && (
          <div className={`absolute left-8 right-8 top-[48px] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border overflow-hidden z-50 ${isDark ? 'bg-[#22252f] border-[#2a2d3a]' : 'bg-white border-gray-100'}`}>
            {searchResults.length === 0 ? (
              <div className={`p-6 text-center text-[13px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                No tasks matching &ldquo;{query}&rdquo;
              </div>
            ) : (
              <ul className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
                {searchResults.map((task) => (
                  <li key={task.id} className={`px-5 py-3.5 transition-colors cursor-default flex items-start gap-3 ${isDark ? 'hover:bg-[#2a2d3a] divide-[#2a2d3a]' : 'hover:bg-[#f8f9fc]'}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${task.status === 'Completed' ? 'bg-green-500' : 'bg-amber-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-[14px] font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</div>
                      <div className={`text-[12px] font-medium truncate mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>📍 {task.location}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full flex-shrink-0 ${task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className={`border-t px-5 py-2 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'border-[#2a2d3a] text-gray-500 bg-[#1a1d27]' : 'border-gray-100 text-gray-400 bg-gray-50/50'}`}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </div>

      {/* Right: Profile & Actions */}
      <div className="flex items-center justify-end gap-6 min-w-[240px]">
        {/* Notification Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={handleBellClick}
            className={`relative p-2 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2d3a]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 border-2 border-white rounded-full box-content text-[9px] font-black text-white flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>

          {/* Notification Dropdown */}
          {bellOpen && (
            <div className={`absolute right-0 top-[48px] w-[380px] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border overflow-hidden z-50 ${isDark ? 'bg-[#22252f] border-[#2a2d3a]' : 'bg-white border-gray-100'}`}>
              <div className={`flex items-center justify-between px-5 py-3.5 border-b ${isDark ? 'border-[#2a2d3a] bg-[#1a1d27]' : 'border-gray-100 bg-gray-50/50'}`}>
                <span className={`text-[13px] font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={() => { clearAll(); }} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <svg className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  <span className={`text-[13px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No notifications yet</span>
                </div>
              ) : (
                <ul className={`max-h-[360px] overflow-y-auto divide-y ${isDark ? 'divide-[#2a2d3a]' : 'divide-gray-50'}`}>
                  {notifications.map((n) => (
                    <li key={n.id} className={`px-5 py-3.5 transition-colors flex items-start gap-3 ${!n.read ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50/30') : ''} ${isDark ? 'hover:bg-[#2a2d3a]' : 'hover:bg-[#f8f9fc]'}`}>
                      <span className="text-[18px] mt-0.5 flex-shrink-0">{n.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className={`text-[13px] font-semibold break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>{n.message}</div>
                        <div className={`text-[11px] font-medium mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatTime(n.timestamp)}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className={`h-8 w-px ${isDark ? 'bg-[#2a2d3a]' : 'bg-gray-200'}`}></div>

        {/* Profile + Theme Toggle Dropdown */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <div className={`text-[13px] font-black group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Brokai Admin</div>
              <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Dispatch Supervisor</div>
            </div>
            <div className="w-[38px] h-[38px] rounded-lg overflow-hidden bg-blue-100 border border-gray-100 shadow-sm relative">
              <img src="https://ui-avatars.com/api/?name=Brokai+Admin&background=10213d&color=fff&bold=true&font-size=0.33" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className={`absolute right-0 top-[52px] w-[220px] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border overflow-hidden z-50 ${isDark ? 'bg-[#22252f] border-[#2a2d3a]' : 'bg-white border-gray-100'}`}>
              <div className={`px-5 py-3.5 border-b ${isDark ? 'border-[#2a2d3a]' : 'border-gray-100'}`}>
                <div className={`text-[13px] font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Brokai Admin</div>
                <div className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>admin@brokailabs.com</div>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-full px-5 py-3.5 flex items-center gap-3 transition-colors text-left ${isDark ? 'hover:bg-[#2a2d3a]' : 'hover:bg-[#f8f9fc]'}`}
              >
                {isDark ? (
                  <svg className="w-[18px] h-[18px] text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-[18px] h-[18px] text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
                <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

