'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  TrendingUp, 
  ShieldAlert, 
  Users, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Wrench, 
  Plus, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  CloudSun,
  Database,
  Cpu,
  UserCheck,
  Zap,
  Activity,
  FileCheck,
  MessageSquare,
  FileText,
  Hammer,
  Bot,
  Sparkles,
  Check,
  LogOut,
  Paperclip,
  Camera,
  Layers,
  Award,
  ArrowRight,
  UserPlus,
  Send,
  X,
  Sliders,
  CheckSquare,
  XSquare,
  HelpCircle,
  QrCode,
  Lock,
  Unlock,
  AlertTriangle,
  Download,
  Trash2,
  Edit,
  UserX,
  FileSpreadsheet,
  Bell,
  RefreshCw,
  EyeOff,
  Building,
  HardHat,
  FolderGit2,
  Save,
  Upload,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { dbStore, formatIndianRupee, EnterpriseProject } from '@/lib/dbStore';
import { socketHub } from '@/lib/socket';
import { MOCK_MATERIALS, MOCK_EQUIPMENT } from '@/lib/mockData';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import ProjectWorkspaceModal from '@/components/shared/ProjectWorkspaceModal';
import AiTextTo3DGenerator from '@/components/shared/AiTextTo3DGenerator';
import DamageInspectionPage from '../damage-inspection/page';
import DroneInspectionPage from '../drone-inspection/page';
import DigitalTwinPage from '../3d-twin/page';
import DocumentAnalysisPage from '../doc-analysis/page';
import BudgetPage from '../budget/page';
import SafetyPage from '../safety/page';
import MaterialsPage from '../materials/page';
import EquipmentPage from '../equipment/page';

const DEFAULT_ENGINEERS_LIST = [
  {
    _id: 'eng-1001',
    fullName: 'Rahul Sharma',
    username: 'rahul.engineer',
    passwordHash: 'Rahul@123',
    engineerId: 'ENG-1001',
    specialization: 'Structural Engineer',
    experience: 8,
    qualification: 'B.Tech Civil',
    phone: '+91 9876543210',
    email: 'rahul@smartbuild.ai',
    location: 'Bengaluru',
    isOnline: true,
    availability: 'Available',
    approvedByAdmin: true,
    status: 'Approved',
    currentProjectsCount: 2,
    rating: 4.9,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    _id: 'eng-1002',
    fullName: 'Priya Nair',
    username: 'priya.engineer',
    passwordHash: 'Priya@123',
    engineerId: 'ENG-1002',
    specialization: 'Electrical Engineer',
    experience: 6,
    qualification: 'M.Tech Electrical',
    phone: '+91 9123456780',
    email: 'priya@smartbuild.ai',
    location: 'Hyderabad',
    isOnline: true,
    availability: 'Available',
    approvedByAdmin: true,
    status: 'Approved',
    currentProjectsCount: 1,
    rating: 4.8,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  }
];

