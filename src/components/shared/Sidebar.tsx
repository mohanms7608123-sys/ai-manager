'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Box, 
  Layers, 
  Users, 
  Wrench, 
  CircleDollarSign, 
  ShieldAlert, 
  Camera, 
  FileText, 
  LineChart, 
  Building2, 
  Settings2,
  HardHat,
  LogOut,
  Video,
  Scan,
  UserCheck
} from 'lucide-react';

const MENU_ITEMS = [
  { href: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, color: 'text-cyan-400' },
  { href: '/3d-twin', label: '3D Digital Twin', icon: Box, color: 'text-blue-400' },
  { href: '/materials', label: 'Material Inventory', icon: Layers, color: 'text-teal-400' },
  { href: '/workers', label: 'Worker Roster', icon: Users, color: 'text-emerald-400' },
  { href: '/attendance', label: 'Attendance Module', icon: UserCheck, color: 'text-yellow-500' },
  { href: '/equipment', label: 'Equipment Telematics', icon: Wrench, color: 'text-purple-400' },
  { href: '/budget', label: 'Financial Budget', icon: CircleDollarSign, color: 'text-yellow-400' },
  { href: '/safety', label: 'Safety Compliance', icon: ShieldAlert, color: 'text-rose-400' },
  { href: '/drone-inspection', label: 'AI Drone Center', icon: Video, color: 'text-cyan-300' },
  { href: '/damage-inspection', label: 'AI Damage Scan', icon: Scan, color: 'text-rose-300' },
  { href: '/image-analysis', label: 'AI Image Scan', icon: Camera, color: 'text-pink-400' },
  { href: '/doc-analysis', label: 'AI Blueprint OCR', icon: FileText, color: 'text-cyan-300' },
  { href: '/analytics', label: 'Data Science & Reports', icon: LineChart, color: 'text-orange-400' },
  { href: '/client-portal', label: 'Client Portal', icon: Building2, color: 'text-violet-400' },
  { href: '/hire-engineers', label: 'Hire Engineers', icon: HardHat, color: 'text-amber-400' },
  { href: '/settings', label: 'System Settings', icon: Settings2, color: 'text-slate-400' }
];

const ROLE_MENUS: Record<string, string[]> = {
  Admin: [
    '/dashboard',
    '/workers',
    '/attendance',
    '/budget',
    '/analytics',
    '/settings'
  ],
  Contractor: [
    '/dashboard',
    '/3d-twin',
    '/materials',
    '/workers',
    '/attendance',
    '/equipment',
    '/budget',
    '/safety',
    '/drone-inspection',
    '/damage-inspection',
    '/analytics',
    '/settings'
  ],
  Engineer: [
    '/dashboard',
    '/equipment',
    '/attendance',
    '/doc-analysis',
    '/image-analysis',
    '/settings'
  ],
  Client: [
    '/dashboard',
    '/budget',
    '/drone-inspection',
    '/3d-twin',
    '/analytics',
    '/client-portal',
    '/settings'
  ]
};

export default function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail');
      const derived = email ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
      const name = localStorage.getItem('userName') || derived || 'Client User';
      const role = localStorage.getItem('userRole') || 'Client';
      const photo = localStorage.getItem('userPhoto') || '';
      return { name, role, photo };
    }
    return { name: 'Client User', role: 'Client', photo: '' };
  });

  // User initialization moved to useState functional initializer; no effect needed

  const allowedPaths = ROLE_MENUS[user.role] || ROLE_MENUS['Contractor'];
  const filteredMenuItems = MENU_ITEMS.filter(item => allowedPaths.includes(item.href));

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userAddress');
      localStorage.removeItem('userPhoto');
      localStorage.removeItem('isAuthed');
    }
  };

  return (
    <aside className={`border-r border-white/5 bg-slate-950/85 backdrop-blur-md flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Brand Header */}
      <div className={`p-4 border-b border-white/5 flex items-center space-x-3 bg-black/10 overflow-hidden ${
        isCollapsed ? 'justify-center' : ''
      }`}>
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-md shadow-cyan-500/25 shrink-0">
          <HardHat className="w-5 h-5 text-white animate-pulse" />
        </div>
        {!isCollapsed && (
          <div className="transition-all duration-300">
            <h1 className="text-xs font-bold text-white tracking-wide uppercase leading-tight">AI Construction</h1>
            <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">Smart Manager</span>
          </div>
        )}
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 scrollbar-thin">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-xl text-xs font-medium tracking-wide transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3.5 px-3 py-2.5'
              } ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 border border-cyan-500/25 text-white shadow-sm shadow-cyan-500/10' 
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? item.color : 'text-white/50'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-auto shadow-sm shadow-cyan-400"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Box */}
      <div className="p-3 border-t border-white/5 bg-black/20 flex flex-col space-y-3 overflow-hidden">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          {user.photo ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
              <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-cyan-500/20 shrink-0 font-mono">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider">{user.role}</p>
            </div>
          )}
        </div>
        
        <Link 
          onClick={handleLogout}
          href="/" 
          className={`flex items-center justify-center text-[10px] font-semibold text-white/55 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/25 rounded-xl py-2 transition-all ${
            isCollapsed ? 'px-0' : 'space-x-2'
          }`}
          title={isCollapsed ? 'Exit Console' : undefined}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Exit Console</span>}
        </Link>
      </div>
    </aside>
  );
}
