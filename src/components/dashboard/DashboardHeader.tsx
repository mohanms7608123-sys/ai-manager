'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

interface DashboardHeaderProps {
  role: 'Admin' | 'Contractor' | 'Engineer' | 'Client' | 'Worker';
  onMobileMenuToggle: () => void;
  onNotificationClick?: () => void;
  unreadNotifCount?: number;
  userName?: string;
  userPhotoUrl?: string;
  onSearchChange?: (term: string) => void;
}

export default function DashboardHeader({
  role,
  onMobileMenuToggle,
  onNotificationClick,
  unreadNotifCount = 0,
  userName = '',
  userPhotoUrl = '',
  onSearchChange
}: DashboardHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateString(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const [activeUserName, setActiveUserName] = useState<string>('');
  const [activeUserEmail, setActiveUserEmail] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('userName');
      const email = localStorage.getItem('userEmail');
      if (name) setActiveUserName(name);
      if (email) setActiveUserEmail(email);
    }
  }, [userName]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearchChange) onSearchChange(val);
  };

  const derivedFromEmail = activeUserEmail ? activeUserEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

  const displayName = userName || activeUserName || derivedFromEmail || (
    role === 'Client' ? 'Client User' :
    role === 'Engineer' ? 'Rahul Sharma' :
    role === 'Contractor' ? 'Skyline Operations' :
    role === 'Worker' ? 'Arjun Das' : 'Super Admin'
  );

  return (
    <header className="sticky top-0 z-30 bg-[#070913]/80 border-b border-white/10 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-4 transition-all">
      {/* LEFT: Mobile Hamburger & Search Bar */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-white/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search projects, engineers, workers, reports..."
            className="w-full bg-slate-900/90 border border-white/10 focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
          />
          <span className="hidden sm:inline-block absolute inset-y-0 right-3 my-auto h-5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/40 leading-none">
            Ctrl + K
          </span>
        </div>
      </div>

      {/* RIGHT: Live Clock, Notifications, Profile Tag */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Live Date & Time Indicator */}
        <div className="hidden lg:flex items-center space-x-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl font-mono text-[11px]">
          <div className="flex items-center space-x-1.5 text-white/60">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{dateString}</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeString}</span>
          </div>
        </div>

        {/* Notification Bell Icon */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-cyan-400" />
          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-lg border border-slate-950">
              {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
            </span>
          )}
        </button>

        {/* User Quick Tag */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-900 border border-cyan-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white font-bold truncate max-w-[120px]">{displayName}</span>
          <span className="text-[10px] text-cyan-400 uppercase bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
            {role}
          </span>
        </div>
      </div>
    </header>
  );
}
