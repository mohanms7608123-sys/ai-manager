'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Calendar, 
  CloudSun,
  AlertTriangle,
  FileCheck,
  AlertCircle,
  Menu,
  Check,
  Trash2,
  Zap,
  X
} from 'lucide-react';
import { MOCK_PROJECTS, MOCK_MATERIALS, MOCK_WORKERS, MOCK_EQUIPMENT } from '@/lib/mockData';
import { dbStore, EnterpriseNotification } from '@/lib/dbStore';
import { socketHub } from '@/lib/socket';

export interface AIServiceResponse { category: string; title: string; desc: string; link: string; }

export default function Header({ 
  isCollapsed = false, 
  toggleSidebar 
}: { 
  isCollapsed?: boolean; 
  toggleSidebar?: () => void; 
}) {
  void isCollapsed;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AIServiceResponse[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<EnterpriseNotification[]>([]);
  const [toastNotif, setToastNotif] = useState<EnterpriseNotification | null>(null);

  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync notifications & subscribe to real-time socket events
  useEffect(() => {
    setNotifications([...dbStore.getNotifications()]);

    const unsub = socketHub.on('notification:new', (newNotif: EnterpriseNotification) => {
      setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)]);
      setToastNotif(newNotif);
      setTimeout(() => setToastNotif(null), 5000);
    });

    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      unsub();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global Search Engine
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    const results: AIServiceResponse[] = [];

    // Search Projects
    dbStore.getProjects().forEach(p => {
      if (p.name.toLowerCase().includes(query) || p.location.toLowerCase().includes(query) || p.status.toLowerCase().includes(query)) {
        results.push({ category: 'Project', title: p.name, desc: `Status: ${p.status} | Location: ${p.location}`, link: '/dashboard' });
      }
    });

    // Search Materials
    MOCK_MATERIALS.forEach(m => {
      if (m.name.toLowerCase().includes(query) || m.supplier.toLowerCase().includes(query)) {
        results.push({ category: 'Material', title: m.name, desc: `Stock: ${m.stock} ${m.unit} | Supplier: ${m.supplier}`, link: '/materials' });
      }
    });

    // Search Workers
    MOCK_WORKERS.forEach(w => {
      if (w.name.toLowerCase().includes(query) || w.role.toLowerCase().includes(query)) {
        results.push({ category: 'Worker', title: w.name, desc: `Role: ${w.role} | Productivity: ${w.productivity}%`, link: '/workers' });
      }
    });

    // Search Equipment
    MOCK_EQUIPMENT.forEach(e => {
      if (e.name.toLowerCase().includes(query) || e.type.toLowerCase().includes(query)) {
        results.push({ category: 'Equipment', title: e.name, desc: `Status: ${e.status} | Health: ${e.health}%`, link: '/equipment' });
      }
    });

    setSearchResults(results.slice(0, 6));
  }, [searchQuery]);

  const getUnreadCount = () => notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    notifications.forEach(n => dbStore.markNotificationRead(n.id));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkRead = (id: string) => {
    dbStore.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDeleteNotif = (id: string) => {
    dbStore.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workflow': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'chat': return <FileCheck className="w-4 h-4 text-cyan-400" />;
      case 'task': return <AlertCircle className="w-4 h-4 text-emerald-400" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-purple-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <header className="h-16 border-b border-white/5 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 w-full transition-all duration-300">
      {/* Sidebar Toggle and Global Search */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-white/70 hover:text-white bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all mr-1"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        
        <div ref={searchRef} className="relative w-80">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Global AI Search (projects, workflows, crew...)" 
            className="w-full bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchQuery.trim() && (
            <div className="absolute top-12 left-0 w-full glass-panel rounded-xl shadow-2xl overflow-hidden z-50 p-2 border-cyan-500/20">
              <p className="text-[10px] text-cyan-400 font-mono tracking-wider px-3.5 py-1.5 uppercase font-bold border-b border-white/5">
                Live Enterprise Search Results
              </p>
              {searchResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <a 
                      key={i} 
                      href={res.link}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="flex flex-col px-3.5 py-2.5 hover:bg-white/5 rounded-lg border-b border-white/5 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">{res.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono scale-90">{res.category}</span>
                      </div>
                      <span className="text-[10px] text-white/50 truncate mt-0.5">{res.desc}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-white/40">No matching enterprise records found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Items & Notifications */}
      <div className="flex items-center space-x-5">
        {/* Live Weather */}
        <div className="hidden md:flex items-center space-x-2 text-white/60 bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs">
          <CloudSun className="w-4 h-4 text-yellow-400" />
          <span className="font-medium">Noida Hub: 34°C (Sunny)</span>
        </div>

        {/* Real-time Toast Alert */}
        {toastNotif && (
          <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 text-amber-200 px-3.5 py-1.5 rounded-xl text-xs shadow-lg animate-bounce">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-xs">{toastNotif.title}: {toastNotif.message}</span>
            <button onClick={() => setToastNotif(null)} className="text-white/40 hover:text-white ml-1">✕</button>
          </div>
        )}

        {/* Notification Bell Center */}
        <div ref={notificationRef} className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-white/70 hover:text-white bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all relative"
            title="Notification Center"
          >
            <Bell className="w-4.5 h-4.5" />
            {getUnreadCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-slate-950 animate-bounce">
                {getUnreadCount()}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl overflow-hidden z-50 p-3 border border-white/10">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Socket.IO Notification Stream</span>
                </div>
                {getUnreadCount() > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between space-x-3 ${
                        !notif.isRead 
                          ? 'bg-amber-500/10 border-amber-500/30' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs truncate ${!notif.isRead ? 'font-bold text-white' : 'text-white/80'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[9px] font-mono text-white/35 shrink-0 ml-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed mt-1">{notif.message}</p>
                      </div>

                      <div className="flex flex-col space-y-1 shrink-0">
                        {!notif.isRead && (
                          <button 
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                            title="Mark as Read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteNotif(notif.id)}
                          className="p-1 text-rose-400 hover:bg-rose-500/20 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-white/40">No notifications in history.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date Indicator */}
        <div className="hidden sm:flex items-center space-x-2 text-white/60 bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs font-mono">
          <Calendar className="w-4.5 h-4.5 text-cyan-400" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </header>
  );
}
