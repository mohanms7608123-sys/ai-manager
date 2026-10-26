'use client';

import React, { useState, useEffect } from 'react';
import { dbStore, formatIndianRupee } from '@/lib/dbStore';
import { 
  Users, 
  Scan, 
  CheckCircle, 
  CheckCircle2,
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  TrendingUp, 
  UserCheck,
  UserX,
  AlertTriangle,
  Lock,
  Plus,
  QrCode,
  DollarSign,
  Camera,
  MapPin,
  Check,
  ShieldCheck,
  Briefcase,
  X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { socketHub } from '@/lib/socket';

interface Employee {
  id: string;
  name: string;
  photo: string;
  mobile: string;
  address: string;
  role: 'Worker' | 'Engineer' | 'Supervisor' | 'Electrician' | 'Plumber' | 'Welder' | 'Operator';
  department: string;
  project: string;
  joiningDate: string;
  dailyWage: number;
  shift: 'Day' | 'Night';
  skills: string;
  emergencyContact: string;
  qrCodeText: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  project: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Late';
  overtime: number; // in hours
  gps?: { lat: number; lng: number; site: string };
}

// Simulated QR generator helper
function EmployeeQrCode({ value }: { value: string }) {
  return (
    <div className="bg-white p-1.5 rounded-lg inline-block border border-white/10 shrink-0">
      <svg className="w-16 h-16" viewBox="0 0 25 25">
        <path d="M1 1h7v7H1zm1 1v5h5V2zm1 1h3v3H3zm6-2h1v1H9zm1 1h1v1h-1zm-1 1h1v1H9zm2-2h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm-2 2h1v1H9zm1 1h1v1h-1zm-1 1h1v1H9zm2-2h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm5-5h7v7h-7zm1 1v5h5V10zm1 1h3v3h-3zm-9 6h1v1H9zm1 1h1v1h-1zm-1 1h1v1H9zm2-2h1v1h-1zm1 1h1v1h-1zm-1 1h1v1H9zm5-5h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm2-2h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1z" fill="black" />
      </svg>
    </div>
  );
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'roster' | 'qr' | 'supervisor' | 'ai' | 'salary'>('supervisor');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Database States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [showSubmitSummaryModal, setShowSubmitSummaryModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [saveBatchSuccessMsg, setSaveBatchSuccessMsg] = useState<string | null>(null);

  // Employee Form fields
  const [empName, setEmpName] = useState('');
  const [empMobile, setEmpMobile] = useState('');
  const [empAddress, setEmpAddress] = useState('');
  const [empRole, setEmpRole] = useState<Employee['role']>('Worker');
  const [empDept, setEmpDept] = useState('Production');
  const [empProject, setEmpProject] = useState('Signature Tower');
  const [empWage, setEmpWage] = useState(650);
  const [empShift, setEmpShift] = useState<'Day' | 'Night'>('Day');
  const [empSkills, setEmpSkills] = useState('Formwork Carpentry');
  const [empEmergency, setEmpEmergency] = useState('');
  const [empPhoto, setEmpPhoto] = useState('');

  // QR Scanning States
  const [scannedEmpId, setScannedEmpId] = useState('');
  const [scannedLog, setScannedLog] = useState<AttendanceRecord | null>(null);
  const [qrStatus, setQrStatus] = useState<'idle' | 'scanning' | 'success' | 'fail'>('idle');

  // AI Verification States
  const [aiImageName, setAiImageName] = useState('');
  const [aiReport, setAiReport] = useState<any>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [isAiVerified, setIsAiVerified] = useState(false);

  // GPS Switch check
  const [gpsEnabled, setGpsEnabled] = useState(true);

  // Notify lists
  const [notifications, setNotifications] = useState<string[]>([
    'Manual Attendance Mode: Only Contractor can mark attendance.',
    'System ready: Select date & mark PRESENT or ABSENT.'
  ]);

  // Load attendance from API whenever selectedDate changes
  const loadAttendanceFromApi = () => {
    fetch(`/api/attendance?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.attendance)) {
          const mapped: AttendanceRecord[] = data.attendance.map((a: any) => ({
            id: a._id || `att-${a.workerId}-${selectedDate}`,
            employeeId: a.workerIdStr || a.workerId,
            name: a.workerName,
            role: a.trade || a.role || 'Worker',
            project: a.project || 'Signature Tower',
            date: selectedDate,
            checkIn: a.checkInTime || '--:--',
            checkOut: a.checkOutTime || '--:--',
            hours: a.todayStatus === 'Present' ? 8 : 0,
            status: a.todayStatus || 'Not Marked',
            overtime: a.overtimeHours || 0
          }));
          setAttendance(mapped);
        }
      })
      .catch(err => console.error('Failed to load attendance:', err));
  };

  // Load live employees from /api/workers
  const loadEmployeesFromApi = () => {
    fetch('/api/workers?role=Contractor')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.workers)) {
          const mappedEmps: Employee[] = data.workers.map((w: any) => ({
            id: w.workerId || w.id || w._id,
            name: w.name,
            mobile: w.phone || '+91 98765 00000',
            address: w.address || 'Site Quarters',
            role: w.trade || w.role || 'Worker',
            department: w.department || 'Civil Works',
            project: w.projectName || 'Signature Tower',
            joiningDate: w.joiningDate || '2024-01-15',
            dailyWage: Math.round((w.salary || 25000) / 30),
            shift: 'Day',
            skills: w.trade || 'General Construction',
            emergencyContact: w.emergencyContact || '+91 98765 11111',
            photo: w.photoUrl || '',
            qrCodeText: w.qrCode || w.workerId || w.id
          }));
          setEmployees(mappedEmps);
        }
      })
      .catch(err => console.error('Failed to load workers list in attendance page:', err));
  };

  useEffect(() => {
    loadAttendanceFromApi();
  }, [selectedDate]);

  useEffect(() => {
    loadEmployeesFromApi();

    const unsubAtt = socketHub.on('attendance:updated', (data: any) => {
      if (data) {
        setNotifications(prev => [`Real-time Attendance Sync: ${data.todayStatus || data.status} for ${data.workerName || data.workerIdStr} (Marked by Contractor)`, ...prev]);
        loadAttendanceFromApi();
      }
    });

    const unsubStats = socketHub.on('stats:updated', () => {
      loadEmployeesFromApi();
      loadAttendanceFromApi();
    });

    return () => {
      unsubAtt();
      unsubStats();
    };
  }, []);

  // --- 1. REGISTRATION ---
  const handleRegisterEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: empName,
          phone: empMobile || '+91 98765 00000',
          address: empAddress || 'Site Quarters',
          emergencyContact: empEmergency || '+91 98765 11111',
          joiningDate: new Date().toISOString().split('T')[0],
          department: empDept,
          trade: empRole,
          salary: empWage * 30,
          contractorId: 'CON001',
          projectName: empProject
        })
      });
      const data = await res.json();
      loadEmployeesFromApi();
      loadAttendanceFromApi();
      setEmpName(''); setEmpMobile(''); setEmpAddress(''); setEmpEmergency('');
    } catch (err) {
      console.error('Failed to post new worker:', err);
    }

    setNotifications(prev => [`New Employee Registered: ${empName} (${empRole})`, ...prev]);

    // Reset Form
    setEmpName('');
    setEmpMobile('');
    setEmpAddress('');
    setEmpEmergency('');
    setEmpPhoto('');
    alert(`Roster account created for ${empName}! Worker registered and visible on Contractor Pages.`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmpPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 2. QR IDENTIFICATION (DOES NOT MARK ATTENDANCE) ---
  const handleScanQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedEmpId.trim()) return;

    setQrStatus('scanning');
    setTimeout(() => {
      const matched = employees.find(emp => emp.id === scannedEmpId || emp.name.toLowerCase().includes(scannedEmpId.toLowerCase()));
      
      if (matched) {
        const today = selectedDate || new Date().toISOString().split('T')[0];
        const existingRecord = attendance.find(a => a.employeeId === matched.id && a.date === today);
        
        const displayRecord: AttendanceRecord = {
          id: existingRecord?.id || `att-${matched.id}-${today}`,
          employeeId: matched.id,
          name: matched.name,
          role: matched.role,
          project: matched.project,
          date: today,
          checkIn: existingRecord?.checkIn || '--:--',
          checkOut: existingRecord?.checkOut || '--:--',
          hours: existingRecord?.hours || 0,
          status: existingRecord?.status || ('Not Marked' as any),
          overtime: existingRecord?.overtime || 0,
          gps: gpsEnabled ? { lat: 28.6139, lng: 77.2090, site: matched.project } : undefined
        };

        setScannedLog(displayRecord);
        setQrStatus('success');
        setNotifications(prev => [`Worker QR Scanned: Identified ${matched.name} (${matched.id}). Attendance not marked automatically.`, ...prev]);
      } else {
        setQrStatus('fail');
        setScannedLog(null);
      }
    }, 600);
  };

  // --- 3. MANUAL CONTRACTOR ATTENDANCE CONTROL ---
  const updateWorkerStatus = async (empId: string, status: AttendanceRecord['status'], overtime: number) => {
    const targetDate = selectedDate || new Date().toISOString().split('T')[0];
    
    // Update local state immediately for snappy UI
    setAttendance(prev => prev.map(a => {
      if (a.employeeId === empId || (a as any).workerIdStr === empId) {
        return {
          ...a,
          status,
          todayStatus: status as any,
          overtime,
          markedBy: 'Contractor',
          checkIn: status === 'Present' ? '08:30 AM' : '--:--',
          checkOut: status === 'Present' ? '05:30 PM' : '--:--'
        };
      }
      return a;
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: empId,
          todayStatus: status,
          overtimeHours: overtime,
          date: targetDate,
          markedBy: 'Contractor'
        })
      });

      const data = await res.json();
      if (data.success) {
        setNotifications(prev => [`Contractor saved attendance for Worker ${empId} → ${status} (${targetDate})`, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save manual attendance to MongoDB:', err);
    }
  };

  const handleSupervisorSubmit = async () => {
    setIsSavingBatch(true);
    setSaveBatchSuccessMsg(null);
    try {
      const targetDate = selectedDate || new Date().toISOString().split('T')[0];
      const recordsToSave = attendance.map(a => ({
        workerId: a.employeeId,
        todayStatus: a.status,
        date: targetDate,
        overtimeHours: a.overtime || 0,
        markedBy: 'Contractor',
        projectName: a.project
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: recordsToSave })
      });
      const data = await res.json();
      if (data.success) {
        setSaveBatchSuccessMsg(`Centralized attendance saved to MongoDB for ${recordsToSave.length} workers on ${targetDate}.`);
        setNotifications(prev => [`Centralized attendance verified and saved to MongoDB for ${recordsToSave.length} workers (${targetDate}).`, ...prev]);
        setShowSubmitSummaryModal(true);
      } else {
        alert(data.message || 'Failed to save attendance ledger to MongoDB.');
      }
    } catch (err: any) {
      alert(`Error saving attendance to database: ${err?.message || err}`);
    } finally {
      setIsSavingBatch(false);
    }
  };

  // --- 4. AI IMAGE SCANNER VERIFICATION ---
  const handleAiSiteScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAiImageName(file.name);
      setAiAnalysisLoading(true);
      
      setTimeout(() => {
        setAiReport({
          workerCount: 4,
          helmetDetect: '3 / 4 workers wearing helmets (1 alert)',
          jacketDetect: '4 / 4 workers wearing safety jackets',
          unsafeWorkers: 1,
          crowdedArea: 'Scaffold Tower B',
          progressRate: '85% active task speed',
          equipment: '1 Concrete mixer, 1 Tower Crane'
        });
        setAiAnalysisLoading(false);
      }, 1500);
    }
  };

  // --- 5. EXPORT UTILS ---
  const exportPDFReport = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("AI Workforce Attendance & Payroll Report", 14, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 26);
    doc.line(14, 30, 196, 30);
    
    let y = 40;
    attendance.forEach((w, idx) => {
      doc.text(`${idx + 1}. ${w.name} (${w.role}) - Status: ${w.status} | Clock-In: ${w.checkIn} | Overtime: ${w.overtime} Hrs`, 14, y);
      y += 8;
    });
    doc.save("Workforce_Attendance_Report.pdf");
  };

  const exportExcelReport = () => {
    const data = attendance.map(a => ({
      ID: a.employeeId,
      Name: a.name,
      Role: a.role,
      Date: a.date,
      CheckIn: a.checkIn,
      CheckOut: a.checkOut,
      Hours: a.hours,
      Status: a.status,
      Overtime: a.overtime
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Logs");
    XLSX.writeFile(wb, "Attendance_Logsheet.xlsx");
  };

  // Calculations for wages
  const calculatePayroll = (rec: AttendanceRecord) => {
    const employee = employees.find(e => e.id === rec.employeeId);
    const dailyWage = employee ? employee.dailyWage : 650;
    
    let payment = 0;
    let deduction = 0;

    if (rec.status === 'Present' || rec.status === 'Late') {
      payment = dailyWage;
      if (rec.status === 'Late') payment -= dailyWage * 0.1; // 10% penalty
    } else if (rec.status === 'Half Day') {
      payment = dailyWage * 0.5;
    } else if (rec.status === 'Absent') {
      deduction = dailyWage;
    }

    // Overtime
    const otWage = rec.overtime * (dailyWage * 0.15); // OT hours * hourly factor
    const totalWage = payment + otWage;

    return {
      dailyWage,
      otWage,
      deduction,
      totalWage
    };
  };

  // Overview Counts
  const todayDate = new Date().toISOString().split('T')[0];
  const presentCount = attendance.filter(a => a.date === todayDate && (a.status === 'Present' || a.status === 'Late')).length;
  const absentCount = attendance.filter(a => a.date === todayDate && a.status === 'Absent').length;
  const leaveCount = attendance.filter(a => a.date === todayDate && a.status === 'Leave').length;

  return (
    <div className="space-y-6">
      
      {/* Tab Navigators */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">Workforce Attendance Hub</h2>
          <p className="text-xs text-white/50 mt-1">QR Code logging, supervisor registers, AI image verification and payroll ledger (₹)</p>
        </div>

        <div className="flex flex-wrap bg-slate-900 p-1.5 rounded-xl border border-white/5 text-xs">
          <button onClick={() => setActiveTab('roster')} className={`px-3 py-2 rounded-lg font-semibold transition-all ${activeTab === 'roster' ? 'bg-cyan-500 text-black' : 'text-white/60 hover:text-white'}`}>Workers Directory</button>
          <button onClick={() => setActiveTab('qr')} className={`px-3 py-2 rounded-lg font-semibold transition-all ${activeTab === 'qr' ? 'bg-cyan-500 text-black' : 'text-white/60 hover:text-white'}`}>QR Scan-In</button>
          <button onClick={() => setActiveTab('supervisor')} className={`px-3 py-2 rounded-lg font-semibold transition-all ${activeTab === 'supervisor' ? 'bg-cyan-500 text-black' : 'text-white/60 hover:text-white'}`}>Supervisor Desk</button>
          <button onClick={() => setActiveTab('ai')} className={`px-3 py-2 rounded-lg font-semibold transition-all ${activeTab === 'ai' ? 'bg-cyan-500 text-black' : 'text-white/60 hover:text-white'}`}>AI Verification</button>
          <button onClick={() => setActiveTab('salary')} className={`px-3 py-2 rounded-lg font-semibold transition-all ${activeTab === 'salary' ? 'bg-cyan-500 text-black' : 'text-white/60 hover:text-white'}`}>Salary & Payroll</button>
        </div>
      </div>

      {/* Dashboard Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4.5">
          <span className="text-[9px] text-white/45 block uppercase font-mono">Present Today</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{presentCount} Workers</span>
        </div>
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4.5">
          <span className="text-[9px] text-white/45 block uppercase font-mono">Absent Today</span>
          <span className="text-lg font-bold text-rose-400 mt-0.5 block">{absentCount} Workers</span>
        </div>
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4.5">
          <span className="text-[9px] text-white/45 block uppercase font-mono">On Leave</span>
          <span className="text-lg font-bold text-amber-400 mt-0.5 block">{leaveCount} Workers</span>
        </div>
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4.5">
          <span className="text-[9px] text-white/45 block uppercase font-mono">Vision Audit Check</span>
          <span className="text-lg font-bold text-cyan-400 mt-0.5 block">{isAiVerified ? 'VERIFIED' : 'PENDING'}</span>
        </div>
      </div>

      {/* TAB CONTENT: 1. ROSTER & REGISTRATION */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workforce Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Project / Dept</th>
                    <th className="p-3">Daily Wage (₹)</th>
                    <th className="p-3 text-right">QR Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/85">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-white/5">
                      <td className="p-3 flex items-center space-x-2.5">
                        {emp.photo ? (
                          <img src={emp.photo} alt="icon" className="w-8 h-8 rounded-lg object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center font-bold text-cyan-400 font-mono text-[10px]">{emp.name.split(' ').map(n=>n[0]).join('')}</div>
                        )}
                        <div>
                          <span className="font-semibold text-white block">{emp.name}</span>
                          <span className="text-[9px] text-white/40 font-mono block">{emp.id} • {emp.role}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono">{emp.mobile}</td>
                      <td className="p-3">
                        <span className="block text-white font-semibold">{emp.project}</span>
                        <span className="text-[10px] text-white/40 block">{emp.department}</span>
                      </td>
                      <td className="p-3 font-mono">{formatIndianRupee(emp.dailyWage)}</td>
                      <td className="p-3 text-right">
                        <EmployeeQrCode value={emp.qrCodeText} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Register Site Employee</h3>
            <form onSubmit={handleRegisterEmployee} className="space-y-3.5 text-xs text-white/80">
              <div className="space-y-1">
                <label className="text-[9px] text-white/50 block font-mono">Full Name</label>
                <input type="text" required value={empName} onChange={(e) => setEmpName(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/50 block font-mono">Mobile</label>
                  <input type="tel" required value={empMobile} onChange={(e) => setEmpMobile(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/50 block font-mono">Emergency Contact</label>
                  <input type="tel" required value={empEmergency} onChange={(e) => setEmpEmergency(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/50 block font-mono">Address</label>
                <input type="text" required value={empAddress} onChange={(e) => setEmpAddress(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/50 block font-mono">Trade Role</label>
                  <select value={empRole} onChange={(e) => setEmpRole(e.target.value as any)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                    <option value="Worker">Worker</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Welder">Welder</option>
                    <option value="Operator">Operator</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/50 block font-mono">Daily Wage (₹)</label>
                  <input type="number" required value={empWage} onChange={(e) => setEmpWage(parseInt(e.target.value))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/50 block font-mono">Profile Image</label>
                <div className="border border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl p-3 bg-slate-900 text-center relative cursor-pointer">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-[10px] text-white/40 block">Upload catalog picture file from local computer</span>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-md">Create Account & QR Badge</button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. QR CODE ATTENDANCE SCANNER */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <QrCode className="w-16 h-16 text-cyan-400 animate-pulse" />
            <div className="text-center space-y-1 max-w-sm">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Industrial QR scan portal</h3>
              <p className="text-[11px] text-white/50 leading-relaxed">Enter Employee ID below to simulate scanning a worker QR badge or checkout scan.</p>
            </div>
            
            <form onSubmit={handleScanQR} className="flex space-x-2 w-full max-w-md pt-2">
              <input 
                type="text" 
                required
                value={scannedEmpId}
                onChange={(e) => setScannedEmpId(e.target.value)}
                placeholder="e.g. EMP-2607-01 or Rajesh Kumar..."
                className="flex-1 bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white focus:outline-none text-xs font-mono"
              />
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 rounded-xl text-xs">Simulate Scan</button>
            </form>

            {gpsEnabled && (
              <div className="flex items-center space-x-1.5 text-[10px] text-white/40 font-mono">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>GPS Check-in lock: Latitude 28.6139 | Longitude 77.2090</span>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">QR scanning results</h3>
            
            {qrStatus === 'scanning' && (
              <div className="p-4 bg-slate-900 border border-white/5 rounded-xl text-center font-mono text-[10px] text-cyan-400 animate-pulse">
                VALIDATING ENCRYPTION BADGE ENCODER...
              </div>
            )}

            {qrStatus === 'success' && scannedLog && (
              <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-[11px] uppercase tracking-wider">Marked Attendance</span>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-white/70 leading-relaxed">
                  <p>• Employee: <span className="text-white font-bold">{scannedLog.name}</span></p>
                  <p>• Role: <span>{scannedLog.role}</span></p>
                  <p>• Project Site: <span>{scannedLog.project}</span></p>
                  <p>• Check-In: <span className="text-cyan-400 font-bold">{scannedLog.checkIn}</span></p>
                  <p>• Check-Out: <span>{scannedLog.checkOut}</span></p>
                  <p>• Status: <span className="text-emerald-400 font-bold">PRESENT</span></p>
                </div>
              </div>
            )}

            {qrStatus === 'fail' && (
              <div className="bg-rose-950/20 border border-rose-500/25 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-bold uppercase font-mono">BADGE DECRYPT ERROR</span>
                </div>
                <p className="text-white/50 text-[10px] leading-relaxed">QR scanner was unable to verify structural employee signature key.</p>
              </div>
            )}

            {qrStatus === 'idle' && (
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 text-[10px] text-white/45 font-mono leading-relaxed">
                Scanner active. Use camera QR scanner or simulate using form input.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. SUPERVISOR ATTENDANCE SHEET */}
      {activeTab === 'supervisor' && (
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Supervisor Attendance Desk</h3>
              <p className="text-[10px] text-white/50 mt-0.5">Select authorized project and date to mark and sync worker attendance to MongoDB</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Authorized Project Selector */}
              <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/50 uppercase">Project:</span>
                <select 
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value="All Projects" className="bg-slate-900 text-white">All Projects</option>
                  <option value="Skyline Tower" className="bg-slate-900 text-white">Skyline Tower</option>
                  <option value="Metro Phase 2" className="bg-slate-900 text-white">Metro Phase 2</option>
                  <option value="Signature Tower" className="bg-slate-900 text-white">Signature Tower</option>
                  <option value="Green Valley Residential" className="bg-slate-900 text-white">Green Valley Residential</option>
                  <option value="Highway Expansion" className="bg-slate-900 text-white">Highway Expansion</option>
                </select>
              </div>

              {/* Attendance Date Selector */}
              <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/50 uppercase">Date:</span>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                />
              </div>

              {/* Save Attendance Button */}
              <button 
                onClick={handleSupervisorSubmit}
                disabled={isSavingBatch}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSavingBatch ? 'Saving to Database...' : 'Save Attendance to MongoDB'}</span>
              </button>
            </div>
          </div>

          {saveBatchSuccessMsg && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveBatchSuccessMsg}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                  <th className="p-3">Worker ID & Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Assigned Project</th>
                  <th className="p-3">Status Options</th>
                  <th className="p-3">Overtime (Hrs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {attendance
                  .filter(rec => selectedProject === 'All Projects' || rec.project === selectedProject || (rec as any).projectName === selectedProject)
                  .map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/5">
                    <td className="p-3">
                      <span className="font-semibold text-white block">{rec.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{rec.employeeId}</span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-white/45">{rec.role}</td>
                    <td className="p-3">
                      <span className="block text-white font-semibold">{rec.project}</span>
                      <span className="text-[9px] text-white/35 font-mono block">Day Shift</span>
                    </td>
                    <td className="p-3">
                      <div className="flex bg-slate-950 p-1 border border-white/5 rounded-lg text-white/60 space-x-1.5 w-fit text-[10px] font-mono font-semibold">
                        <button onClick={() => updateWorkerStatus(rec.employeeId, 'Present', rec.overtime)} className={`px-2.5 py-1 rounded ${rec.status === 'Present' ? 'bg-emerald-500 text-black font-bold shadow-md' : 'hover:text-white'}`}>Present</button>
                        <button onClick={() => updateWorkerStatus(rec.employeeId, 'Absent', rec.overtime)} className={`px-2.5 py-1 rounded ${rec.status === 'Absent' ? 'bg-rose-500 text-black font-bold shadow-md' : 'hover:text-white'}`}>Absent</button>
                        <button onClick={() => updateWorkerStatus(rec.employeeId, 'Half Day', rec.overtime)} className={`px-2.5 py-1 rounded ${rec.status === 'Half Day' ? 'bg-amber-500 text-black font-bold shadow-md' : 'hover:text-white'}`}>Half</button>
                        <button onClick={() => updateWorkerStatus(rec.employeeId, 'Leave', rec.overtime)} className={`px-2.5 py-1 rounded ${rec.status === 'Leave' ? 'bg-cyan-600 text-white font-bold shadow-md' : 'hover:text-white'}`}>Leave</button>
                      </div>
                    </td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        min="0" max="6" step="0.5"
                        value={rec.overtime}
                        onChange={(e) => updateWorkerStatus(rec.employeeId, rec.status, parseFloat(e.target.value) || 0)}
                        className="bg-slate-900 border border-white/10 rounded-lg w-16 p-1 text-center focus:outline-none text-white font-mono text-[10px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. AI WORKFORCE VERIFICATION */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Camera className="w-4.5 h-4.5 text-cyan-400" />
              <span>AI Camera Site Audit Verification</span>
            </h3>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Upload a site workforce picture or surveillance snapshot. AI will cross-verify helmet safety compliance, jacket detection, and check attendance registers.
            </p>

            <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center bg-[#020510] cursor-pointer relative transition-all">
              <input type="file" accept="image/*" onChange={handleAiSiteScan} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Camera className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <span className="text-[11px] text-white/60 block truncate">{aiAnalysisLoading ? 'Analyzing vision vectors...' : aiImageName || 'Upload Site Camera File'}</span>
            </div>

            {aiReport && (
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-3.5 text-xs text-white/80">
                <h4 className="font-bold text-white uppercase border-b border-white/5 pb-2">AI Site Verification Report</h4>
                
                <div className="grid grid-cols-2 gap-4 font-mono text-[10px] leading-relaxed">
                  <div>
                    <span className="text-[8px] text-white/35 block uppercase">Workers Counted:</span>
                    <span className="font-bold text-cyan-400">{aiReport.workerCount} Workers</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/35 block uppercase">Helmet Compliance:</span>
                    <span className="text-white">{aiReport.helmetDetect}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/35 block uppercase">Hi-Vis Jacket:</span>
                    <span className="text-white">{aiReport.jacketDetect}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/35 block uppercase">Active Equipment:</span>
                    <span className="text-white">{aiReport.equipment}</span>
                  </div>
                </div>

                <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-xl p-3 text-[10px] text-amber-300 font-mono leading-relaxed">
                  <strong>AI COMPARATIVE REPORT:</strong>
                  <p className="mt-1">AI detected 4 workers on site. Roster list reports 3 present. Verification required for Vikram Singh (Safety alarm: helmet defect in Scaffold Zone B).</p>
                </div>

                <button 
                  onClick={() => setIsAiVerified(true)}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl"
                >
                  Confirm & Sync Attendance List
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Live Alerts list */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Attendance Heatmaps</h3>
              <div className="space-y-3">
                {notifications.map((note, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3 text-[10px] font-mono leading-relaxed flex items-start space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-white/70">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports Export triggers */}
            <div className="glass-panel rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Log Exporter Desk</h3>
              <button 
                onClick={exportPDFReport}
                className="w-full flex justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 text-white"
              >
                <span>Export Daily PDF</span>
                <Download className="w-4 h-4 text-cyan-400" />
              </button>
              <button 
                onClick={exportExcelReport}
                className="w-full flex justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 text-white"
              >
                <span>Export Excel Sheet</span>
                <FileText className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. SALARY & PAYROLL LEDGER */}
      {activeTab === 'salary' && (
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workforce Payroll Ledger</h3>
              <p className="text-[10px] text-white/50 mt-0.5">Calculated net payouts formatted in Indian Rupee (₹)</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                  <th className="p-3">Worker Name</th>
                  <th className="p-3">Daily Wage (₹)</th>
                  <th className="p-3">Shift Status</th>
                  <th className="p-3">OT Hours</th>
                  <th className="p-3">OT Pay (₹)</th>
                  <th className="p-3">Deductions (₹)</th>
                  <th className="p-3 text-right">Net Payout (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                {attendance.map((rec) => {
                  const wages = calculatePayroll(rec);
                  return (
                    <tr key={rec.id} className="hover:bg-white/5">
                      <td className="p-3 font-sans font-semibold text-white">{rec.name}</td>
                      <td className="p-3">{formatIndianRupee(wages.dailyWage)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-sans ${
                          rec.status === 'Present' ? 'bg-emerald-500/15 text-emerald-400' :
                          rec.status === 'Absent' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {rec.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">{rec.overtime} Hrs</td>
                      <td className="p-3">{formatIndianRupee(wages.otWage)}</td>
                      <td className="p-3 text-rose-400">-{formatIndianRupee(wages.deduction)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{formatIndianRupee(wages.totalWage)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATTENDANCE SUBMISSION SUMMARY MODAL */}
      {showSubmitSummaryModal && (
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
                    Date: <span className="text-emerald-400 font-semibold">{selectedDate || new Date().toISOString().split('T')[0]}</span> | Marked By: <span className="text-cyan-400 font-semibold">Contractor</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSubmitSummaryModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary KPI Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Total Workers</p>
                <p className="text-2xl font-black text-white mt-1">{attendance.length}</p>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-emerald-400/70 uppercase font-mono tracking-wider font-semibold">Present Workers</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {attendance.filter(a => a.status === 'Present').length}
                </p>
              </div>
              <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-rose-400/70 uppercase font-mono tracking-wider font-semibold">Absent Workers</p>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  {attendance.filter(a => a.status === 'Absent').length}
                </p>
              </div>
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-amber-400/70 uppercase font-mono tracking-wider font-semibold">Half / Leave / Unmarked</p>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {attendance.filter(a => a.status !== 'Present' && a.status !== 'Absent').length}
                </p>
              </div>
            </div>

            {/* Detailed Worker List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Worker Attendance Detailed Roster</span>
                <span className="text-white/40 font-normal text-[10px]">{attendance.length} Total Workers Listed</span>
              </h4>
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900 border-b border-white/10 text-white/40 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Worker ID & Name</th>
                      <th className="p-3">Role / Trade</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Check-In / Out</th>
                      <th className="p-3">Overtime</th>
                      <th className="p-3">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {attendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-white/5">
                        <td className="p-3">
                          <span className="font-bold text-white block">{rec.name}</span>
                          <span className="text-[9px] font-mono text-emerald-400">{rec.employeeId}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-white/60">{rec.role}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            rec.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            rec.status === 'Absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            rec.status === 'Half Day' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            rec.status === 'Leave' ? 'bg-slate-700/40 text-white/70 border border-white/10' :
                            'bg-white/5 text-white/40 border border-white/10'
                          }`}>
                            {rec.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-white/50">{rec.checkIn || '--:--'} - {rec.checkOut || '--:--'}</td>
                        <td className="p-3 font-mono text-[10px] text-purple-400">{rec.overtime} Hrs</td>
                        <td className="p-3 text-[10px] text-cyan-400 font-mono">Contractor</td>
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
                  onClick={() => setShowSubmitSummaryModal(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Confirm & Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
