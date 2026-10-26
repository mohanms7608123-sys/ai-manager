'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building2, 
  PlusCircle, 
  Layers, 
  Activity, 
  HardHat, 
  Bell, 
  Bot, 
  Sparkles, 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Wrench, 
  Inbox, 
  FolderGit2, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Package, 
  Truck, 
  FolderKanban, 
  Building, 
  CheckSquare, 
  Calendar,
  X,
  ShieldCheck,
  ShieldAlert,
  Compass,
  Box,
  FileSearch
} from 'lucide-react';
import { performLogout, UserRole } from '@/lib/auth';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  badge?: string | number;
  category?: string;
}

interface DashboardSidebarProps {
  role: 'Admin' | 'Contractor' | 'Engineer' | 'Client' | 'Worker';
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  unreadNotifCount?: number;
  userEmail?: string;
  userName?: string;
  userCompany?: string;
  userPhotoUrl?: string;
}

export default function DashboardSidebar({
  role,
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  unreadNotifCount = 0,
  userEmail = '',
  userName = '',
  userCompany = '',
  userPhotoUrl = ''
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Categorized Navigation Item Configurations
  const getCategorizedNavItems = (): { category: string; items: NavItem[] }[] => {
    switch (role) {
      case 'Client':
        return [
          {
            category: 'MAIN',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Building2 },
              { id: 'create_project', label: 'Create New Project', icon: PlusCircle },
              { id: 'my_projects', label: 'My Projects', icon: Layers },
              { id: 'project_status', label: 'Project Status Pipeline', icon: Activity },
              { id: 'engineers', label: 'Approved Engineers', icon: HardHat }
            ]
          },
          {
            category: 'AI INTELLIGENCE',
            items: [
              { id: 'damage_inspection', label: 'AI Damage Detection', icon: ShieldAlert },
              { id: 'text_to_3d', label: 'AI Text to 3D Generator', icon: Sparkles },
              { id: 'drone_inspection', label: 'Drone Center', icon: Compass },
              { id: '3d_twin', label: '3D Digital Twin', icon: Box },
              { id: 'doc_analysis', label: 'Document Analysis', icon: FileSearch },
              { id: 'ai_assistant', label: 'AI Assistant', icon: Bot }
            ]
          },
          {
            category: 'MANAGEMENT',
            items: [
              { id: 'budget', label: 'Financial Budget', icon: DollarSign },
              { id: 'safety', label: 'Safety Center', icon: ShieldCheck },
              { id: 'materials', label: 'Materials', icon: Package },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
              { id: 'reports', label: 'Reports', icon: FileText }
            ]
          },
          {
            category: 'ACCOUNT',
            items: [
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings }
            ]
          }
        ];

      case 'Engineer':
        return [
          {
            category: 'MAIN',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Building2 },
              { id: 'client_requests', label: 'Client Requests', icon: Inbox },
              { id: 'assigned_projects', label: 'Assigned Projects', icon: FolderGit2 },
              { id: 'contractors', label: 'Approved Contractors', icon: Wrench }
            ]
          },
          {
            category: 'AI INTELLIGENCE',
            items: [
              { id: 'damage_inspection', label: 'AI Damage Detection', icon: ShieldAlert },
              { id: 'text_to_3d', label: 'AI Text to 3D Generator', icon: Sparkles },
              { id: 'drone_inspection', label: 'Drone Center', icon: Compass },
              { id: '3d_twin', label: '3D Digital Twin', icon: Box },
              { id: 'doc_analysis', label: 'Document Analysis', icon: FileSearch },
              { id: 'ai_assistant', label: 'AI Assistant', icon: Bot }
            ]
          },
          {
            category: 'MANAGEMENT',
            items: [
              { id: 'budget', label: 'Financial Budget', icon: DollarSign },
              { id: 'safety', label: 'Safety Center', icon: ShieldCheck },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
              { id: 'reports', label: 'Reports', icon: FileText }
            ]
          },
          {
            category: 'ACCOUNT',
            items: [
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings }
            ]
          }
        ];

      case 'Contractor':
        return [
          {
            category: 'MAIN',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Building2 },
              { id: 'projects', label: 'Assigned Projects', icon: FolderKanban },
              { id: 'workers', label: 'Worker Management', icon: Users },
              { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
              { id: 'salary', label: 'Salary & Wages', icon: DollarSign },
              { id: 'materials', label: 'Materials Inventory', icon: Package },
              { id: 'equipment', label: 'Heavy Equipment', icon: Truck }
            ]
          },
          {
            category: 'AI INTELLIGENCE',
            items: [
              { id: 'damage_inspection', label: 'AI Damage Detection', icon: ShieldAlert },
              { id: 'text_to_3d', label: 'AI Text to 3D Generator', icon: Sparkles },
              { id: 'drone_inspection', label: 'Drone Center', icon: Compass },
              { id: '3d_twin', label: '3D Digital Twin', icon: Box }
            ]
          },
          {
            category: 'ACCOUNT & REPORTS',
            items: [
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings }
            ]
          }
        ];

      case 'Admin':
        return [
          {
            category: 'MAIN',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Building2 },
              { id: 'clients', label: 'Clients', icon: Building },
              { id: 'engineers', label: 'Engineers', icon: HardHat },
              { id: 'contractors', label: 'Contractors', icon: Wrench },
              { id: 'workers', label: 'Workers', icon: Users },
              { id: 'projects', label: 'All Projects', icon: FolderGit2 }
            ]
          },
          {
            category: 'AI SYSTEM MODULES',
            items: [
              { id: 'damage_inspection', label: 'AI Damage Detection', icon: ShieldAlert },
              { id: 'text_to_3d', label: 'AI Text to 3D Generator', icon: Sparkles },
              { id: 'drone_inspection', label: 'Drone Center', icon: Compass },
              { id: '3d_twin', label: '3D Digital Twin', icon: Box },
              { id: 'doc_analysis', label: 'Document Analysis', icon: FileSearch },
              { id: 'reports', label: 'System Reports', icon: FileText }
            ]
          },
          {
            category: 'ACCOUNT',
            items: [
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings }
            ]
          }
        ];

      case 'Worker':
        return [
          {
            category: 'MAIN',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Building2 },
              { id: 'tasks', label: 'My Assigned Tasks', icon: CheckSquare },
              { id: 'attendance', label: 'Attendance History', icon: CalendarCheck },
              { id: 'salary', label: 'Salary Ledger', icon: DollarSign },
              { id: 'leave', label: 'Apply Leave', icon: Calendar }
            ]
          },
          {
            category: 'SAFETY & ACCOUNT',
            items: [
              { id: 'safety', label: 'Safety Protocols', icon: ShieldCheck },
              { id: 'profile', label: 'Profile', icon: User }
            ]
          }
        ];

      default:
        return [];
    }
  };

  // Dynamic local storage user resolution
  const [activeUserName, setActiveUserName] = useState<string>('');
  const [activeUserEmail, setActiveUserEmail] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('userName');
      const email = localStorage.getItem('userEmail');
      if (name) setActiveUserName(name);
      if (email) setActiveUserEmail(email);
    }
  }, [userName, userEmail]);

  const navCategories = getCategorizedNavItems();

  // User Details Resolution
  const resolvedEmail = userEmail || activeUserEmail;
  const derivedFromEmail = resolvedEmail ? resolvedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

  const displayName = userName || activeUserName || derivedFromEmail || (
    role === 'Client' ? 'Client User' :
    role === 'Engineer' ? (resolvedEmail.includes('priya') ? 'Priya Nair' : 'Rahul Sharma') :
    role === 'Contractor' ? 'Skyline Operations' :
    role === 'Worker' ? 'Arjun Das' : 'Super Admin'
  );

  const displayPhoto = userPhotoUrl || (
    role === 'Client' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' :
    role === 'Engineer' ? (resolvedEmail.includes('priya') ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80') :
    role === 'Contractor' ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' :
    role === 'Worker' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
  );

  // Role-aware base route resolver
  const getRoleBaseRoute = (): string => {
    switch (role) {
      case 'Admin': return '/admin/dashboard';
      case 'Client': return '/client/dashboard';
      case 'Engineer': return '/engineer/dashboard';
      case 'Contractor': return '/contractor/dashboard';
      case 'Worker': return '/worker/dashboard';
      default: return '/dashboard';
    }
  };

  // Role-aware sub-page route resolver
  const getNavRoute = (itemId: string): string => {
    if (role === 'Worker') {
      // Worker has dedicated sub-pages
      switch (itemId) {
        case 'dashboard':   return '/worker/dashboard';
        case 'tasks':       return '/worker/tasks';
        case 'attendance':  return '/worker/attendance';
        case 'salary':      return '/worker/salary';
        case 'leave':       return '/worker/leave';
        case 'safety':      return '/worker/safety';
        case 'profile':     return '/worker/profile';
        default:            return '/worker/dashboard';
      }
    }

    // Standalone management & AI tools pages for Client, Engineer, Contractor, Admin
    switch (itemId) {
      case 'budget':            return '/budget';
      case 'safety':            return '/safety';
      case 'materials':         return '/materials';
      case 'equipment':         return '/equipment';
      case 'attendance':        return '/attendance';
      case 'workers':           return '/workers';
      case '3d_twin':           return '/3d-twin';
      case 'drone_inspection':  return '/drone-inspection';
      case 'doc_analysis':      return '/doc-analysis';
      case 'damage_inspection': return '/damage-inspection';
      case 'text_to_3d':        return '/3d-twin';
      case 'settings':          return '/settings';
      default:                  return getRoleBaseRoute();
    }
  };

  // ROLE-AWARE NAV CLICK HANDLER - Smooth tab switching without page reload/blinking
  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.id);
    if (isMobileOpen) setIsMobileOpen(false);

    // If on a dashboard page, in-page state handles tab switching smoothly without router.push
    const isDashboard = pathname.includes('/dashboard');
    if (isDashboard) {
      if (typeof window !== 'undefined') {
        const newUrl = `${pathname}?tab=${item.id}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
      return;
    }

    // If on a standalone page (/budget, /safety, etc.), route back to the role dashboard with tab param
    const baseRoute = getRoleBaseRoute();
    const targetRoute = `${baseRoute}?tab=${item.id}`;
    if (pathname !== baseRoute || pathname.includes('?')) {
      router.push(targetRoute);
    }
  };

  const handleLogoutClick = () => {
    performLogout(role as UserRole);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 md:hidden transition-opacity"
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#080b14]/95 border-r border-white/10 text-slate-200 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 ease-in-out shadow-2xl ${
          isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-[80px]' : 'md:w-[280px]'
        }`}
      >
        {/* BRAND HEADER */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between relative">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#090d18] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="leading-tight truncate">
                <span className="text-sm font-extrabold text-white uppercase tracking-wider block font-sans">
                  Smart<span className="text-cyan-400">Build</span>
                </span>
                <span className="text-[10px] text-white/50 font-mono block uppercase">
                  {role} Portal
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MIDDLE CATEGORIZED NAVIGATION ITEMS */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
          {navCategories.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {/* Category Header Label */}
              {(!isCollapsed || isMobileOpen) && group.category && (
                <div className="px-3 pt-2 pb-1 text-[9px] font-extrabold font-mono text-cyan-400/80 tracking-widest uppercase border-t border-white/5 first:border-none">
                  {group.category}
                </div>
              )}

              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40 font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-cyan-400/80 group-hover:text-cyan-300'
                    }`} />

                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1 text-left tracking-wide">{item.label}</span>
                    )}

                    {item.badge !== undefined && (!isCollapsed || isMobileOpen) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500 text-white shadow-md">
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 border border-white/20 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 font-sans">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* BOTTOM USER PROFILE CARD */}
        <div className="p-3 border-t border-white/10 relative bg-[#06080f]/60">
          {/* PROFILE DROPDOWN MENU */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-900 border border-cyan-500/30 rounded-2xl p-2 shadow-2xl space-y-1 backdrop-blur-xl z-50 text-xs animate-in fade-in slide-in-from-bottom-2">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="font-bold text-white text-xs">{displayName}</p>
                <p className="text-[10px] text-white/50 truncate font-mono">{userEmail || 'authenticated.user'}</p>
              </div>

              <button
                onClick={() => { handleNavClick({ id: 'profile', label: 'Profile', icon: User }); setShowProfileMenu(false); }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => { handleNavClick({ id: 'settings', label: 'Settings', icon: Settings }); setShowProfileMenu(false); }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Settings className="w-4 h-4 text-yellow-400" />
                <span>Settings</span>
              </button>

              <div className="border-t border-white/10 pt-1 mt-1">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/20 font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* USER CARD CONTAINER */}
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center space-x-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all ${
              isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={displayPhoto} 
                  alt={displayName} 
                  className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40 shadow-md"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#080b14] rounded-full shadow-sm"></span>
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="leading-tight min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-white truncate">{displayName}</span>
                    <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                      {role}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-mono truncate flex items-center space-x-1 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Online</span>
                  </p>
                </div>
              )}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleLogoutClick(); }}
                title="Quick Logout"
                className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