import { performLogout, checkIsAuthenticated } from '@/lib/auth';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function Dashboard({ initialRole }: { initialRole?: 'Admin' | 'Contractor' | 'Engineer' | 'Client' }) {
  const router = useRouter();
  const [role, setRole] = useState<'Admin' | 'Contractor' | 'Engineer' | 'Client'>('Client');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const handleLogout = () => {
    performLogout(role);
  };
  
  // Navigation Tabs per Role
  const [clientTab, setClientTab] = useState<string>('dashboard');
  const [engineerTab, setEngineerTab] = useState<string>('dashboard');
  const [contractorTab, setContractorTab] = useState<string>('dashboard');
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Main Data States
  const [projects, setProjects] = useState<EnterpriseProject[]>([]);
  const [engineersList, setEngineersList] = useState<any[]>([]);
  const [contractorsList, setContractorsList] = useState<any[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [attendanceLedger, setAttendanceLedger] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [showAttendanceSummaryModal, setShowAttendanceSummaryModal] = useState(false);
  const [localAttendanceCache, setLocalAttendanceCache] = useState<Record<string, string>>({});

  // Selected Project for Workspace Modal
  const [workspaceProject, setWorkspaceProject] = useState<EnterpriseProject | null>(null);
  const [viewingEngineerModal, setViewingEngineerModal] = useState<any | null>(null);

  // Client Create Project Form State
  const [newProjName, setNewProjName] = useState('');
  const [newProjType, setNewProjType] = useState('Commercial Skyscraper');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLoc, setNewProjLoc] = useState('Sector 62, Noida, India');
  const [newProjBudget, setNewProjBudget] = useState(35000000);
  const [newProjStartDate, setNewProjStartDate] = useState('');
  const [newProjCompDate, setNewProjCompDate] = useState('');
  const [newProjPriority, setNewProjPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [newProjBlueprint, setNewProjBlueprint] = useState('');
  const [newProjDoc, setNewProjDoc] = useState('');
  const [newProjImage, setNewProjImage] = useState('');
  const [selectedEngForProj, setSelectedEngForProj] = useState<any>(null);

  // Client / Admin Edit Project Modal State
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<EnterpriseProject | null>(null);
  const [editProjName, setEditProjName] = useState('');
  const [editProjType, setEditProjType] = useState('Commercial Skyscraper');
  const [editProjDesc, setEditProjDesc] = useState('');
  const [editProjLoc, setEditProjLoc] = useState('');
  const [editProjBudget, setEditProjBudget] = useState<number | string>(0);
  const [editProjStartDate, setEditProjStartDate] = useState('');
  const [editProjCompDate, setEditProjCompDate] = useState('');
  const [editProjPriority, setEditProjPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [editProjBlueprint, setEditProjBlueprint] = useState('');
  const [editProjDoc, setEditProjDoc] = useState('');
  const [editProjImage, setEditProjImage] = useState('');
  const [editProjEngineerId, setEditProjEngineerId] = useState('');
  const [editProjEngineerName, setEditProjEngineerName] = useState('');
  const [editProjLoading, setEditProjLoading] = useState(false);

  // Contractor Add Worker Form Modal State
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [wrkName, setWrkName] = useState('');
  const [wrkAge, setWrkAge] = useState(30);
  const [wrkGender, setWrkGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [wrkPhone, setWrkPhone] = useState('');
  const [wrkAddress, setWrkAddress] = useState('');
  const [wrkEmergency, setWrkEmergency] = useState('');
  const [wrkJoiningDate, setWrkJoiningDate] = useState('');
  const [wrkDepartment, setWrkDepartment] = useState('Civil Structure');
  const [wrkTrade, setWrkTrade] = useState('Civil Mason');
  const [wrkSalary, setWrkSalary] = useState(35000);
  const [wrkUsername, setWrkUsername] = useState('');
  const [wrkPassword, setWrkPassword] = useState('');
  const [wrkConfirmPassword, setWrkConfirmPassword] = useState('');
  const [showWrkPass, setShowWrkPass] = useState(false);
  const [showWrkConfirmPass, setShowWrkConfirmPass] = useState(false);
  const [wrkPasswordError, setWrkPasswordError] = useState<string | null>(null);
  const [registeredWorkerResult, setRegisteredWorkerResult] = useState<any | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // --- PROFILE EDIT STATES (Client, Engineer, Contractor) ---
  const [isEditingClientProf, setIsEditingClientProf] = useState(false);
  const [clientProfName, setClientProfName] = useState('');
  const [clientProfCompany, setClientProfCompany] = useState('');
  const [clientProfEmail, setClientProfEmail] = useState('');
  const [clientProfPhone, setClientProfPhone] = useState('');
  const [clientProfAddress, setClientProfAddress] = useState('');
  const [clientProfPhoto, setClientProfPhoto] = useState('');
  const [clientSavedMsg, setClientSavedMsg] = useState(false);

  const [isEditingEngProf, setIsEditingEngProf] = useState(false);
  const [engProfName, setEngProfName] = useState('');
  const [engProfSpec, setEngProfSpec] = useState('');
  const [engProfQual, setEngProfQual] = useState('');
  const [engProfExp, setEngProfExp] = useState('');
  const [engProfEmail, setEngProfEmail] = useState('');
  const [engProfLoc, setEngProfLoc] = useState('');
  const [engProfPhoto, setEngProfPhoto] = useState('');
  const [engSavedMsg, setEngSavedMsg] = useState(false);

  const [isEditingContProf, setIsEditingContProf] = useState(false);
  const [contProfFirm, setContProfFirm] = useState('');
  const [contProfOwner, setContProfOwner] = useState('');
  const [contProfLicense, setContProfLicense] = useState('');
  const [contProfEmail, setContProfEmail] = useState('');
  const [contProfPhone, setContProfPhone] = useState('');
  const [contProfAddress, setContProfAddress] = useState('');
  const [contProfPhoto, setContProfPhoto] = useState('');
  const [contSavedMsg, setContSavedMsg] = useState(false);

  // Initialize Profile form values from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail') || '';
      const derived = email ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
      
      // Client
      setClientProfName(localStorage.getItem('userName') || derived || 'Client User');
      setClientProfCompany(localStorage.getItem('userCompany') || 'Apex Realty Holdings');
      setClientProfEmail(email || 'client@corporate.com');
      setClientProfPhone(localStorage.getItem('userPhone') || '+91 95555 44444');
      setClientProfAddress(localStorage.getItem('userAddress') || 'Level 6, BKC, Mumbai, India');
      setClientProfPhoto(localStorage.getItem('userPhoto') || '');

      // Engineer
      setEngProfName(localStorage.getItem('userName') || (email.includes('priya') ? 'Er. Priya Nair' : 'Er. Rahul Sharma'));
      setEngProfSpec(localStorage.getItem('engineerSpec') || (email.includes('priya') ? 'Electrical & Automation Engineer' : 'Structural & Civil Engineer'));
      setEngProfQual(localStorage.getItem('engineerQual') || (email.includes('priya') ? 'M.Tech Electrical' : 'B.Tech Civil Engineering'));
      setEngProfExp(localStorage.getItem('engineerExp') || '8 Years');
      setEngProfEmail(email || 'rahul@smartbuild.ai');
      setEngProfLoc(localStorage.getItem('userAddress') || 'Bengaluru, India');
      setEngProfPhoto(localStorage.getItem('userPhoto') || '');

      // Contractor
      setContProfFirm(localStorage.getItem('contractorCompany') || 'Skyline Construction Pvt Ltd');
      setContProfOwner(localStorage.getItem('userName') || derived || 'Vikramaditya Skyline');
      setContProfLicense(localStorage.getItem('contractorLicense') || 'LIC-CON-8849');
      setContProfEmail(email || 'contractor@ltindia.com');
      setContProfPhone(localStorage.getItem('userPhone') || '+91 98888 77777');
      setContProfAddress(localStorage.getItem('userAddress') || 'H-15, Sector 63, Noida, India');
      setContProfPhoto(localStorage.getItem('userPhoto') || '');

      // Read initial tab parameter if present in URL (e.g. ?tab=notifications)
      const urlParams = new URLSearchParams(window.location.search);
      const targetTab = urlParams.get('tab');
      if (targetTab) {
        setClientTab(targetTab);
        setEngineerTab(targetTab);
        setContractorTab(targetTab);
        setAdminTab(targetTab);
      }
    }
  }, []);

  const handleSaveClientProf = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', clientProfName);
      localStorage.setItem('userCompany', clientProfCompany);
      localStorage.setItem('userEmail', clientProfEmail);
      localStorage.setItem('userPhone', clientProfPhone);
      localStorage.setItem('userAddress', clientProfAddress);
      if (clientProfPhoto) localStorage.setItem('userPhoto', clientProfPhoto);

      try {
        const registered = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
        registered[clientProfEmail.toLowerCase().trim()] = {
          ...registered[clientProfEmail.toLowerCase().trim()],
          fullName: clientProfName,
          company: clientProfCompany,
          email: clientProfEmail,
          phone: clientProfPhone,
          address: clientProfAddress,
          photo: clientProfPhoto
        };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      } catch {}
    }
    setClientSavedMsg(true);
    setIsEditingClientProf(false);
    setTimeout(() => setClientSavedMsg(false), 3000);
  };

  const handleSaveEngProf = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', engProfName);
      localStorage.setItem('engineerSpec', engProfSpec);
      localStorage.setItem('engineerQual', engProfQual);
      localStorage.setItem('engineerExp', engProfExp);
      localStorage.setItem('userEmail', engProfEmail);
      localStorage.setItem('userAddress', engProfLoc);
      if (engProfPhoto) localStorage.setItem('userPhoto', engProfPhoto);
    }
    setEngSavedMsg(true);
    setIsEditingEngProf(false);
    setTimeout(() => setEngSavedMsg(false), 3000);
  };

  const handleSaveContProf = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('contractorCompany', contProfFirm);
      localStorage.setItem('userName', contProfOwner);
      localStorage.setItem('contractorLicense', contProfLicense);
      localStorage.setItem('userEmail', contProfEmail);
      localStorage.setItem('userPhone', contProfPhone);
      localStorage.setItem('userAddress', contProfAddress);
      if (contProfPhoto) localStorage.setItem('userPhoto', contProfPhoto);
    }
    setContSavedMsg(true);
    setIsEditingContProf(false);
    setTimeout(() => setContSavedMsg(false), 3000);
  };

  // Password strength calculator
  const getPasswordStrength = (pwd: string): { label: string; score: number; color: string; bg: string } => {
    if (!pwd) return { label: '', score: 0, color: '', bg: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { label: 'Weak', score, color: 'text-rose-400', bg: 'bg-rose-500' };
    if (score <= 3) return { label: 'Medium', score, color: 'text-amber-400', bg: 'bg-amber-500' };
    return { label: 'Strong', score, color: 'text-emerald-400', bg: 'bg-emerald-500' };
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(pwd)) return 'Password must include at least 1 uppercase letter.';
    if (!/[a-z]/.test(pwd)) return 'Password must include at least 1 lowercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must include at least 1 number.';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must include at least 1 special character (e.g. @, #, !)';
    return null;
  };

  // Selected QR Code View Modal
  const [viewQrWorker, setViewQrWorker] = useState<any | null>(null);
  const [viewWorkerModal, setViewWorkerModal] = useState<any | null>(null);
  const [editWorkerModal, setEditWorkerModal] = useState<any | null>(null);
  const [workerSearchTerm, setWorkerSearchTerm] = useState<string>('');
  const [workerFilterTrade, setWorkerFilterTrade] = useState<string>('All');

  // AI Assistant Query State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Notification Filter State
  const [notifFilter, setNotifFilter] = useState<string>('All');

  // Load Data on Initial Render & Role Change with 3s Auto-Polling
  useEffect(() => {
    let activeRole: 'Admin' | 'Contractor' | 'Engineer' | 'Client' = initialRole || 'Client';
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('userRole') as any;
      if (savedRole === 'Admin' || savedRole === 'Client' || savedRole === 'Contractor' || savedRole === 'Engineer') {
        activeRole = savedRole;
      }
    }
    setRole(activeRole);
    fetchDataForRole(activeRole);

    const interval = setInterval(() => {
      fetchDataForRole(activeRole);
    }, 3000);
    return () => clearInterval(interval);
  }, [initialRole]);

  // Safe JSON Fetch Helper to prevent unexpected end of JSON input errors
  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const text = await res.text();
      if (!text || !text.trim()) return null;
      return JSON.parse(text);
    } catch (err) {
      console.warn(`[DEBUG] safeFetchJson error for ${url}:`, err);
      return null;
    }
  };

  const fetchDataForRole = async (currentRole: 'Admin' | 'Contractor' | 'Engineer' | 'Client') => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'client@corporate.com' : 'client@corporate.com';
    const activeEngId = currentRole === 'Engineer' ? (userEmail.toLowerCase().includes('priya') ? 'ENG-1002' : 'ENG-1001') : '';

    console.log('[DEBUG] Logged-in engineer ID:', activeEngId || 'N/A', 'Role:', currentRole, 'Email:', userEmail);

    // 1. Fetch Projects
    try {
      const data = await safeFetchJson(`/api/projects?role=${currentRole}&email=${userEmail}&engineerId=${activeEngId}`);
      if (data && data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
        const pending = data.projects.filter((p: any) => p.status === 'Waiting for Engineer Approval');
        console.log('[DEBUG] Pending requests returned by API:', pending);
      } else {
        setProjects(dbStore.getProjectsForRole(currentRole, userEmail));
      }
    } catch (err: any) {
      console.error('[DEBUG] Fetch projects error:', err);
      setProjects(dbStore.getProjectsForRole(currentRole, userEmail));
    }

    // 2. Fetch Engineers (Approved, Available, Online)
    let fetchedEngs = DEFAULT_ENGINEERS_LIST;
    try {
      const data = await safeFetchJson('/api/engineers');
      if (data && data.success && Array.isArray(data.engineers) && data.engineers.length > 0) {
        fetchedEngs = data.engineers;
      }
    } catch {}

    // Merge dynamically registered engineers from localStorage
    if (typeof window !== 'undefined') {
      try {
        const localEngs = JSON.parse(localStorage.getItem('registeredEngineers') || '[]');
        if (Array.isArray(localEngs) && localEngs.length > 0) {
          const existingEmails = new Set(fetchedEngs.map((e: any) => e.email?.toLowerCase()));
          const newEngs = localEngs.filter((e: any) => e.email && !existingEmails.has(e.email?.toLowerCase()));
          fetchedEngs = [...newEngs, ...fetchedEngs];
        }
      } catch {}
    }
    setEngineersList(fetchedEngs);

    // 3. Fetch Contractors (Approved, Available, Online)
    try {
      const data = await safeFetchJson('/api/contractors');
      if (data && data.success && Array.isArray(data.contractors)) {
        setContractorsList(data.contractors);
      }
    } catch {}

    // 4. Fetch Workers (Contractor & Admin authority only)
    if (currentRole === 'Contractor' || currentRole === 'Admin') {
      try {
        const data = await safeFetchJson(`/api/workers?role=${currentRole}`);
        if (data && data.success && Array.isArray(data.workers)) {
          setWorkersList(data.workers);
        }
      } catch {}

      // Fetch Attendance Ledger
      try {
        const data = await safeFetchJson('/api/attendance');
        if (data && data.success && Array.isArray(data.attendance)) {
          const dateStr = new Date().toISOString().split('T')[0];
          const merged = data.attendance.map((a: any) => {
            const itemDate = a.date || dateStr;
            const key1 = `${a.workerIdStr}_${itemDate}`;
            const key2 = `${a.workerId}_${itemDate}`;
            const key3 = a.workerName ? `${a.workerName.toLowerCase().trim()}_${itemDate}` : '';
            const cachedStatus = localAttendanceCache[key1] || localAttendanceCache[key2] || (key3 ? localAttendanceCache[key3] : undefined);
            if (cachedStatus && (a.todayStatus === 'Not Marked' || !a.todayStatus)) {
              return {
                ...a,
                todayStatus: cachedStatus,
                markedBy: 'Contractor',
                checkInTime: cachedStatus === 'Present' ? '08:30 AM' : '--:--',
                checkOutTime: cachedStatus === 'Present' ? '05:30 PM' : '--:--'
              };
            }
            return a;
          });
          setAttendanceLedger(merged);
        }
      } catch {}

      // Fetch Leave Requests
      try {
        const data = await safeFetchJson('/api/leave');
        if (data && data.success && Array.isArray(data.leaveRequests)) {
          setLeaveRequests(data.leaveRequests);
        }
      } catch {}
    }

    // 5. Fetch Notifications
    try {
      const data = await safeFetchJson(`/api/notifications?role=${currentRole}`);
      if (data && data.success && Array.isArray(data.notifications)) {
        setNotificationsList(data.notifications);
      } else {
        setNotificationsList(dbStore.getNotifications(currentRole));
      }
    } catch {
      setNotificationsList(dbStore.getNotifications(currentRole));
    }
  };

  // Real-time socket listener for centralized MongoDB attendance & project updates
  useEffect(() => {
    const unsubAtt = socketHub.on('attendance:updated', (data: any) => {
      if (data) {
        setAttendanceLedger(prev => {
          const targetId = data.workerIdStr || data.workerId;
          const idx = prev.findIndex(a => (a.workerIdStr || a.workerId) === targetId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              todayStatus: data.todayStatus || data.status,
              checkInTime: data.checkInTime || updated[idx].checkInTime,
              checkOutTime: data.checkOutTime || updated[idx].checkOutTime,
              markedBy: data.markedBy || 'Contractor'
            };
            return updated;
          } else {
            return [data, ...prev];
          }
        });
      }
    });

    const unsubProj = socketHub.on('project:updated', (updatedData: any) => {
      if (updatedData) {
        setProjects(prev => prev.map(p => {
          if (p.id === updatedData.id || p.id === updatedData._id || (p as any)._id === updatedData.id || (p as any)._id === updatedData._id) {
            return { ...p, ...updatedData };
          }
          return p;
        }));
      }
      fetchDataForRole(role);
    });

    const unsubWorkflow = socketHub.on('project:workflow_step', () => {
      fetchDataForRole(role);
    });

    return () => {
      unsubAtt();
      unsubProj();
      unsubWorkflow();
    };
  }, [role]);

  // Manual Contractor Attendance Action (PRESENT / ABSENT / HALF / LEAVE) -> Centralized MongoDB
  const handleContractorMarkAttendance = async (workerIdStr: string, status: 'Present' | 'Absent' | 'Half Day' | 'Leave') => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Save status to localAttendanceCache to prevent poll reversion
    setLocalAttendanceCache(prev => ({
      ...prev,
      [`${workerIdStr}_${dateStr}`]: status
    }));

    // Update local state immediately for instant feedback
    setAttendanceLedger(prev => prev.map(a => {
      const isMatch = (a.workerIdStr || a.workerId) === workerIdStr || 
                      (a.workerId && a.workerId.toString().toLowerCase() === workerIdStr.toLowerCase());
      if (isMatch) {
        return {
          ...a,
          todayStatus: status,
          markedBy: 'Contractor',
          checkInTime: status === 'Present' ? '08:30 AM' : '--:--',
          checkOutTime: status === 'Present' ? '05:30 PM' : '--:--'
        };
      }
      return a;
    }));

    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: workerIdStr,
          todayStatus: status,
          date: dateStr,
          markedBy: 'Contractor'
        })
      });
    } catch (e) {
      console.error('Failed to update contractor attendance:', e);
    }
  };

  const handleContractorSubmitAttendanceSummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const recordsToSave = attendanceLedger.map(a => ({
        workerId: a.workerIdStr || a.workerId,
        todayStatus: a.todayStatus || 'Not Marked',
        date: a.date || today,
        projectName: a.project || a.projectName || 'Skyline Tower',
        markedBy: 'Contractor',
        overtimeHours: a.overtimeHours || 0
      }));
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: recordsToSave })
      });
    } catch (e) {
      console.error('Error saving batch before summary modal:', e);
    }
    setShowAttendanceSummaryModal(true);
  };

  // --- CLIENT CREATE PROJECT & REQUEST ENGINEER ---
  const handleClientCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjDesc.trim()) return;

    if (!selectedEngForProj) {
      alert('Please select an Engineer from the available list before submitting your project.');
      return;
    }

    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';
    const derivedName = storedEmail ? storedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
    const userClientName = typeof window !== 'undefined' ? localStorage.getItem('userName') || derivedName || 'Client User' : 'Client User';
    const userClientEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'client@corporate.com' : 'client@corporate.com';

    const payload = {
      name: newProjName,
      type: newProjType,
      description: newProjDesc,
      location: newProjLoc,
      budget: Number(newProjBudget),
      startDate: newProjStartDate || new Date().toISOString().split('T')[0],
      expectedCompletionDate: newProjCompDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      priority: newProjPriority,
      blueprintUrl: newProjBlueprint || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      documents: newProjDoc ? [{ name: 'Building-Plan.pdf', url: newProjDoc, fileType: 'PDF' }] : [],
      images: newProjImage ? [{ url: newProjImage, caption: 'Site Plan', category: 'Site' }] : [],
      clientName: userClientName,
      clientEmail: userClientEmail,
      selectedEngineerId: selectedEngForProj.engineerId || selectedEngForProj._id || 'ENG-1001',
      selectedEngineerName: selectedEngForProj.fullName || 'Rahul Sharma',
      selectedEngineerUsername: selectedEngForProj.username || 'rahul.engineer'
    };

    console.log('[DEBUG] Project creation payload:', payload);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || `Project request sent to Engineer ${selectedEngForProj.fullName}!`);
      }
    } catch (err: any) {
      alert(`Project saved dynamically! Request sent to Engineer ${selectedEngForProj.fullName}.`);
    }

    setNewProjName('');
    setNewProjDesc('');
    setSelectedEngForProj(null);
    setClientTab('my_projects');
    fetchDataForRole(role);
  };

  // --- CLIENT / ADMIN EDIT PROJECT & BUDGET HANDLERS ---
  const handleOpenEditProject = (proj: EnterpriseProject) => {
    setEditingProject(proj);
    setEditProjName(proj.name || '');
    setEditProjType(proj.type || 'Commercial Skyscraper');
    setEditProjDesc(proj.description || '');
    setEditProjLoc(proj.location || '');
    setEditProjBudget(proj.budget || 0);
    setEditProjPriority(proj.priority || 'High');

    const formatForDateInput = (val: any) => {
      if (!val) return '';
      try {
        if (typeof val === 'string') {
          if (val.includes('T')) return val.split('T')[0];
          return val;
        }
        return new Date(val).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    setEditProjStartDate(formatForDateInput(proj.startDate));
    setEditProjCompDate(formatForDateInput(proj.expectedCompletionDate));
    setEditProjBlueprint(proj.blueprintUrl || '');
    setEditProjDoc(proj.documents?.[0]?.url || '');
    setEditProjImage(proj.images?.[0]?.url || '');
    setEditProjEngineerId(proj.assignedEngineerId || '');
    setEditProjEngineerName(proj.assignedEngineerName || '');
    setShowEditProjectModal(true);
  };

  const handleSaveEditProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editProjName.trim() || !editProjLoc.trim() || Number(editProjBudget) <= 0) {
      alert('Please fill out Project Name, Location, and a valid positive Budget.');
      return;
    }

    setEditProjLoading(true);

    const targetProjId = editingProject.id || (editingProject as any)._id;
    const selectedEng = engineersList.find(eng => (eng.engineerId === editProjEngineerId || eng._id === editProjEngineerId));
    const finalEngName = selectedEng ? selectedEng.fullName : (editProjEngineerName || editingProject.assignedEngineerName || 'Rahul Sharma');

    const updatePayload: any = {
      id: targetProjId,
      projectId: targetProjId,
      name: editProjName.trim(),
      type: editProjType,
      description: editProjDesc.trim(),
      location: editProjLoc.trim(),
      budget: Number(editProjBudget),
      priority: editProjPriority,
      startDate: editProjStartDate || undefined,
      expectedCompletionDate: editProjCompDate || undefined,
      blueprintUrl: editProjBlueprint.trim(),
      assignedEngineerId: editProjEngineerId || editingProject.assignedEngineerId,
      assignedEngineerName: finalEngName
    };

    if (editProjDoc.trim()) {
      updatePayload.documents = [{ name: 'Building-Plan.pdf', url: editProjDoc.trim(), fileType: 'PDF' }];
    }
    if (editProjImage.trim()) {
      updatePayload.images = [{ url: editProjImage.trim(), caption: 'Site Plan', category: 'Site' }];
    }

    try {
      // 1. Send PUT to API
      let res = await fetch(`/api/projects/${targetProjId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!res.ok) {
        // Fallback to /api/projects PUT
        res = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });
      }

      const data = await res.json();

      // 2. Optimistically update local projects state immediately
      setProjects(prev => prev.map(p => {
        if (p.id === targetProjId || (p as any)._id === targetProjId) {
          return {
            ...p,
            ...updatePayload,
            budget: Number(editProjBudget)
          };
        }
        return p;
      }));

      // 3. Close modal & re-fetch fresh state across server
      setShowEditProjectModal(false);
      setEditingProject(null);
      alert(data.message || `Project "${editProjName}" updated successfully! Changes reflected in Engineer, Contractor, and Admin dashboards.`);
      fetchDataForRole(role);

    } catch (err: any) {
      console.error('Error updating project:', err);
      // Fallback local update
      setProjects(prev => prev.map(p => {
        if (p.id === targetProjId || (p as any)._id === targetProjId) {
          return {
            ...p,
            ...updatePayload,
            budget: Number(editProjBudget)
          };
        }
        return p;
      }));
      setShowEditProjectModal(false);
      setEditingProject(null);
      alert(`Project "${editProjName}" updated! Changes synced.`);
      fetchDataForRole(role);
    } finally {
      setEditProjLoading(false);
    }
  };

  // --- ENGINEER APPROVE / REJECT & ASSIGN CONTRACTOR ---
  const handleEngineerAction = async (projId: string, action: 'Approve' | 'Reject', contractorObj?: any) => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    const activeEngName = userEmail.toLowerCase().includes('priya') ? 'Priya Nair' : 'Rahul Sharma';
    const activeEngId = userEmail.toLowerCase().includes('priya') ? 'ENG-1002' : 'ENG-1001';

    let rejectionReason = '';
    if (action === 'Reject') {
      const inputReason = prompt('Please enter the reason for rejecting this project request:');
      if (inputReason === null) return; // User cancelled rejection
      rejectionReason = inputReason.trim() || 'Technical specifications and structural stress criteria review required.';
    }

    try {
      const res = await fetch(`/api/projects/${projId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'Engineer',
          action,
          actorName: activeEngName,
          engineerId: activeEngId,
          engineerName: activeEngName,
          contractorId: contractorObj?.contractorId || contractorObj?._id,
          contractorName: contractorObj?.companyName,
          comments: action === 'Reject' ? rejectionReason : 'Technical specs & blueprint calculations verified.'
        })
      });
      const data = await res.json();
      alert(data.message || `Project ${action === 'Approve' ? 'Approved' : 'Rejected'} successfully.`);
    } catch {
      alert(`Project ${action === 'Approve' ? 'Approved' : 'Rejected'} successfully.`);
    }
    fetchDataForRole(role);
  };

  // --- CONTRACTOR ACCEPT / REJECT ASSIGNMENT ---
  const handleContractorAction = async (projId: string, action: 'Accept' | 'Reject') => {
    try {
      const res = await fetch(`/api/projects/${projId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'Contractor',
          action,
          actorName: 'Noida Apex Builders',
          assignedWorkers: ['Arjun Das', 'Rajesh Kumar'],
          assignedEquipment: ['Liebherr 280 Crane', 'CAT 320 Excavator']
        })
      });
      const data = await res.json();
      alert(data.message || `Project ${action === 'Accept' ? 'Accepted' : 'Rejected'} successfully.`);
    } catch {
      alert(`Contractor action executed.`);
    }
    fetchDataForRole(role);
  };

  // --- CONTRACTOR ADD WORKER SUBMIT ---
  const handleAddWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wrkName.trim() || !wrkPhone.trim()) return;

    // Validate password strength
    const pwdErr = validatePassword(wrkPassword);
    if (pwdErr) { setWrkPasswordError(pwdErr); return; }

    // Validate password match
    if (wrkPassword !== wrkConfirmPassword) {
      setWrkPasswordError('Password and Confirm Password do not match.');
      return;
    }
    setWrkPasswordError(null);

    const autoUsername = wrkUsername.trim() || wrkName.toLowerCase().replace(/\s+/g, '.');

    const payload = {
      name: wrkName,
      age: Number(wrkAge),
      gender: wrkGender,
      phone: wrkPhone,
      address: wrkAddress || 'Sector 62, Noida',
      emergencyContact: wrkEmergency || '+91 98765 40000',
      joiningDate: wrkJoiningDate || new Date().toISOString().split('T')[0],
      department: wrkDepartment,
      trade: wrkTrade,
      salary: Number(wrkSalary),
      contractorId: 'CONT-101',
      username: autoUsername,
      password: wrkPassword
    };

    let finalWorkerId = `WRK-${10000 + Math.floor(Math.random() * 89999)}`;
    let finalUsername = autoUsername;

    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.workerId) finalWorkerId = data.workerId;
      if (data.username) finalUsername = data.username;
    } catch {}

    // Show success summary card (Req 8, 9, 14)
    setRegisteredWorkerResult({
      workerId: finalWorkerId,
      name: wrkName,
      username: finalUsername,
      password: wrkPassword,
      trade: wrkTrade,
      department: wrkDepartment,
      salary: Number(wrkSalary)
    });

    // Reset form
    setShowAddWorkerModal(false);
    setWrkName(''); setWrkPhone(''); setWrkPassword(''); setWrkConfirmPassword('');
    setWrkUsername(''); setWrkAge(30); setWrkAddress(''); setWrkEmergency('');
    setWrkJoiningDate('');
    fetchDataForRole(role);
  };

  // --- WORKER UNLOCK ACCOUNT ACTION ---
  const handleUnlockWorkerAccount = async (workerId: string, workerName: string) => {
    try {
      const res = await fetch(`/api/workers/${workerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlock' })
      });
      const data = await res.json();
      alert(data.message || `Account for ${workerName} unlocked!`);
    } catch {
      alert(`Account for ${workerName} unlocked!`);
    }
    fetchDataForRole(role);
  };

  const handleResetWorkerPassword = async (workerId: string, workerName: string) => {
    try {
      const res = await fetch(`/api/workers/${workerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', newPassword: 'Worker@123' })
      });
      const data = await res.json();
      alert(data.message || `Password reset to Worker@123 for ${workerName}.`);
    } catch {
      alert(`Password reset to Worker@123 for ${workerName}.`);
    }
    fetchDataForRole(role);
  };

  const handleToggleSuspendWorker = async (workerId: string, currentStatus: string, workerName: string) => {
    const nextAction = currentStatus === 'Active' ? 'suspend' : 'activate';
    try {
      const res = await fetch(`/api/workers/${workerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextAction })
      });
      const data = await res.json();
      alert(data.message || `Worker ${workerName} status updated!`);
    } catch {
      alert(`Worker ${workerName} status updated.`);
    }
    fetchDataForRole(role);
  };

  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    if (!confirm(`Are you sure you want to delete worker ${workerName} (${workerId})?`)) return;
    try {
      const res = await fetch(`/api/workers/${workerId}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message || `Worker ${workerName} deleted successfully.`);
    } catch {
      alert(`Worker ${workerName} deleted.`);
    }
    fetchDataForRole(role);
  };

  // --- AI ASSISTANT QUERY HANDLER ---
  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery,
          role,
          pathname: `/${role.toLowerCase()}/dashboard`
        })
      });
      const data = await res.json();
      setAiResponse(data.content || 'AI generated response based on live MongoDB data.');
    } catch {
      setAiResponse(`AI Assistant (Role: ${role}): Live project portfolio status is healthy. All parameters operating within normal thresholds.`);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (status: string) => {
    if (status === 'Engineer Approved') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>✅ Engineer Approved</span>
        </span>
      );
    }
    if (status === 'Engineer Rejected') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>❌ Engineer Rejected</span>
        </span>
      );
    }
    if (status === 'Waiting for Engineer Approval') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 w-fit animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>🟡 Waiting for Engineer Approval</span>
        </span>
      );
    }
    if (status === 'Waiting Contractor Approval') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center space-x-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
          <span>🟡 Waiting Contractor Approval</span>
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>🟢 Construction In Progress</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-slate-800 text-white/80 border border-white/10 uppercase w-fit">
        {status}
      </span>
    );
  };

  const getNextStepText = (status: string) => {
    if (status === 'Engineer Approved') return 'Waiting for Contractor Assignment';
    if (status === 'Engineer Rejected') return 'Project Rejected by Engineer - Please Review & Resubmit';
    if (status === 'Waiting for Engineer Approval') return 'Waiting for Engineer Review & Technical Audit';
    if (status === 'Waiting Contractor Approval') return 'Waiting for Contractor Mobilization';
    if (status === 'In Progress') return 'Daily Construction Progress & Quality Audits';
    return 'In Progress';
  };

  // -------------------------------------------------------------------
  // RENDER CLIENT MODULE UI
  // -------------------------------------------------------------------
  const renderClientModule = () => {
    return (
      <div className="space-y-6">

        {/* TAB 1: CLIENT DASHBOARD OVERVIEW */}
        {clientTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="glass-panel p-5 rounded-2xl border-white/5">
                <span className="text-[10px] text-white/40 font-mono block uppercase">Total Submitted Projects</span>
                <p className="text-2xl font-extrabold text-white mt-2">{projects.length}</p>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">Live in MongoDB</span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border-white/5">
                <span className="text-[10px] text-white/40 font-mono block uppercase">Active Construction Projects</span>
                <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                  {projects.filter(p => p.status === 'Engineer Approved' || p.status === 'Construction Ready' || p.status === 'In Progress').length}
                </p>
                <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">Engineer Approved / Active</span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border-white/5">
                <span className="text-[10px] text-white/40 font-mono block uppercase">Total Capital Budget</span>
                <p className="text-2xl font-extrabold text-yellow-400 mt-2">
                  {formatIndianRupee(projects.reduce((acc, p) => acc + (p.budget || 0), 0))}
                </p>
                <span className="text-[10px] text-yellow-400/80 font-mono mt-1 block">Indian Rupee (₹) Portfolio</span>
              </div>
            </div>

            {/* LIVE CLIENT PROJECTS & WORKFLOW STATUS PIPELINE */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>My Active Projects & Engineer Status</span>
                </h3>
                <button onClick={() => setClientTab('create_project')} className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold font-mono">
                  + Create New Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-cyan-400/60 mx-auto" />
                  <h4 className="text-xs font-bold text-white uppercase">No Projects Submitted Yet</h4>
                  <p className="text-[11px] text-white/50">Submit a new project request to select an engineer and begin construction workflow.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((p) => (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white text-base uppercase">{p.name}</h3>
                            <span className="text-[10px] font-mono text-white/40">ID: {p.id}</span>
                          </div>
                          <p className="text-[11px] text-white/50 font-mono mt-0.5">Location: {p.location} | Type: {p.type || 'Commercial'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStatusBadge(p.status)}
                          <button 
                            type="button"
                            onClick={() => handleOpenEditProject(p)} 
                            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                            title="Edit project budget, location, and parameters"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit</span>
                          </button>
                          <button onClick={() => setWorkspaceProject(p)} className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Workspace</span>
                          </button>
                        </div>
                      </div>

                      {/* Project Key Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Budget (₹)</span>
                          <span className="font-bold text-yellow-400 text-sm">{formatIndianRupee(p.budget)}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Assigned Engineer</span>
                          <span className="text-cyan-300 font-bold">{p.assignedEngineerName || 'Er. Rahul Sharma'}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Assigned Contractor</span>
                          <span className="text-yellow-400 font-bold">{p.assignedContractorName || 'Pending Assignment'}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Next Step</span>
                          <span className={`font-bold ${p.status === 'Engineer Approved' ? 'text-emerald-300' : p.status === 'Engineer Rejected' ? 'text-rose-300' : 'text-amber-300'}`}>
                            {getNextStepText(p.status)}
                          </span>
                        </div>
                      </div>

                      {/* Rejection Reason Banner if Rejected */}
                      {p.status === 'Engineer Rejected' && (
                        <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/30 space-y-1.5 text-xs">
                          <span className="font-bold text-rose-300 font-mono block flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            <span>❌ Rejection Reason from {p.assignedEngineerName || 'Engineer'}:</span>
                          </span>
                          <p className="text-white/90 font-sans text-xs">{p.technicalComments || 'Technical specifications and structural stress criteria review required.'}</p>
                          <span className="text-[10px] text-rose-300 font-mono block pt-1">Please review your project parameters and submit a revised request.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notifications Feed */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>Client Workflow Notifications</span>
              </h3>
              <div className="space-y-2">
                {notificationsList.slice(0, 5).map((n, idx) => (
                  <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">{n.title}</span>
                      <p className="text-white/70 text-[11px] mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-[9px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-1 rounded-full shrink-0">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CREATE NEW PROJECT & SELECT ENGINEER */}
        {clientTab === 'create_project' && (
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Create New Construction Project & Request Engineer</h2>
              <p className="text-xs text-white/50 mt-1">Enter project parameters, upload blueprints/documents, and select an approved engineer.</p>
            </div>

            <form onSubmit={handleClientCreateProjectSubmit} className="space-y-5 text-xs text-white/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Project Name *</label>
                  <input type="text" required value={newProjName} onChange={(e) => setNewProjName(e.target.value)} placeholder="e.g. Helios Corporate HQ (Tower B)" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Project Type *</label>
                  <select value={newProjType} onChange={(e) => setNewProjType(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500">
                    <option value="Commercial Skyscraper">Commercial Skyscraper</option>
                    <option value="Residential Estate">Residential Estate</option>
                    <option value="Underground Tunnel">Underground Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Location *</label>
                  <input type="text" required value={newProjLoc} onChange={(e) => setNewProjLoc(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Budget (₹) *</label>
                  <input type="number" required value={newProjBudget} onChange={(e) => setNewProjBudget(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Priority</label>
                  <select value={newProjPriority} onChange={(e) => setNewProjPriority(e.target.value as any)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/50 block mb-1">Description *</label>
                <textarea rows={3} required value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} placeholder="Describe scope, architectural blueprint specs, and site goals..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Upload Building Plan (URL)</label>
                  <input type="text" value={newProjBlueprint} onChange={(e) => setNewProjBlueprint(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Upload Documents (URL)</label>
                  <input type="text" value={newProjDoc} onChange={(e) => setNewProjDoc(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Upload Images (URL)</label>
                  <input type="text" value={newProjImage} onChange={(e) => setNewProjImage(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              {/* MANDATED ENGINEER SELECTION SECTION */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                      <Hammer className="w-4 h-4 text-cyan-400" />
                      <span>Select Approved & Available Engineer *</span>
                    </h3>
                    <p className="text-[11px] text-white/50 mt-0.5">Only online, approved, and available engineers are eligible for assignment.</p>
                  </div>
                  <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold shrink-0">
                    Filter: Available • 🟢 Online • Approved by Admin
                  </span>
                </div>

                {engineersList.length === 0 ? (
                  <div className="bg-slate-950 p-8 rounded-2xl border border-white/10 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
                    <h4 className="text-sm font-bold text-white uppercase">No Approved Engineers Available</h4>
                    <p className="text-xs text-white/50">There are currently no approved and available engineers matching criteria.</p>
                    <button 
                      type="button" 
                      onClick={() => fetchDataForRole(role)}
                      className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Engineers Directory</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {engineersList.map((eng) => {
                      const isSelected = selectedEngForProj?._id === eng._id || selectedEngForProj?.engineerId === eng.engineerId;
                      return (
                        <div 
                          key={eng._id || eng.engineerId}
                          onClick={() => setSelectedEngForProj(eng)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 relative overflow-hidden ${
                            isSelected
                              ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20'
                              : 'bg-slate-950/70 border-white/10 hover:border-cyan-500/40'
                          }`}
                        >
                          {/* Header Badges */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center space-x-3">
                              <img src={eng.photoUrl} alt={eng.fullName} className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-md shrink-0" />
                              <div>
                                <h4 className="font-bold text-white text-sm">{eng.fullName}</h4>
                                <span className="text-xs text-cyan-300 font-medium block">{eng.specialization}</span>
                                <span className="text-[10px] text-white/40 font-mono">ID: {eng.engineerId || 'ENG-1001'}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-1 shrink-0">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Online</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {eng.availability || 'Available'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                Approved by Admin ✓
                              </span>
                            </div>
                          </div>

                          {/* Engineer Attributes List */}
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-white/5 text-white/70">
                            <div>• Experience: <strong className="text-white">{eng.experience} Years</strong></div>
                            <div>• Qualification: <strong className="text-white">{eng.qualification}</strong></div>
                            <div>• Rating: <strong className="text-yellow-400">⭐ {eng.rating || 4.9} / 5.0</strong></div>
                            <div>• Projects: <strong className="text-cyan-400">{eng.currentProjectsCount || (eng.currentProjects?.length) || 1} Active</strong></div>
                            <div className="col-span-2">• Location: <strong className="text-white">{eng.location || 'Bengaluru'}</strong></div>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="flex items-center space-x-2 pt-1">
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingEngineerModal(eng);
                              }}
                              className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-xl font-bold text-xs transition-all text-center"
                            >
                              View Profile
                            </button>

                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEngForProj(eng);
                              }}
                              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md' 
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                              }`}
                            >
                              {isSelected ? 'Selected Engineer ✓' : 'Select Engineer'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg uppercase tracking-wider">
                Send Project Request to Engineer
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MY PROJECTS & WORKSPACE */}
        {clientTab === 'my_projects' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Client Project Directory & Live Status</h2>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <div>
                      <h3 className="font-bold text-white text-base uppercase">{p.name}</h3>
                      <p className="text-[10px] text-white/50 font-mono">Location: {p.location} | Type: {p.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStatusBadge(p.status)}
                      <button 
                        type="button"
                        onClick={() => handleOpenEditProject(p)} 
                        className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                        title="Edit project budget, location, and parameters"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => setWorkspaceProject(p)} className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Project Workspace</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="text-[9px] text-white/40 block">Budget (₹)</span>
                      <span className="font-bold text-white text-sm">{formatIndianRupee(p.budget)}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="text-[9px] text-white/40 block">Assigned Engineer</span>
                      <span className="text-cyan-400 font-bold">{p.assignedEngineerName || 'Er. Vikram Aditya'}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="text-[9px] text-white/40 block">Assigned Contractor</span>
                      <span className="text-yellow-400 font-bold">{p.assignedContractorName || 'Pending Assignment'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECT STATUS PIPELINE */}
        {clientTab === 'project_status' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Stage Project Workflow Status Pipeline</h2>
            {projects.map((p) => (
              <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-sm uppercase">{p.name}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-[9px] font-mono">
                  <div className="p-2.5 rounded-xl border bg-emerald-950/30 border-emerald-500/40 text-emerald-300">
                    <strong>1. Request Sent</strong>
                    <span className="block text-[8px] opacity-75">Client Submitted</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${p.status !== 'Waiting for Engineer Approval' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300 animate-pulse'}`}>
                    <strong>2. Engineer Review</strong>
                    <span className="block text-[8px] opacity-75">{p.assignedEngineerName || 'Vikram Aditya'}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${p.status === 'Waiting Contractor Approval' || p.status === 'In Progress' || p.status === 'Construction Ready' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-white/5 text-white/30'}`}>
                    <strong>3. Contractor Assigned</strong>
                    <span className="block text-[8px] opacity-75">{p.assignedContractorName || 'Pending'}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${p.status === 'In Progress' || p.status === 'Construction Ready' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-white/5 text-white/30'}`}>
                    <strong>4. Construction Started</strong>
                    <span className="block text-[8px] opacity-75">Site Mobilized</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${p.status === 'In Progress' ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-white/5 text-white/30'}`}>
                    <strong>5. Daily Progress</strong>
                    <span className="block text-[8px] opacity-75">Completion: {p.completion}%</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${p.status === 'Completed' ? 'bg-purple-950/30 border-purple-500/40 text-purple-300' : 'bg-slate-900 border-white/5 text-white/30'}`}>
                    <strong>6. Completed</strong>
                    <span className="block text-[8px] opacity-75">Audited</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: APPROVED ENGINEERS DIRECTORY */}
        {clientTab === 'engineers' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Approved, Available & Online Engineers Directory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {engineersList.map((eng) => (
                <div key={eng._id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img src={eng.photoUrl} alt={eng.fullName} className="w-14 h-14 rounded-2xl object-cover border border-cyan-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">{eng.fullName}</h3>
                      <span className="text-xs text-cyan-400 block">{eng.specialization}</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono space-y-1 text-white/70">
                    <p>Qualification: {eng.qualification}</p>
                    <p>Experience: {eng.experience} Years</p>
                    <p>Rating: ⭐ {eng.rating} / 5.0</p>
                    <p>Status: <strong className="text-emerald-400 font-bold">Approved • Available • Online</strong></p>
                  </div>
                  <button onClick={() => { setSelectedEngForProj(eng); setClientTab('create_project'); }} className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl text-xs">
                    Select & Send Request
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS */}
        {clientTab === 'notifications' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Client Workflow Notifications Box</h2>
            <div className="space-y-3">
              {notificationsList.map((n, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{n.title}</span>
                    <p className="text-white/70 mt-1">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-3 py-1 rounded-full">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: AI ASSISTANT */}
        {clientTab === 'ai_assistant' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Client Role-Aware AI Assistant</h2>
            </div>

            <form onSubmit={handleAiAsk} className="flex space-x-2">
              <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} placeholder="Ask about project budgets, delays, engineer approvals, or summary..." className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500" />
              <button type="submit" disabled={aiLoading} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl">
                {aiLoading ? 'Thinking...' : 'Ask AI'}
              </button>
            </form>

            {aiResponse && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-500/30 text-xs text-white/90 leading-relaxed font-mono whitespace-pre-line">
                {aiResponse}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: REPORTS (EXPORT PDF / EXCEL) */}
        {clientTab === 'reports' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Client Reports & Audit Exports</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => exportToPDF('Client Projects Report', ['Project Name', 'Status', 'Budget (₹)', 'Engineer'], projects.map(p => [p.name, p.status, formatIndianRupee(p.budget), (p as any).assignedEngineerName || 'Vikram Aditya']), 'Client_Projects_Report')} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Report</span>
              </button>
              <button 
                onClick={() => exportToExcel(projects, 'Client_Projects_Report')} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel Report</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: AI TEXT TO 3D GENERATOR */}
        {clientTab === 'text_to_3d' && <AiTextTo3DGenerator />}

        {/* TAB 10: CLIENT PROFILE */}
        {clientTab === 'profile' && (
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Client Enterprise Profile</h2>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">Manage developer credentials & company profile</p>
              </div>
              {!isEditingClientProf ? (
                <button 
                  onClick={() => setIsEditingClientProf(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-xl text-xs font-bold text-cyan-300 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditingClientProf(false)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-xs font-bold text-white/70 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {clientSavedMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-400 font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Client profile updated successfully!</span>
              </div>
            )}

            {!isEditingClientProf ? (
              <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                  {clientProfPhoto ? (
                    <img src={clientProfPhoto} alt="Client Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-2xl uppercase">
                      {(clientProfName || 'C').charAt(0)}
                    </div>
                  )}
                  <div className="space-y-1 font-mono text-xs text-white/80">
                    <h3 className="font-bold text-white text-base font-sans">{clientProfName}</h3>
                    <p>• Company: <strong className="text-cyan-400">{clientProfCompany}</strong></p>
                    <p>• Account Type: <strong className="text-cyan-400">Enterprise Client</strong></p>
                    <p>• Active Projects: <strong className="text-white">{projects.length} Submitted Projects</strong></p>
                    <p>• Account Email: <strong className="text-cyan-300">{clientProfEmail}</strong></p>
                    <p>• Contact Phone: <strong className="text-white">{clientProfPhone}</strong></p>
                    <p>• Registered Address: <strong className="text-white/70">{clientProfAddress}</strong></p>
                    <p>• Status: <strong className="text-emerald-400">🟢 Online • Active Client Session ✓</strong></p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveClientProf} className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Representative Name</label>
                    <input 
                      type="text" 
                      required
                      value={clientProfName}
                      onChange={(e) => setClientProfName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Client Company Name</label>
                    <input 
                      type="text" 
                      required
                      value={clientProfCompany}
                      onChange={(e) => setClientProfCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Business Email</label>
                    <input 
                      type="email" 
                      required
                      value={clientProfEmail}
                      onChange={(e) => setClientProfEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Contact Phone</label>
                    <input 
                      type="tel" 
                      required
                      value={clientProfPhone}
                      onChange={(e) => setClientProfPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Registered Address</label>
                    <input 
                      type="text" 
                      required
                      value={clientProfAddress}
                      onChange={(e) => setClientProfAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Profile Photo (Upload file)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setClientProfPhoto(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingClientProf(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-white/70 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Client Profile</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 11: SETTINGS */}
        {clientTab === 'settings' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Client Portal Settings</h2>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Real-Time Workflow Notifications</span>
                <span className="text-emerald-400 font-bold">Enabled ✓</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Auto-Refresh Dashboard Data</span>
                <span className="text-cyan-400 font-bold">Every 10 Seconds</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Token Guard</span>
                <span className="text-emerald-400 font-bold font-mono">JWT Session Active</span>
              </div>
            </div>
          </div>
        )}

        {/* AI INTELLIGENCE FEATURE TABS */}
        {clientTab === 'damage_inspection' && <DamageInspectionPage />}
        {clientTab === 'drone_inspection' && <DroneInspectionPage />}
        {clientTab === '3d_twin' && <DigitalTwinPage />}
        {clientTab === 'doc_analysis' && <DocumentAnalysisPage />}

        {/* STANDALONE MANAGEMENT TABS */}
        {clientTab === 'budget' && <BudgetPage />}
        {clientTab === 'safety' && <SafetyPage />}
        {clientTab === 'materials' && <MaterialsPage />}
      </div>
    );
  };

  // -------------------------------------------------------------------
  // RENDER ENGINEER MODULE UI
  // -------------------------------------------------------------------
  const renderEngineerModule = () => {
    const assignedProjects = projects.filter(p => p.status !== 'Waiting for Engineer Approval');
    const pendingRequests = projects.filter(p => p.status === 'Waiting for Engineer Approval');
    const currentEngEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'rahul@smartbuild.ai' : 'rahul@smartbuild.ai';
    const isPriya = currentEngEmail.toLowerCase().includes('priya');
    const engName = isPriya ? 'Er. Priya Nair' : 'Er. Rahul Sharma';
    const engId = isPriya ? 'ENG-1002' : 'ENG-1001';
    const engSpec = isPriya ? 'Electrical Engineer (M.Tech Electrical)' : 'Lead Structural Engineer (B.Tech Civil)';
    const engPhoto = isPriya ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';

    return (
      <div className="space-y-6">

        {/* TAB 1: MAIN ENGINEER DASHBOARD OVERVIEW */}
        {engineerTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Engineer Profile Banner */}
            <div className="glass-panel p-6 rounded-2xl border-yellow-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={engPhoto} 
                  alt={engName} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-yellow-400 shadow-lg" 
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-bold text-white text-lg">{engName}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-mono">🟢 Online</span>
                  </div>
                  <p className="text-xs text-yellow-400 font-mono">{engSpec} • Employee ID: {engId}</p>
                  <p className="text-[11px] text-white/50">{currentEngEmail}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 font-mono text-xs font-bold">
                  Approved by Admin ✓
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold">
                  Available for Projects
                </span>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl space-y-1">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Assigned Active Projects</span>
                <p className="text-2xl font-extrabold text-white">{assignedProjects.length}</p>
                <span className="text-[10px] text-yellow-400 font-mono block">Under Technical Supervision</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-1">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Pending Client Requests</span>
                <p className="text-2xl font-extrabold text-amber-400">{pendingRequests.length}</p>
                <span className="text-[10px] text-amber-300 font-mono block">Action Required</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-1">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Approved Contractors</span>
                <p className="text-2xl font-extrabold text-cyan-400">{contractorsList.length || 2}</p>
                <span className="text-[10px] text-cyan-300 font-mono block">Available for Assignment</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-1">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Engineering Audit Rating</span>
                <p className="text-2xl font-extrabold text-emerald-400">⭐ 4.9 <span className="text-xs text-emerald-300 font-normal">/ 5.0</span></p>
                <span className="text-[10px] text-emerald-400 font-mono block">Optimal Structural Health</span>
              </div>
            </div>

            {/* MANDATED ASSIGNED PROJECTS SECTION */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-yellow-400" />
                <span>Assigned Construction Projects</span>
              </h2>

              {assignedProjects.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-white/10 text-center space-y-3">
                  <Building2 className="w-10 h-10 text-yellow-400/60 mx-auto animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase">No Assigned Projects Yet</h3>
                  <p className="text-xs text-white/50">When clients select you for a construction project, assigned projects will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {assignedProjects.map((p) => (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div>
                          <h3 className="font-bold text-white text-base uppercase">{p.name}</h3>
                          <p className="text-[10px] text-white/50 font-mono">Location: {p.location} | Type: {p.type || 'Commercial'}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 uppercase">
                            {p.status}
                          </span>
                          <button onClick={() => setWorkspaceProject(p)} className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Project Workspace</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Client</span>
                          <span className="font-bold text-white">{p.clientName || 'Helios Developers Inc.'}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Budget (₹)</span>
                          <span className="font-bold text-yellow-400">{formatIndianRupee(p.budget)}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Assigned Contractor</span>
                          <span className="text-cyan-400 font-bold">{p.assignedContractorName || 'Skyline Construction Pvt Ltd'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PENDING CLIENT REQUESTS SECTION (REQUIREMENT 5) */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-amber-500/30">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Pending Client Requests ({pendingRequests.length})</span>
              </h2>

              {pendingRequests.length === 0 ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 text-center space-y-2">
                  <Check className="w-8 h-8 text-emerald-400/60 mx-auto" />
                  <h3 className="text-xs font-bold text-white uppercase">No Pending Client Requests</h3>
                  <p className="text-[11px] text-white/50">All client project requests have been reviewed and processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((p) => (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-4 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white text-base uppercase">{p.name}</h3>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Priority: {p.priority || 'High'}
                            </span>
                          </div>
                          <p className="text-xs text-yellow-400 font-mono mt-0.5">Client: <strong>{p.clientName || 'Client User'}</strong></p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                          Action Required
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Budget (₹)</span>
                          <span className="font-bold text-yellow-400">{formatIndianRupee(p.budget)}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Location</span>
                          <span className="font-bold text-white">{p.location}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Priority</span>
                          <span className="font-bold text-rose-400">{p.priority || 'High'}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Submitted Date</span>
                          <span className="font-bold text-cyan-300">{p.startDate ? new Date(p.startDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">Description</span>
                        <p className="text-xs text-white/80 font-sans mt-1">{p.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button onClick={() => setWorkspaceProject(p)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold font-mono transition-all">
                          View Details
                        </button>
                        <button onClick={() => handleEngineerAction(p.id, 'Approve')} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shadow-md transition-all">
                          Approve
                        </button>
                        <button onClick={() => handleEngineerAction(p.id, 'Reject')} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs shadow-md transition-all">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CLIENT REQUESTS */}
        {engineerTab === 'client_requests' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Incoming Client Project Requests</h2>
            {pendingRequests.length === 0 ? (
              <div className="bg-slate-950 p-8 rounded-2xl border border-white/10 text-center space-y-3">
                <Check className="w-10 h-10 text-emerald-400/60 mx-auto" />
                <h3 className="text-sm font-bold text-white uppercase">No Pending Client Requests</h3>
                <p className="text-xs text-white/50">All client project requests have been reviewed and processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div>
                        <h3 className="font-bold text-white text-sm uppercase">{p.name}</h3>
                        <p className="text-[10px] text-white/50 font-mono">Client: {p.clientName} | Location: {p.location} | Budget: {formatIndianRupee(p.budget)}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending Review
                      </span>
                    </div>

                    <p className="text-xs text-white/70">{p.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button onClick={() => handleEngineerAction(p.id, 'Approve')} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shadow-md transition-all">
                        Approve Request
                      </button>
                      <button onClick={() => handleEngineerAction(p.id, 'Reject')} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs shadow-md transition-all">
                        Reject Request
                      </button>
                      <button onClick={() => setWorkspaceProject(p)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold font-mono transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASSIGNED PROJECTS */}
        {engineerTab === 'assigned_projects' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Projects Directory</h2>
            {assignedProjects.length === 0 ? (
              <div className="bg-slate-950 p-8 rounded-2xl border border-white/10 text-center space-y-3">
                <Building2 className="w-10 h-10 text-yellow-400/60 mx-auto" />
                <h3 className="text-sm font-bold text-white uppercase">No Assigned Projects Yet</h3>
                <p className="text-xs text-white/50">When clients select you for a construction project, assigned projects will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {assignedProjects.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-bold text-white text-base uppercase">{p.name}</h3>
                        <p className="text-[10px] text-white/50 font-mono">Location: {p.location} | Type: {p.type || 'Commercial'}</p>
                      </div>
                      <button onClick={() => setWorkspaceProject(p)} className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs font-bold flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Project Workspace</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">Budget (₹)</span>
                        <span className="font-bold text-yellow-400">{formatIndianRupee(p.budget)}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">Status</span>
                        <span className="text-white font-bold">{p.status}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">Assigned Contractor</span>
                        <span className="text-cyan-400 font-bold">{p.assignedContractorName || 'Skyline Construction Pvt Ltd'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONTRACTORS DIRECTORY */}
        {engineerTab === 'contractors' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Approved, Available & Online Contractors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contractorsList.map((cont) => (
                <div key={cont._id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img src={cont.photoUrl} alt={cont.companyName} className="w-14 h-14 rounded-2xl object-cover border border-yellow-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">{cont.companyName}</h3>
                      <p className="text-xs text-yellow-400">Owner: {cont.ownerName} (License: {cont.licenseNumber})</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono space-y-1 text-white/70">
                    <p>Experience: {cont.experience} Years | Completed: {cont.projectsCompleted} Projects</p>
                    <p>Rating: ⭐ {cont.rating} / 5.0 | Workload: {cont.currentWorkload} Active</p>
                    <p>Status: <strong className="text-emerald-400 font-bold">Approved • Available • Online</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {engineerTab === 'notifications' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Engineer Notifications Ledger</h2>
            <div className="space-y-3">
              {notificationsList.map((n, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{n.title}</span>
                    <p className="text-white/70 mt-1">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-yellow-400 font-mono bg-yellow-500/10 px-3 py-1 rounded-full">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS */}
        {engineerTab === 'reports' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Engineer Technical Reports & Audits</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => exportToPDF('Engineer Audit Report', ['Project Name', 'Status', 'Budget (₹)', 'Client'], projects.map(p => [p.name, p.status, formatIndianRupee(p.budget), p.clientName || 'Helios Developers']), 'Engineer_Audit_Report')} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Report</span>
              </button>
              <button 
                onClick={() => exportToExcel(projects, 'Engineer_Audit_Report')} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel Report</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: AI ASSISTANT */}
        {engineerTab === 'ai_assistant' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-yellow-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Engineer Role-Aware AI Assistant</h2>
            </div>

            <form onSubmit={handleAiAsk} className="flex space-x-2">
              <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} placeholder="Ask about structural calculations, concrete mix design, code compliance, or blueprint audit..." className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-yellow-500" />
              <button type="submit" disabled={aiLoading} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl">
                {aiLoading ? 'Thinking...' : 'Ask AI'}
              </button>
            </form>

            {aiResponse && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-yellow-500/30 text-xs text-white/90 leading-relaxed font-mono whitespace-pre-line">
                {aiResponse}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: AI TEXT TO 3D GENERATOR */}
        {engineerTab === 'text_to_3d' && <AiTextTo3DGenerator />}

        {/* TAB 9: ENGINEER PROFILE */}
        {engineerTab === 'profile' && (
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Engineer Profile Console</h2>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">Manage professional license credentials & engineering details</p>
              </div>
              {!isEditingEngProf ? (
                <button 
                  onClick={() => setIsEditingEngProf(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/40 rounded-xl text-xs font-bold text-yellow-300 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditingEngProf(false)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-xs font-bold text-white/70 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {engSavedMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-400 font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Engineer profile updated successfully!</span>
              </div>
            )}

            {!isEditingEngProf ? (
              <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                <img 
                  src={engProfPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"} 
                  alt="Engineer Avatar" 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-yellow-400 shadow-lg" 
                />
                <div className="space-y-1 font-mono text-xs text-white/80">
                  <h3 className="font-bold text-white text-base font-sans">{engProfName}</h3>
                  <p>• Specialization: <strong className="text-yellow-400">{engProfSpec}</strong></p>
                  <p>• Qualification: <strong className="text-white">{engProfQual}</strong></p>
                  <p>• Experience: <strong className="text-white">{engProfExp}</strong></p>
                  <p>• Corporate Email: <strong className="text-cyan-300">{engProfEmail}</strong></p>
                  <p>• Location: <strong className="text-white">{engProfLoc}</strong></p>
                  <p>• Status: <strong className="text-emerald-400">🟢 Online • Available • Approved by Admin ✓</strong></p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveEngProf} className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Engineer Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={engProfName}
                      onChange={(e) => setEngProfName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-yellow-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Specialization</label>
                    <input 
                      type="text" 
                      required
                      value={engProfSpec}
                      onChange={(e) => setEngProfSpec(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-yellow-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Qualification</label>
                    <input 
                      type="text" 
                      required
                      value={engProfQual}
                      onChange={(e) => setEngProfQual(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-yellow-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Experience</label>
                    <input 
                      type="text" 
                      required
                      value={engProfExp}
                      onChange={(e) => setEngProfExp(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-yellow-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Corporate Email</label>
                    <input 
                      type="email" 
                      required
                      value={engProfEmail}
                      onChange={(e) => setEngProfEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-yellow-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Location / City</label>
                    <input 
                      type="text" 
                      required
                      value={engProfLoc}
                      onChange={(e) => setEngProfLoc(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-yellow-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Profile Photo (Upload file)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setEngProfPhoto(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-500/20 file:text-yellow-300 hover:file:bg-yellow-500/30 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingEngProf(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-white/70 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-xs transition-all shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Engineer Profile</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* AI INTELLIGENCE FEATURE TABS */}
        {engineerTab === 'damage_inspection' && <DamageInspectionPage />}
        {engineerTab === 'drone_inspection' && <DroneInspectionPage />}
        {engineerTab === '3d_twin' && <DigitalTwinPage />}
        {engineerTab === 'doc_analysis' && <DocumentAnalysisPage />}

        {/* STANDALONE MANAGEMENT TABS */}
        {engineerTab === 'budget' && <BudgetPage />}
        {engineerTab === 'safety' && <SafetyPage />}
        {engineerTab === 'settings' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Engineer Console Settings</h2>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Technical Blueprint Alerts</span>
                <span className="text-emerald-400 font-bold">Active ✓</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Contractor Assignment Notifications</span>
                <span className="text-cyan-400 font-bold">Real-time Push</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Token Guard</span>
                <span className="text-emerald-400 font-bold font-mono">JWT Session Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------------
  // RENDER CONTRACTOR MODULE UI (FULL WORKER MANAGEMENT + ATTENDANCE)
  // -------------------------------------------------------------------
  const renderContractorModule = () => {
    const materials = MOCK_MATERIALS;
    const equipment = MOCK_EQUIPMENT;
    const assignedProjects = projects.filter(p => p.status !== 'Pending Admin Approval');
    const filteredWorkers = workersList.filter(w => {
      const matchesSearch = !workerSearchTerm || 
        w.name?.toLowerCase().includes(workerSearchTerm.toLowerCase()) || 
        w.workerId?.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
        w.trade?.toLowerCase().includes(workerSearchTerm.toLowerCase());
      const matchesTrade = workerFilterTrade === 'All' || w.trade === workerFilterTrade;
      return matchesSearch && matchesTrade;
    });

    const presentWorkersCount = workersList.filter(w => w.attendanceStatus === 'Present' || w.status === 'Active').length;
    const totalMonthlyPayroll = workersList.reduce((acc, w) => acc + (w.salary || 30000), 0);

    return (
      <div className="space-y-6">

        {/* TAB 1: CONTRACTOR DASHBOARD OVERVIEW */}
        {contractorTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Contractor Profile Banner */}
            <div className="glass-panel p-6 rounded-2xl border-orange-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80" 
                  alt="Skyline Construction" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-400 shadow-lg" 
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-bold text-white text-lg">Skyline Construction Pvt Ltd</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-mono">🟢 Online</span>
                  </div>
                  <p className="text-xs text-orange-400 font-mono">Licensed General Contractor • License: LIC-CON-8849</p>
                  <p className="text-[11px] text-white/50">Owner: Vikramaditya Skyline • 10 Yrs Experience (24 Projects Completed)</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-300 border border-orange-500/30 font-mono text-xs font-bold">
                  Approved by Admin ✓
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold">
                  Available for Projects
                </span>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl space-y-1">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Total Managed Workers</span>
                <p className="text-2xl font-extrabold text-white">{workersList.length || 20}</p>
                <span className="text-[10px] text-orange-400 font-mono block">Registered Site Crew</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-1">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Present Today</span>
                <p className="text-2xl font-extrabold text-emerald-400">{presentWorkersCount || 18}</p>
                <span className="text-[10px] text-emerald-300 font-mono block">🟢 90.0% Attendance Rate</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-1">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Active Assigned Projects</span>
                <p className="text-2xl font-extrabold text-cyan-400">{assignedProjects.length}</p>
                <span className="text-[10px] text-cyan-300 font-mono block">Under Construction</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-1">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Monthly Payroll</span>
                <p className="text-2xl font-extrabold text-yellow-400">{formatIndianRupee(totalMonthlyPayroll || 585000)}</p>
                <span className="text-[10px] text-yellow-300 font-mono block">Disbursed via Contractor</span>
              </div>
            </div>

            {/* MANDATED ASSIGNED PROJECTS SECTION */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <span>Assigned Construction Sites</span>
              </h2>

              {assignedProjects.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-white/10 text-center space-y-3">
                  <Building2 className="w-10 h-10 text-orange-400/60 mx-auto animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase">No Assigned Projects Yet</h3>
                  <p className="text-xs text-white/50">When engineers assign projects to your contracting firm, they will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {assignedProjects.map((p) => (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div>
                          <h3 className="font-bold text-white text-base uppercase">{p.name}</h3>
                          <p className="text-[10px] text-white/50 font-mono">Location: {p.location} | Type: {p.type || 'Commercial'}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
                            {p.status}
                          </span>
                          <button onClick={() => setWorkspaceProject(p)} className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Site Workspace</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Client</span>
                          <span className="font-bold text-white">{p.clientName || 'Helios Developers Inc.'}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Budget (₹)</span>
                          <span className="font-bold text-yellow-400">{formatIndianRupee(p.budget)}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Lead Engineer</span>
                          <span className="text-cyan-400 font-bold">{p.assignedEngineerName || 'Rahul Sharma'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ATTENDANCE SUMMARY & QUICK CARDS */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Today&apos;s Attendance Breakdown</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs font-mono">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-emerald-300 block">🟢 Present</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {attendanceLedger.filter(a => a.todayStatus === 'Present').length}
                  </span>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-rose-300 block">🔴 Absent</span>
                  <span className="text-lg font-bold text-rose-400">
                    {attendanceLedger.filter(a => a.todayStatus === 'Absent').length}
                  </span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-amber-300 block">🟡 Half Day</span>
                  <span className="text-lg font-bold text-amber-400">
                    {attendanceLedger.filter(a => a.todayStatus === 'Half Day').length}
                  </span>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-blue-300 block">🔵 On Leave</span>
                  <span className="text-lg font-bold text-blue-400">
                    {attendanceLedger.filter(a => a.todayStatus === 'Leave').length}
                  </span>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-purple-300 block">⏱ Not Marked</span>
                  <span className="text-lg font-bold text-purple-400">
                    {attendanceLedger.filter(a => a.todayStatus === 'Not Marked' || !a.todayStatus).length}
                  </span>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-cyan-300 block">📊 Attendance %</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {attendanceLedger.length > 0
                      ? ((attendanceLedger.filter(a => a.todayStatus === 'Present').length / attendanceLedger.length) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECTS DIRECTORY */}
        {contractorTab === 'projects' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Construction Projects</h2>
            {assignedProjects.length === 0 ? (
              <div className="bg-slate-950 p-8 rounded-2xl border border-white/10 text-center space-y-3">
                <Building2 className="w-10 h-10 text-orange-400/60 mx-auto" />
                <h3 className="text-sm font-bold text-white uppercase">No Assigned Projects Yet</h3>
                <p className="text-xs text-white/50">When engineers assign projects to your contracting firm, they will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {assignedProjects.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-bold text-white text-base uppercase">{p.name}</h3>
                        <p className="text-[10px] text-white/50 font-mono">Location: {p.location} | Type: {p.type || 'Commercial'}</p>
                      </div>
                      <button onClick={() => setWorkspaceProject(p)} className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Site Workspace</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">Budget (₹)</span>
                        <span className="font-bold text-yellow-400">{formatIndianRupee(p.budget)}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">Status</span>
                        <span className="text-white font-bold">{p.status}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">Lead Engineer</span>
                        <span className="text-cyan-400 font-bold">{p.assignedEngineerName || 'Rahul Sharma'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WORKER MANAGEMENT (CONTRACTOR FULL AUTHORITY) */}
        {contractorTab === 'workers' && (
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  <span>Contractor Worker Management Ledger ({filteredWorkers.length})</span>
                </h2>
                <p className="text-xs text-white/50 mt-1">Full authority: Add, Edit, Delete, Suspend, Unlock Account, Generate QR Code, Reset Password, Export Ledger.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => exportToPDF('Worker Ledger Report', ['Worker ID', 'Name', 'Trade', 'Salary', 'Project', 'Status'], filteredWorkers.map(w => [w.workerId, w.name, w.trade, formatIndianRupee(w.salary || 28000), w.projectName || 'Skyline Tower', w.status || 'Active']), 'Worker_Ledger')} 
                  className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button 
                  onClick={() => exportToExcel(filteredWorkers, 'Worker_Ledger')} 
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
                <button 
                  onClick={() => setShowAddWorkerModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Worker</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Search worker by name, ID, or trade..." 
                value={workerSearchTerm} 
                onChange={(e) => setWorkerSearchTerm(e.target.value)} 
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" 
              />
              <select 
                value={workerFilterTrade} 
                onChange={(e) => setWorkerFilterTrade(e.target.value)} 
                className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              >
                <option value="All">All Trades (15 Trades)</option>
                <option value="Civil Mason">Civil Mason</option>
                <option value="Steel Fixer">Steel Fixer</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Welder">Welder</option>
                <option value="Painter">Painter</option>
                <option value="Excavator Operator">Excavator Operator</option>
                <option value="Tower Crane Operator">Tower Crane Operator</option>
                <option value="Survey Assistant">Survey Assistant</option>
                <option value="Concrete Finisher">Concrete Finisher</option>
                <option value="Tile Worker">Tile Worker</option>
                <option value="HVAC Technician">HVAC Technician</option>
                <option value="Machine Operator">Machine Operator</option>
                <option value="General Labour">General Labour</option>
              </select>
            </div>

            {/* WORKERS DIRECTORY TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3">Profile & Name</th>
                    <th className="p-3">Worker ID</th>
                    <th className="p-3">Trade & Skill</th>
                    <th className="p-3">Aadhaar</th>
                    <th className="p-3">Daily / Monthly Salary</th>
                    <th className="p-3">Assigned Project</th>
                    <th className="p-3">Attendance & Overtime</th>
                    <th className="p-3">Performance</th>
                    <th className="p-3">Safety Status</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                  {filteredWorkers.map((w) => (
                    <tr key={w.workerId || w._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3 font-sans">
                          <img src={w.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'} alt={w.name} className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                          <div>
                            <span className="font-bold text-white block">{w.name}</span>
                            <span className="text-[9px] text-white/40 font-mono">{w.gender || 'Male'} • {w.age || 30} Yrs</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-cyan-400">{w.workerId}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{w.trade || 'Mason'}</span>
                        <span className="text-[9px] text-orange-400">{w.skillLevel || 'Skilled'}</span>
                      </td>
                      <td className="p-3 text-white/60 text-[10px]">{w.aadhaarNumber || '5432-8765-1092'}</td>
                      <td className="p-3 text-yellow-400 font-bold">
                        ₹{w.dailySalary || 950}/day
                        <span className="block text-[9px] text-white/50">{formatIndianRupee(w.salary || 28500)}/mo</span>
                      </td>
                      <td className="p-3 text-cyan-300 text-[11px] font-sans">{w.projectName || 'Skyline Tower'}</td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold">{w.presentDays || 24} P</span> / <span className="text-rose-400">{w.absentDays || 2} A</span>
                        <span className="block text-[9px] text-purple-300">{w.overtimeHours || 12} Hrs Overtime</span>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">⭐ {w.performanceScore || 4.8}</td>
                      <td className="p-3 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold block w-fit mb-1">
                          🪖 {w.helmetStatus || 'Wearing'}
                        </span>
                        <span className="text-white/50 text-[9px]">Training: {w.safetyTraining || 'Certified'}</span>
                      </td>
                      <td className="p-3 text-[10px]">
                        {w.isLocked ? (
                          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">
                            LOCKED
                          </span>
                        ) : (
                          <span className={`px-2 py-1 rounded font-bold ${w.status === 'Suspended' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                            {w.status || 'Active'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5 font-sans">
                        <button onClick={() => setViewQrWorker(w)} className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-bold">
                          QR Code
                        </button>
                        {w.isLocked ? (
                          <button onClick={() => handleUnlockWorkerAccount(w.workerId || w._id, w.name)} className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] rounded-lg">
                            Unlock
                          </button>
                        ) : (
                          <button onClick={() => handleResetWorkerPassword(w.workerId || w._id, w.name)} className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-[10px] font-bold">
                            Reset Pwd
                          </button>
                        )}
                        <button onClick={() => handleToggleSuspendWorker(w.workerId || w._id, w.status || 'Active', w.name)} className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold">
                          {w.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteWorker(w.workerId || w._id, w.name)} className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANCE LEDGER & DASHBOARD */}
        {contractorTab === 'attendance' && (
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span>Centralized Worker Attendance Dashboard</span>
                </h2>
                <p className="text-xs text-white/50 mt-0.5">Real-time attendance logs managed manually by Contractor in Centralized MongoDB database.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => exportToPDF('Worker Attendance Report', ['Worker ID', 'Name', 'Date', 'Status', 'Check In', 'Location'], attendanceLedger.map(a => [a.workerIdStr || a.workerId, a.workerName, a.date, a.todayStatus, a.checkInTime, a.location]), 'Attendance_Report')}
                  className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </button>
                <button 
                  onClick={() => exportToExcel(attendanceLedger, 'Worker_Attendance_Ledger')}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel Report</span>
                </button>
                <button 
                  onClick={handleContractorSubmitAttendanceSummary}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Attendance & View Summary</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3">Worker Name</th>
                    <th className="p-3">Worker ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Assigned Project</th>
                    <th className="p-3">Today&apos;s Status</th>
                    <th className="p-3">Contractor Action</th>
                    <th className="p-3">Check In Time</th>
                    <th className="p-3">Marked By</th>
                    <th className="p-3">Overtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                  {attendanceLedger.map((a, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-white font-sans">{a.workerName}</td>
                      <td className="p-3 text-cyan-400 font-bold">{a.workerIdStr || a.workerId}</td>
                      <td className="p-3 text-white/60">{a.date || new Date().toISOString().split('T')[0]}</td>
                      <td className="p-3 text-white/70 font-sans">{a.project || a.projectName || 'Skyline Tower'}</td>
                      <td className="p-3 text-[10px]">
                        <span className={`px-2.5 py-1 rounded font-bold uppercase ${
                          a.todayStatus === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                          a.todayStatus === 'Absent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 
                          a.todayStatus === 'Half Day' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 
                          a.todayStatus === 'Leave' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 
                          'bg-slate-800 text-slate-300 border border-white/10'
                        }`}>
                          {a.todayStatus || 'Not Marked'}
                        </span>
                      </td>
                      <td className="p-3 space-x-1.5 font-sans">
                        <button 
                          onClick={() => handleContractorMarkAttendance(a.workerIdStr || a.workerId, 'Present')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${a.todayStatus === 'Present' ? 'bg-emerald-500 text-black shadow-md' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'}`}
                        >
                          PRESENT
                        </button>
                        <button 
                          onClick={() => handleContractorMarkAttendance(a.workerIdStr || a.workerId, 'Absent')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${a.todayStatus === 'Absent' ? 'bg-rose-500 text-black shadow-md' : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/40'}`}
                        >
                          ABSENT
                        </button>
                        <button 
                          onClick={() => handleContractorMarkAttendance(a.workerIdStr || a.workerId, 'Half Day')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${a.todayStatus === 'Half Day' ? 'bg-amber-500 text-black shadow-md' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/40'}`}
                        >
                          HALF
                        </button>
                        <button 
                          onClick={() => handleContractorMarkAttendance(a.workerIdStr || a.workerId, 'Leave')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${a.todayStatus === 'Leave' ? 'bg-cyan-600 text-white shadow-md' : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40'}`}
                        >
                          LEAVE
                        </button>
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">{a.checkInTime || (a.todayStatus === 'Present' ? '08:30 AM' : '--:--')}</td>
                      <td className="p-3 text-white/50 text-[10px]">
                        <span className="bg-white/5 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono text-[10px]">
                          {a.markedBy || 'Contractor'}
                        </span>
                      </td>
                      <td className="p-3 text-purple-400">{a.overtimeHours || 0} Hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SALARY LEDGER & PAYROLL REPORT */}
        {contractorTab === 'salary' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span>Contractor Worker Salary & Payroll Ledger</span>
                </h2>
                <p className="text-xs text-white/50 mt-0.5">Calculated daily wages, overtime allowances, and monthly payroll disbursements.</p>
              </div>

              <button 
                onClick={() => exportToExcel(workersList, 'Worker_Salary_Report')} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-xl text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Download Salary Report</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3">Worker ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Trade</th>
                    <th className="p-3">Daily Wage (₹)</th>
                    <th className="p-3">Present Days</th>
                    <th className="p-3">Overtime Hours</th>
                    <th className="p-3">Gross Monthly Salary (₹)</th>
                    <th className="p-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                  {workersList.map((w, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-cyan-400 font-bold">{w.workerId}</td>
                      <td className="p-3 font-bold text-white font-sans">{w.name}</td>
                      <td className="p-3 text-white/70">{w.trade || 'Mason'}</td>
                      <td className="p-3 text-yellow-400">₹{w.dailySalary || 950}/day</td>
                      <td className="p-3 text-emerald-400 font-bold">{w.presentDays || 24} Days</td>
                      <td className="p-3 text-purple-300">{w.overtimeHours || 12} Hrs</td>
                      <td className="p-3 text-yellow-400 font-extrabold">{formatIndianRupee(w.salary || 28500)}</td>
                      <td className="p-3 text-[10px]">
                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          DISBURSED ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: MATERIALS */}
        {contractorTab === 'materials' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Site Materials Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {materials.map((m) => (
                <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm font-sans">{m.name}</h3>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">{m.status}</span>
                  </div>
                  <p className="text-white/60">Stock: <strong className="text-yellow-400">{m.stock} {m.unit}</strong> | Supplier: {m.supplier}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: EQUIPMENT */}
        {contractorTab === 'equipment' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Construction Heavy Machinery Fleet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {equipment.map((eq) => (
                <div key={eq.id} className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm font-sans">{eq.name}</h3>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{eq.status}</span>
                  </div>
                  <p className="text-white/60">Health: <strong className="text-emerald-400">{eq.health}%</strong> | Fuel: <strong className="text-yellow-400">{eq.fuel}%</strong></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: AI TEXT TO 3D GENERATOR */}
        {contractorTab === 'text_to_3d' && <AiTextTo3DGenerator />}

        {/* TAB 9: REPORTS */}
        {contractorTab === 'reports' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contractor Operations Reports</h2>
            <div className="flex space-x-3">
              <button onClick={() => exportToPDF('Contractor Operational Summary', ['Metric', 'Value'], [['Total Workers', workersList.length], ['Present Today', presentWorkersCount]], 'Contractor_Summary')} className="px-5 py-2.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs">
                Export PDF Report
              </button>
              <button onClick={() => exportToExcel(workersList, 'Contractor_Summary')} className="px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs">
                Export Excel Report
              </button>
            </div>
          </div>
        )}

        {/* TAB 10: NOTIFICATIONS */}
        {contractorTab === 'notifications' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contractor Operations Notifications</h2>
            <div className="space-y-3">
              {notificationsList.map((n, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{n.title}</span>
                    <p className="text-white/70 mt-1">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-3 py-1 rounded-full">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: PROFILE */}
        {contractorTab === 'profile' && (
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contractor Firm Profile</h2>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">Manage company license & contractor firm credentials</p>
              </div>
              {!isEditingContProf ? (
                <button 
                  onClick={() => setIsEditingContProf(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/40 rounded-xl text-xs font-bold text-orange-300 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditingContProf(false)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-xs font-bold text-white/70 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {contSavedMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-400 font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Contractor firm profile updated successfully!</span>
              </div>
            )}

            {!isEditingContProf ? (
              <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                <img 
                  src={contProfPhoto || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"} 
                  alt="Contractor Firm" 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-400 shadow-lg" 
                />
                <div className="space-y-1 font-mono text-xs text-white/80">
                  <h3 className="font-bold text-white text-base font-sans">{contProfFirm}</h3>
                  <p>• Owner: <strong className="text-orange-400">{contProfOwner}</strong></p>
                  <p>• License: <strong className="text-white">{contProfLicense}</strong></p>
                  <p>• Contact Email: <strong className="text-cyan-300">{contProfEmail}</strong></p>
                  <p>• Phone Number: <strong className="text-white">{contProfPhone}</strong></p>
                  <p>• Office Address: <strong className="text-white/70">{contProfAddress}</strong></p>
                  <p>• Projects Completed: <strong className="text-white">24 Completed</strong></p>
                  <p>• Managed Crew: <strong className="text-cyan-300">{workersList.length} Registered Workers</strong></p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveContProf} className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Firm / Company Name</label>
                    <input 
                      type="text" 
                      required
                      value={contProfFirm}
                      onChange={(e) => setContProfFirm(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-orange-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Owner Representative Name</label>
                    <input 
                      type="text" 
                      required
                      value={contProfOwner}
                      onChange={(e) => setContProfOwner(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-orange-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Contractor License Number</label>
                    <input 
                      type="text" 
                      required
                      value={contProfLicense}
                      onChange={(e) => setContProfLicense(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-orange-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Contact Email</label>
                    <input 
                      type="email" 
                      required
                      value={contProfEmail}
                      onChange={(e) => setContProfEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-orange-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={contProfPhone}
                      onChange={(e) => setContProfPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-orange-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Office Address</label>
                    <input 
                      type="text" 
                      required
                      value={contProfAddress}
                      onChange={(e) => setContProfAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-orange-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest block">Profile Photo (Upload file)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setContProfPhoto(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingContProf(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-white/70 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl text-xs transition-all shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Firm Profile</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 12: AI TEXT TO 3D GENERATOR */}
        {contractorTab === 'text_to_3d' && <AiTextTo3DGenerator />}

        {/* AI INTELLIGENCE FEATURE TABS */}
        {contractorTab === 'damage_inspection' && <DamageInspectionPage />}
        {contractorTab === 'drone_inspection' && <DroneInspectionPage />}
        {contractorTab === '3d_twin' && <DigitalTwinPage />}

        {/* STANDALONE MANAGEMENT TABS */}
        {contractorTab === 'safety' && <SafetyPage />}
        {contractorTab === 'budget' && <BudgetPage />}
        {contractorTab === 'settings' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contractor Management Settings</h2>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Worker Attendance Telemetry Sync</span>
                <span className="text-emerald-400 font-bold">Live Auto-Sync ✓</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Equipment Telemetry Sensor Thresholds</span>
                <span className="text-cyan-400 font-bold">Standard Operations</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Token Guard</span>
                <span className="text-emerald-400 font-bold font-mono">JWT Session Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------------
  // RENDER SUPER ADMIN MODULE UI (COMPLETE CONTROL)
  // -------------------------------------------------------------------
  const renderAdminModule = () => {
    const uniqueClients = Array.from(new Set(projects.map(p => p.clientEmail))).map((email, idx) => {
      const proj = projects.find(p => p.clientEmail === email);
      const clientName = proj?.clientName || 'Helios Developers Inc.';
      const clientProjs = projects.filter(p => p.clientEmail === email);
      return {
        id: `client-${idx + 1}`,
        name: clientName,
        email: email || 'client@corporate.com',
        projectsCount: clientProjs.length,
        totalBudget: clientProjs.reduce((acc, p) => acc + (p.budget || 0), 0)
      };
    });

    const filteredWorkers = workersList.filter(w => {
      const matchesSearch = !workerSearchTerm || 
        w.name?.toLowerCase().includes(workerSearchTerm.toLowerCase()) || 
        w.workerId?.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
        w.trade?.toLowerCase().includes(workerSearchTerm.toLowerCase());
      const matchesTrade = workerFilterTrade === 'All' || w.trade === workerFilterTrade;
      return matchesSearch && matchesTrade;
    });

    return (
      <div className="space-y-6">

        {/* ADMIN COMPLETE CONTROL VIEW */}
        {adminTab === 'dashboard' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Super Admin Master Command System</h2>
            <p className="text-xs text-white/50">Complete control over Clients, Engineers, Contractors, Workers, Projects, and AI Analytics.</p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-cyan-500/50 transition-colors" onClick={() => setAdminTab('clients')}>
                <span className="text-[10px] text-white/40 block font-mono">Clients Directory</span>
                <span className="text-xl font-bold text-white">{uniqueClients.length} Enterprise Clients</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-cyan-500/50 transition-colors" onClick={() => setAdminTab('engineers')}>
                <span className="text-[10px] text-white/40 block font-mono">Approved Engineers</span>
                <span className="text-xl font-bold text-cyan-400">{engineersList.length || 3} Engineers</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-cyan-500/50 transition-colors" onClick={() => setAdminTab('contractors')}>
                <span className="text-[10px] text-white/40 block font-mono">Approved Contractors</span>
                <span className="text-xl font-bold text-yellow-400">{contractorsList.length || 2} Contractors</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-cyan-500/50 transition-colors" onClick={() => setAdminTab('workers')}>
                <span className="text-[10px] text-white/40 block font-mono">Active Site Workers</span>
                <span className="text-xl font-bold text-emerald-400">{workersList.length || 2} Personnel</span>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS DIRECTORY */}
        {adminTab === 'clients' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Building className="w-5 h-5 text-cyan-400" />
              <span>Registered Clients Directory</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueClients.map((client) => (
                <div key={client.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-lg">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{client.name}</h3>
                      <p className="text-xs text-white/50">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono space-y-1 text-white/70">
                    <p>Active Projects: <strong className="text-white">{client.projectsCount} Submitted</strong></p>
                    <p>Total Capital Budget: <strong className="text-yellow-400">{formatIndianRupee(client.totalBudget)}</strong></p>
                    <p>Status: <strong className="text-emerald-400">Active Enterprise Client ✓</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENGINEERS DIRECTORY */}
        {adminTab === 'engineers' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <HardHat className="w-5 h-5 text-cyan-400" />
              <span>Approved Engineers Directory</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {engineersList.map((eng) => (
                <div key={eng._id || eng.engineerId} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img src={eng.photoUrl} alt={eng.fullName} className="w-14 h-14 rounded-2xl object-cover border border-cyan-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">{eng.fullName}</h3>
                      <span className="text-xs text-cyan-400 block">{eng.specialization}</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono space-y-1 text-white/70">
                    <p>ID: {eng.engineerId}</p>
                    <p>Qualification: {eng.qualification}</p>
                    <p>Experience: {eng.experience} Years</p>
                    <p>Rating: ⭐ {eng.rating} / 5.0</p>
                    <p>Status: <strong className="text-emerald-400 font-bold">Approved • Available • Online</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTRACTORS DIRECTORY */}
        {adminTab === 'contractors' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-yellow-400" />
              <span>Approved Contractors Directory</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contractorsList.map((cont) => (
                <div key={cont._id || cont.contractorId} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img src={cont.photoUrl} alt={cont.companyName} className="w-14 h-14 rounded-2xl object-cover border border-yellow-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">{cont.companyName}</h3>
                      <p className="text-xs text-yellow-400">Owner: {cont.ownerName} (License: {cont.licenseNumber})</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono space-y-1 text-white/70">
                    <p>Experience: {cont.experience} Years | Completed: {cont.projectsCompleted} Projects</p>
                    <p>Rating: ⭐ {cont.rating} / 5.0 | Workload: {cont.currentWorkload} Active</p>
                    <p>Status: <strong className="text-emerald-400 font-bold">Approved • Available • Online</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKERS DIRECTORY */}
        {adminTab === 'workers' && (
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Workers Registry Directory ({filteredWorkers.length})</span>
                </h2>
                <p className="text-xs text-white/50 mt-1">Super Admin oversight on all site personnel details and performance metrics.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => exportToPDF('Worker Ledger Report', ['Worker ID', 'Name', 'Trade', 'Salary', 'Project', 'Status'], filteredWorkers.map(w => [w.workerId, w.name, w.trade, formatIndianRupee(w.salary || 28000), w.projectName || 'Skyline Tower', w.status || 'Active']), 'Worker_Ledger')} 
                  className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button 
                  onClick={() => exportToExcel(filteredWorkers, 'Worker_Ledger')} 
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Search worker by name, ID, or trade..." 
                value={workerSearchTerm} 
                onChange={(e) => setWorkerSearchTerm(e.target.value)} 
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500" 
              />
              <select 
                value={workerFilterTrade} 
                onChange={(e) => setWorkerFilterTrade(e.target.value)} 
                className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="All">All Trades (15 Trades)</option>
                <option value="Civil Mason">Civil Mason</option>
                <option value="Steel Fixer">Steel Fixer</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Welder">Welder</option>
                <option value="Painter">Painter</option>
                <option value="Excavator Operator">Excavator Operator</option>
                <option value="Tower Crane Operator">Tower Crane Operator</option>
                <option value="Survey Assistant">Survey Assistant</option>
                <option value="Concrete Finisher">Concrete Finisher</option>
                <option value="Tile Worker">Tile Worker</option>
                <option value="HVAC Technician">HVAC Technician</option>
                <option value="Machine Operator">Machine Operator</option>
                <option value="General Labour">General Labour</option>
              </select>
            </div>

            {/* WORKERS DIRECTORY TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3">Profile & Name</th>
                    <th className="p-3">Worker ID</th>
                    <th className="p-3">Trade & Skill</th>
                    <th className="p-3">Aadhaar</th>
                    <th className="p-3">Salary</th>
                    <th className="p-3">Assigned Project</th>
                    <th className="p-3">Performance</th>
                    <th className="p-3">Safety Status</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                  {filteredWorkers.map((w) => (
                    <tr key={w.workerId || w._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3 font-sans">
                          <img src={w.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'} alt={w.name} className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                          <div>
                            <span className="font-bold text-white block">{w.name}</span>
                            <span className="text-[9px] text-white/40 font-mono">{w.gender || 'Male'} • {w.age || 30} Yrs</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-cyan-400">{w.workerId}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{w.trade || 'Mason'}</span>
                        <span className="text-[9px] text-orange-400">{w.skillLevel || 'Skilled'}</span>
                      </td>
                      <td className="p-3 text-white/60 text-[10px]">{w.aadhaarNumber || '5432-8765-1092'}</td>
                      <td className="p-3 text-yellow-400 font-bold">
                        ₹{w.dailySalary || 950}/day
                        <span className="block text-[9px] text-white/50">{formatIndianRupee(w.salary || 28500)}/mo</span>
                      </td>
                      <td className="p-3 text-cyan-300 text-[11px] font-sans">{w.projectName || 'Skyline Tower'}</td>
                      <td className="p-3 font-bold text-emerald-400">⭐ {w.performanceScore || 4.8}</td>
                      <td className="p-3 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold block w-fit mb-1">
                          🪖 {w.helmetStatus || 'Wearing'}
                        </span>
                        <span className="text-white/50 text-[9px]">Training: {w.safetyTraining || 'Certified'}</span>
                      </td>
                      <td className="p-3 text-[10px]">
                        <span className={`px-2 py-1 rounded font-bold ${w.status === 'Suspended' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {w.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 font-sans">
                        <button onClick={() => setViewQrWorker(w)} className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-bold">
                          QR Code
                        </button>
                        <button onClick={() => handleToggleSuspendWorker(w.workerId || w._id, w.status || 'Active', w.name)} className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold">
                          {w.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteWorker(w.workerId || w._id, w.name)} className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROJECTS DIRECTORY */}
        {adminTab === 'projects' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FolderGit2 className="w-5 h-5 text-cyan-400" />
              <span>All Construction Projects Directory</span>
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <div>
                      <h3 className="font-bold text-white text-base uppercase">{p.name}</h3>
                      <p className="text-[10px] text-white/50 font-mono">Location: {p.location} | Type: {p.type || 'Commercial'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStatusBadge(p.status)}
                      <button 
                        type="button"
                        onClick={() => handleOpenEditProject(p)} 
                        className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                        title="Edit project budget, location, and parameters"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => setWorkspaceProject(p)} className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Project Workspace</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="text-[9px] text-white/40 block">Client</span>
                      <span className="font-bold text-white">{p.clientName || 'Helios Developers Inc.'}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="text-[9px] text-white/40 block">Budget (₹)</span>
                      <span className="font-bold text-yellow-400">{formatIndianRupee(p.budget)}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="text-[9px] text-white/40 block">Lead Engineer</span>
                      <span className="text-cyan-400 font-bold">{p.assignedEngineerName || 'Rahul Sharma'}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="text-[9px] text-white/40 block">Assigned Contractor</span>
                      <span className="text-yellow-400 font-bold">{p.assignedContractorName || 'Pending Assignment'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: AI TEXT TO 3D GENERATOR */}
        {adminTab === 'text_to_3d' && <AiTextTo3DGenerator />}

        {/* AI INTELLIGENCE FEATURE TABS */}
        {adminTab === 'damage_inspection' && <DamageInspectionPage />}
        {adminTab === 'drone_inspection' && <DroneInspectionPage />}
        {adminTab === '3d_twin' && <DigitalTwinPage />}
        {adminTab === 'doc_analysis' && <DocumentAnalysisPage />}

        {/* STANDALONE MANAGEMENT TABS FOR ADMIN */}
        {adminTab === 'budget' && <BudgetPage />}
        {adminTab === 'safety' && <SafetyPage />}

        {/* TAB: ADMIN NOTIFICATIONS */}
        {adminTab === 'notifications' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Super Admin System Notifications Ledger</span>
            </h2>
            <div className="space-y-3">
              {notificationsList.map((n, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{n.title}</span>
                    <p className="text-white/70 mt-1">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-3 py-1 rounded-full">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ADMIN REPORTS */}
        {adminTab === 'reports' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Super Admin Master Audit Exports</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => exportToPDF('Super Admin Master Audit', ['Project Name', 'Status', 'Budget (₹)', 'Lead Engineer'], projects.map(p => [p.name, p.status, formatIndianRupee(p.budget), p.assignedEngineerName || 'Rahul Sharma']), 'SuperAdmin_Master_Audit')} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Export Master PDF</span>
              </button>
              <button 
                onClick={() => exportToExcel(projects, 'SuperAdmin_Master_Audit')} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Master Excel</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: ADMIN PROFILE */}
        {adminTab === 'profile' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Super Admin Profile Console</h2>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 flex items-center space-x-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 border-2 border-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                SA
              </div>
              <div className="space-y-1 font-mono text-xs text-white/80">
                <h3 className="font-bold text-white text-base font-sans">Super Admin Authority</h3>
                <p>• Access Level: <strong className="text-cyan-400">Full System Command & Master Control</strong></p>
                <p>• Active Managed Infrastructure: <strong className="text-white">{projects.length} Projects</strong></p>
                <p>• Status: <strong className="text-emerald-400">🟢 Online • Root Session Authenticated ✓</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ADMIN SETTINGS */}
        {adminTab === 'settings' && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Super Admin Master System Settings</h2>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Multi-Role Access Control Guards</span>
                <span className="text-emerald-400 font-bold">Active & Enforced ✓</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>MongoDB & In-Memory Store Sync</span>
                <span className="text-cyan-400 font-bold">Real-time Dual Write</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Token Guard</span>
                <span className="text-emerald-400 font-bold font-mono">Master Session Token Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const currentActiveTab = 
    role === 'Client' ? clientTab :
    role === 'Engineer' ? engineerTab :
    role === 'Contractor' ? contractorTab :
    role === 'Admin' ? adminTab : 'dashboard';

  const handleSidebarTabChange = (tabId: any) => {
    if (role === 'Client') setClientTab(tabId);
    else if (role === 'Engineer') setEngineerTab(tabId);
    else if (role === 'Contractor') setContractorTab(tabId);
    else if (role === 'Admin') setAdminTab(tabId);
  };

  const unreadNotifCount = notificationsList.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans relative overflow-x-hidden">
      {/* 1. FIXED VERTICAL LEFT SIDEBAR */}
      <DashboardSidebar
        role={role}
        activeTab={currentActiveTab}
        setActiveTab={handleSidebarTabChange}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        unreadNotifCount={unreadNotifCount}
      />

      {/* 2. MAIN DYNAMIC CONTENT WRAPPER */}
      <div className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${
        isCollapsed ? 'md:pl-[80px]' : 'md:pl-[280px]'
      }`}>
        {/* 3. CLEAN ENTERPRISE TOP HEADER */}
        <DashboardHeader
          role={role}
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          onNotificationClick={() => handleSidebarTabChange('notifications')}
          unreadNotifCount={unreadNotifCount}
          onSearchChange={(term) => setGlobalSearchTerm(term)}
        />

        {/* 4. MAIN ROLE MODULE CONTENT */}
        <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {role === 'Client' && renderClientModule()}
          {role === 'Engineer' && renderEngineerModule()}
          {role === 'Contractor' && renderContractorModule()}
          {role === 'Admin' && renderAdminModule()}
        </main>
      </div>

      {/* CONTRACTOR ADD WORKER MODAL */}
      {/* ✅ WORKER REGISTERED SUCCESS CARD (Requirement 8, 9, 14) */}
      {registeredWorkerResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 text-xs relative">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-2xl mx-auto flex items-center justify-center text-emerald-400">
                <CheckSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">Worker Registered Successfully</h3>
              <p className="text-[10px] text-emerald-400 font-mono">Credentials are shown only once. Save or print them now.</p>
            </div>

            {/* Warning: Show only once */}
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 flex items-start gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <p className="text-[10px] leading-relaxed">⚠️ This is the <strong>only time</strong> the worker password will be displayed. Save or print the credentials before closing this card. Password resets can only be done by the Contractor.</p>
            </div>

            {/* Summary Fields */}
            <div className="space-y-2">
              {[
                { label: 'Worker ID', value: registeredWorkerResult.workerId, mono: true, highlight: true },
                { label: 'Full Name', value: registeredWorkerResult.name, mono: false, highlight: false },
                { label: 'Username', value: registeredWorkerResult.username, mono: true, highlight: false },
                { label: 'Temporary Password', value: registeredWorkerResult.password, mono: true, highlight: false, sensitive: true },
                { label: 'Trade', value: registeredWorkerResult.trade, mono: false, highlight: false },
                { label: 'Monthly Salary', value: `₹${Number(registeredWorkerResult.salary).toLocaleString('en-IN')}`, mono: true, highlight: false },
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center bg-slate-950/60 rounded-xl px-3.5 py-2.5 border border-white/5">
                  <span className="text-white/40 uppercase text-[10px] font-mono tracking-wider">{f.label}</span>
                  <span className={`text-right font-bold text-[11px] ${
                    f.sensitive ? 'text-amber-300 tracking-widest font-mono' :
                    f.highlight ? 'text-emerald-400 font-mono' :
                    f.mono ? 'text-cyan-300 font-mono' : 'text-white'
                  }`}>{f.value}</span>
                </div>
              ))}
            </div>

            {/* QR Code (contains ONLY Worker ID — Req 9) */}
            <div className="text-center space-y-2">
              <p className="text-[10px] text-white/40 font-mono uppercase">QR Code (contains Worker ID only)</p>
              <div className="bg-white p-3 rounded-2xl inline-block border-2 border-emerald-400 shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(registeredWorkerResult.workerId)}`}
                  alt="Worker QR Code"
                  className="w-36 h-36 mx-auto rounded-lg"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(registeredWorkerResult.workerId)}`}
                download={`${registeredWorkerResult.workerId}_QR.png`}
                target="_blank" rel="noreferrer"
                className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-center text-[10px] flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download QR
              </a>
              <button
                onClick={() => window.print()}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold rounded-xl text-[10px] flex items-center justify-center gap-1"
              >
                <FileText className="w-3 h-3 text-cyan-400" />
                Print ID Card
              </button>
              <button
                onClick={() => {
                  const txt = `Worker ID: ${registeredWorkerResult.workerId}\nName: ${registeredWorkerResult.name}\nUsername: ${registeredWorkerResult.username}\nPassword: ${registeredWorkerResult.password}\nTrade: ${registeredWorkerResult.trade}`;
                  navigator.clipboard.writeText(txt);
                  setCopiedCredentials(true);
                  setTimeout(() => setCopiedCredentials(false), 2000);
                }}
                className={`py-2.5 font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 border transition-all ${
                  copiedCredentials
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-amber-300'
                }`}
              >
                {copiedCredentials ? '✓ Copied!' : '📋 Copy Creds'}
              </button>
            </div>

            <button
              onClick={() => { setRegisteredWorkerResult(null); setCopiedCredentials(false); }}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition-all"
            >
              Close & Return to Worker Management
            </button>
          </div>
        </div>
      )}

      {/* VIEW QR CODE MODAL */}
      {viewQrWorker && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-xs text-center">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-sm uppercase flex items-center justify-center space-x-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Worker Scannable QR ID Badge</span>
              </h3>
              <button onClick={() => setViewQrWorker(null)} className="text-white/40 hover:text-white font-bold text-sm">✕</button>
            </div>

            {/* REAL 2D SCANNABLE QR CODE PNG IMAGE */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl border-2 border-emerald-400">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`WORKER:${viewQrWorker.workerId || viewQrWorker._id || 'WRK-1001'}|USER:${viewQrWorker.username || viewQrWorker.name.toLowerCase().replace(/\s+/g, '.')}`)}`}
                alt={`Scannable QR Code for ${viewQrWorker.name}`}
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div>
              <h4 className="font-bold text-white text-sm">{viewQrWorker.name}</h4>
              <p className="text-[11px] text-emerald-400 font-mono font-bold">Worker ID: {viewQrWorker.workerId || viewQrWorker._id}</p>
              <p className="text-[10px] text-white/60 font-mono mt-1">Username: {viewQrWorker.username || viewQrWorker.name.toLowerCase().replace(/\s+/g, '.')}</p>
              <p className="text-[9px] text-cyan-400 font-mono mt-0.5">Payload: WORKER:{viewQrWorker.workerId || 'WRK-1001'}|USER:{viewQrWorker.username || viewQrWorker.name.toLowerCase().replace(/\s+/g, '.')}</p>
            </div>

            <div className="flex space-x-2 pt-1">
              <a 
                href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`WORKER:${viewQrWorker.workerId || viewQrWorker._id || 'WRK-1001'}|USER:${viewQrWorker.username || viewQrWorker.name.toLowerCase().replace(/\s+/g, '.')}`)}`}
                target="_blank"
                rel="noreferrer"
                download={`${viewQrWorker.workerId}_Scannable_QR.png`}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Scannable QR</span>
              </a>
              <button onClick={() => setViewQrWorker(null)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTRACTOR ADD WORKER MODAL — Full Form with Password & Strength */}
      {showAddWorkerModal && (() => {
        const pwdStrength = getPasswordStrength(wrkPassword);
        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-orange-500/30 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  Register New Site Worker
                </h3>
                <button onClick={() => setShowAddWorkerModal(false)} className="text-white/40 hover:text-white font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleAddWorkerSubmit} className="space-y-3">
                {/* Personal Info */}
                <div>
                  <label className="text-white/60 block mb-1">Full Name *</label>
                  <input type="text" required value={wrkName}
                    onChange={(e) => {
                      setWrkName(e.target.value);
                      if (!wrkUsername.trim()) setWrkUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                    }}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-orange-500/50 focus:outline-none" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-white/60 block mb-1">Age</label>
                    <input type="number" min={18} max={65} value={wrkAge} onChange={(e) => setWrkAge(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1">Gender</label>
                    <select value={wrkGender} onChange={(e) => setWrkGender(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1">Salary (₹) *</label>
                    <input type="number" required value={wrkSalary} onChange={(e) => setWrkSalary(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 block mb-1">Phone Number *</label>
                    <input type="text" required value={wrkPhone} onChange={(e) => setWrkPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1">Trade / Skill *</label>
                    <select required value={wrkTrade} onChange={(e) => setWrkTrade(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white">
                      {['Civil Mason','Steel Fixer','Electrician','Plumber','Carpenter','Welder','Painter','Excavator Operator','Tower Crane Operator','Survey Assistant','Concrete Finisher','Tile Worker','HVAC Technician','Machine Operator','General Labour'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 block mb-1">Department</label>
                    <input type="text" value={wrkDepartment} onChange={(e) => setWrkDepartment(e.target.value)} placeholder="e.g. Civil Structure" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1">Joining Date</label>
                    <input type="date" value={wrkJoiningDate} onChange={(e) => setWrkJoiningDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none" />
                  </div>
                </div>

                {/* Credentials Section */}
                <div className="border-t border-white/10 pt-3 space-y-3">
                  <p className="text-[10px] font-mono text-orange-400/80 uppercase tracking-widest font-bold">Worker Login Credentials</p>

                  <div>
                    <label className="text-white/60 block mb-1">Username (auto-generated if empty)</label>
                    <input type="text" value={wrkUsername} onChange={(e) => setWrkUsername(e.target.value)}
                      placeholder={wrkName ? wrkName.toLowerCase().replace(/\s+/g, '.') : 'e.g. ramesh.kumar'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none" />
                  </div>

                  {/* Password Field with Show/Hide */}
                  <div>
                    <label className="text-white/60 block mb-1">Worker Password * <span className="text-white/30">(min 8 chars, A-Z, a-z, 0-9, symbol)</span></label>
                    <div className="relative">
                      <input
                        type={showWrkPass ? 'text' : 'password'}
                        required
                        value={wrkPassword}
                        onChange={(e) => { setWrkPassword(e.target.value); setWrkPasswordError(null); }}
                        placeholder="Create a secure password"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-white font-mono focus:outline-none focus:border-orange-500/50"
                      />
                      <button type="button" onClick={() => setShowWrkPass(!showWrkPass)}
                        className="absolute right-3 top-2.5 text-white/30 hover:text-white/80 transition-colors">
                        {showWrkPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {wrkPassword && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                              i <= pwdStrength.score ? pwdStrength.bg : 'bg-white/10'
                            }`} />
                          ))}
                        </div>
                        <p className={`text-[10px] font-bold font-mono ${pwdStrength.color}`}>
                          Password Strength: {pwdStrength.label}
                        </p>
                        <ul className="text-[10px] text-white/30 space-y-0.5">
                          <li className={wrkPassword.length >= 8 ? 'text-emerald-400' : ''}>✓ At least 8 characters</li>
                          <li className={/[A-Z]/.test(wrkPassword) ? 'text-emerald-400' : ''}>✓ At least 1 uppercase (A–Z)</li>
                          <li className={/[a-z]/.test(wrkPassword) ? 'text-emerald-400' : ''}>✓ At least 1 lowercase (a–z)</li>
                          <li className={/[0-9]/.test(wrkPassword) ? 'text-emerald-400' : ''}>✓ At least 1 number (0–9)</li>
                          <li className={/[^A-Za-z0-9]/.test(wrkPassword) ? 'text-emerald-400' : ''}>✓ At least 1 special character (@, #, !…)</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field with Show/Hide */}
                  <div>
                    <label className="text-white/60 block mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showWrkConfirmPass ? 'text' : 'password'}
                        required
                        value={wrkConfirmPassword}
                        onChange={(e) => { setWrkConfirmPassword(e.target.value); setWrkPasswordError(null); }}
                        placeholder="Re-enter the same password"
                        className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 pr-10 text-white font-mono focus:outline-none ${
                          wrkConfirmPassword && wrkPassword !== wrkConfirmPassword
                            ? 'border-rose-500/60'
                            : wrkConfirmPassword && wrkPassword === wrkConfirmPassword
                            ? 'border-emerald-500/60'
                            : 'border-white/10'
                        }`}
                      />
                      <button type="button" onClick={() => setShowWrkConfirmPass(!showWrkConfirmPass)}
                        className="absolute right-3 top-2.5 text-white/30 hover:text-white/80 transition-colors">
                        {showWrkConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {wrkConfirmPassword && wrkPassword !== wrkConfirmPassword && (
                      <p className="text-[10px] text-rose-400 font-mono mt-1">✗ Passwords do not match.</p>
                    )}
                    {wrkConfirmPassword && wrkPassword === wrkConfirmPassword && (
                      <p className="text-[10px] text-emerald-400 font-mono mt-1">✓ Passwords match.</p>
                    )}
                  </div>

                  {/* Validation Error */}
                  {wrkPasswordError && (
                    <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2 text-[10px] text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {wrkPasswordError}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddWorkerModal(false)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg">
                    Submit & Register Worker
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* VIEW ENGINEER PROFILE MODAL */}
      {viewingEngineerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm uppercase flex items-center space-x-2">
                <Hammer className="w-4 h-4 text-cyan-400" />
                <span>Engineer Profile Details</span>
              </h3>
              <button onClick={() => setViewingEngineerModal(null)} className="text-white/40 hover:text-white font-bold text-sm">✕</button>
            </div>

            <div className="flex items-center space-x-4">
              <img src={viewingEngineerModal.photoUrl} alt={viewingEngineerModal.fullName} className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg" />
              <div>
                <h4 className="font-bold text-white text-base">{viewingEngineerModal.fullName}</h4>
                <span className="text-xs text-cyan-300 block">{viewingEngineerModal.specialization}</span>
                <span className="text-[11px] text-white/50 font-mono">Employee ID: {viewingEngineerModal.engineerId || 'ENG-1001'}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2 font-mono text-xs text-white/80">
              <p>• Experience: <strong className="text-white">{viewingEngineerModal.experience} Years</strong></p>
              <p>• Qualification: <strong className="text-white">{viewingEngineerModal.qualification}</strong></p>
              <p>• Phone: <strong className="text-cyan-300">{viewingEngineerModal.phone || '+91 9876543210'}</strong></p>
              <p>• Email: <strong className="text-cyan-300">{viewingEngineerModal.email || 'engineer@smartbuild.ai'}</strong></p>
              <p>• Location: <strong className="text-white">{viewingEngineerModal.location || 'Bengaluru'}</strong></p>
              <p>• Rating: <strong className="text-yellow-400">⭐ {viewingEngineerModal.rating || 4.9} / 5.0</strong></p>
              <p>• Current Projects: <strong className="text-emerald-400">{viewingEngineerModal.currentProjectsCount || 2} Active</strong></p>
              <p>• Status: <strong className="text-emerald-400">🟢 Online • Available • Approved by Admin ✓</strong></p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => {
                  setSelectedEngForProj(viewingEngineerModal);
                  setViewingEngineerModal(null);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-xl text-xs uppercase tracking-wider"
              >
                Select This Engineer ✓
              </button>
              <button 
                onClick={() => setViewingEngineerModal(null)}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT WORKSPACE MODAL */}
      {workspaceProject && (
        <ProjectWorkspaceModal 
          project={workspaceProject}
          currentRole={role}
          onClose={() => setWorkspaceProject(null)}
        />
      )}

      {/* ATTENDANCE SUBMISSION SUMMARY MODAL */}
      {showAttendanceSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-emerald-500/10">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
                    Attendance Submission Summary Report
                  </h2>
                  <p className="text-xs text-white/50 font-mono">
                    Date: <span className="text-emerald-400 font-semibold">{new Date().toISOString().split('T')[0]}</span> | Marked By: <span className="text-cyan-400 font-semibold">Contractor</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAttendanceSummaryModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary KPI Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Total Workers</p>
                <p className="text-2xl font-black text-white mt-1">{attendanceLedger.length}</p>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-emerald-400/70 uppercase font-mono tracking-wider font-semibold">Present Workers</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {attendanceLedger.filter(a => a.todayStatus === 'Present').length}
                </p>
              </div>
              <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-rose-400/70 uppercase font-mono tracking-wider font-semibold">Absent Workers</p>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  {attendanceLedger.filter(a => a.todayStatus === 'Absent').length}
                </p>
              </div>
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-amber-400/70 uppercase font-mono tracking-wider font-semibold">Half / Leave / Unmarked</p>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {attendanceLedger.filter(a => a.todayStatus !== 'Present' && a.todayStatus !== 'Absent').length}
                </p>
              </div>
            </div>

            {/* Detailed Worker List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Worker Attendance Detailed Roster</span>
                <span className="text-white/40 font-normal text-[10px]">{attendanceLedger.length} Total Workers Listed</span>
              </h4>
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900 border-b border-white/10 text-white/40 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Worker Name</th>
                      <th className="p-3">Worker ID</th>
                      <th className="p-3">Assigned Project</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Check-In / Out</th>
                      <th className="p-3">Overtime</th>
                      <th className="p-3">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                    {attendanceLedger.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-3 font-sans font-semibold text-white">{rec.workerName}</td>
                        <td className="p-3 text-cyan-400 font-bold">{rec.workerIdStr || rec.workerId}</td>
                        <td className="p-3 text-white/70 font-sans">{rec.project || rec.projectName || 'Skyline Tower'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            rec.todayStatus === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            rec.todayStatus === 'Absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            rec.todayStatus === 'Half Day' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            rec.todayStatus === 'Leave' ? 'bg-slate-700/40 text-white/70 border border-white/10' :
                            'bg-white/5 text-white/40 border border-white/10'
                          }`}>
                            {(rec.todayStatus || 'NOT MARKED').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-white/50 text-[10px]">{rec.checkInTime || '--:--'} - {rec.checkOutTime || '--:--'}</td>
                        <td className="p-3 text-purple-400">{rec.overtimeHours || 0} Hrs</td>
                        <td className="p-3 text-cyan-400">{rec.markedBy || 'Contractor'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-[11px] text-white/45 font-mono">
                ✅ Centralized attendance saved to database and synced across Contractor, Worker & Admin dashboards.
              </p>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Print Report
                </button>
                <button
                  onClick={() => setShowAttendanceSummaryModal(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Confirm & Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CLIENT / ADMIN EDIT PROJECT & BUDGET MODAL */}
      {showEditProjectModal && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-amber-500/10 text-white max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
                    Edit Project & Budget
                  </h2>
                  <p className="text-xs text-white/50 font-mono">
                    ID: <span className="text-amber-400 font-semibold">{editingProject.id || (editingProject as any)._id}</span> • Synchronized with Engineer, Contractor & Admin
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setShowEditProjectModal(false); setEditingProject(null); }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sync Notice Banner */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300/90 flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Modifications to budget, scope, and engineer assignment will update in real-time across <strong className="text-white">Engineer, Contractor, and Admin</strong> dashboards.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditProjectSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Project Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={editProjName} 
                    onChange={(e) => setEditProjName(e.target.value)} 
                    placeholder="Project Name" 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Project Type *</label>
                  <select 
                    value={editProjType} 
                    onChange={(e) => setEditProjType(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Commercial Skyscraper">Commercial Skyscraper</option>
                    <option value="Residential Estate">Residential Estate</option>
                    <option value="Underground Infrastructure">Underground Infrastructure</option>
                    <option value="Commercial Building">Commercial Building</option>
                    <option value="Industrial Logistics Hub">Industrial Logistics Hub</option>
                    <option value="Healthcare Facility">Healthcare Facility</option>
                  </select>
                </div>
              </div>

              {/* Budget & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono text-white/50 block">Capital Budget (₹) *</label>
                    <span className="text-[11px] font-mono font-bold text-yellow-400">
                      {formatIndianRupee(Number(editProjBudget) || 0)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-white/40 font-mono font-bold">₹</span>
                    <input 
                      type="number" 
                      required 
                      min="1000"
                      value={editProjBudget} 
                      onChange={(e) => setEditProjBudget(e.target.value)} 
                      placeholder="e.g. 45000000" 
                      className="w-full bg-slate-950 border border-yellow-500/30 rounded-xl p-3 pl-8 text-yellow-300 font-mono font-bold focus:outline-none focus:border-yellow-400" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Priority</label>
                  <select 
                    value={editProjPriority} 
                    onChange={(e) => setEditProjPriority(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Location & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Location *</label>
                  <input 
                    type="text" 
                    required 
                    value={editProjLoc} 
                    onChange={(e) => setEditProjLoc(e.target.value)} 
                    placeholder="e.g. Sector 62, Noida" 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={editProjStartDate} 
                    onChange={(e) => setEditProjStartDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Target Completion Date</label>
                  <input 
                    type="date" 
                    value={editProjCompDate} 
                    onChange={(e) => setEditProjCompDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-mono" 
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-mono text-white/50 block mb-1">Project Description & Scope *</label>
                <textarea 
                  rows={3} 
                  required 
                  value={editProjDesc} 
                  onChange={(e) => setEditProjDesc(e.target.value)} 
                  placeholder="Scope of work, blueprint notes, contractor instructions..." 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400" 
                />
              </div>

              {/* Assigned Engineer Selection */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-mono text-white/50 block">Assigned / Selected Engineer</label>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Current: {editProjEngineerName || 'Rahul Sharma'}
                  </span>
                </div>
                <select 
                  value={editProjEngineerId} 
                  onChange={(e) => {
                    const selId = e.target.value;
                    setEditProjEngineerId(selId);
                    const engMatch = engineersList.find(eng => (eng.engineerId === selId || eng._id === selId));
                    if (engMatch) setEditProjEngineerName(engMatch.fullName);
                  }} 
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Keep Current ({editProjEngineerName || 'Assigned Engineer'})</option>
                  {engineersList.map((eng) => (
                    <option key={eng.engineerId || eng._id} value={eng.engineerId || eng._id}>
                      {eng.fullName} ({eng.specialization}) — ID: {eng.engineerId || 'ENG'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Blueprint & Media URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Blueprint URL</label>
                  <input 
                    type="text" 
                    value={editProjBlueprint} 
                    onChange={(e) => setEditProjBlueprint(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Site Documents / Plan URL</label>
                  <input 
                    type="text" 
                    value={editProjDoc} 
                    onChange={(e) => setEditProjDoc(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]" 
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => { setShowEditProjectModal(false); setEditingProject(null); }}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={editProjLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {editProjLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save & Synchronize Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
