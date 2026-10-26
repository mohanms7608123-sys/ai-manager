'use client';

import React, { useState } from 'react';
import WorkerPageShell from '@/components/worker/WorkerPageShell';
import { User, Phone, MapPin, Briefcase, Calendar, Building2, QrCode, Edit2, Save, X, LogOut } from 'lucide-react';
import { performLogout } from '@/lib/auth';

export default function WorkerProfilePage() {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Sector 62, Noida, Uttar Pradesh');
  const [emergency, setEmergency] = useState('Family Contact (+91 98765 43211)');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPhone', phone);
      localStorage.setItem('userAddress', address);
      localStorage.setItem('userEmergency', emergency);
    }
    setSavedMsg(true);
    setEditing(false);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <WorkerPageShell activeTabId="profile">
      {(worker) => (
        <>
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-emerald-400" />
                <span>My Profile</span>
              </h1>
              <p className="text-xs text-white/50 mt-1 font-mono">Worker ID: {worker.workerId || worker.id || 'WRK-1001'}</p>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-xs font-bold text-white transition-all">
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all">
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-white/60 transition-all">
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </header>

          {savedMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl px-4 py-3 text-xs font-bold text-emerald-300 flex items-center gap-2">
              ✅ Profile updated successfully.
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl overflow-hidden">
            {/* Cover / Hero */}
            <div className="h-28 bg-gradient-to-r from-emerald-900/40 via-teal-900/20 to-slate-900/60 relative">
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-slate-900/80 to-transparent" />
            </div>

            <div className="px-6 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-5">
                <div className="flex items-end gap-4">
                  <img
                    src={worker.photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
                    alt={worker.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900 shadow-xl relative z-10"
                  />
                  <div className="pb-1">
                    <h2 className="text-lg font-black text-white">{worker.name}</h2>
                    <p className="text-xs text-emerald-400 font-mono">{worker.trade} • {worker.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold font-mono">
                    ACTIVE WORKER
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {[
                  { icon: QrCode,     label: 'Worker ID',          value: worker.workerId || worker.id || 'WRK-1001',    editable: false },
                  { icon: Briefcase,  label: 'Trade / Role',       value: worker.trade || 'Master Rebar Mason',          editable: false },
                  { icon: Building2,  label: 'Department',         value: worker.department || 'Civil Structure',        editable: false },
                  { icon: Building2,  label: 'Assigned Project',   value: worker.projectName || 'Helios Corporate HQ (Tower A)', editable: false },
                  { icon: Calendar,   label: 'Joining Date',       value: worker.joiningDate || '2023-01-15',            editable: false },
                  { icon: User,       label: 'Contractor ID',      value: worker.contractorId || 'CONT-101',             editable: false }
                ].map(field => {
                  const Icon = field.icon;
                  return (
                    <div key={field.label} className="bg-slate-950/50 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-white/40 font-mono uppercase text-[10px]">
                        <Icon className="w-3 h-3" />
                        {field.label}
                      </div>
                      <p className="font-bold text-white font-mono">{field.value}</p>
                    </div>
                  );
                })}

                {/* Editable Fields */}
                {[
                  { icon: Phone,  label: 'Phone Number',    value: phone,     setter: setPhone },
                  { icon: MapPin, label: 'Home Address',    value: address,   setter: setAddress },
                  { icon: Phone,  label: 'Emergency Contact', value: emergency, setter: setEmergency }
                ].map(field => {
                  const Icon = field.icon;
                  return (
                    <div key={field.label} className="bg-slate-950/50 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-white/40 font-mono uppercase text-[10px]">
                        <Icon className="w-3 h-3" />
                        {field.label}
                      </div>
                      {editing ? (
                        <input
                          value={field.value}
                          onChange={e => field.setter(e.target.value)}
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                        />
                      ) : (
                        <p className="font-bold text-white font-mono">{field.value}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => performLogout('Worker')}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout from Worker Portal
            </button>
          </div>
        </>
      )}
    </WorkerPageShell>
  );
}
