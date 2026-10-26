'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, MapPin, Upload, Save, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('Change photo');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail') || '';
      const derived = email ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
      setName(localStorage.getItem('userName') || derived || 'Client User');
      setEmail(email || 'contractor@ltindia.com');
      setPhone(localStorage.getItem('userPhone') || '+91 98888 77777');
      setAddress(localStorage.getItem('userAddress') || 'H-15, Sector 63, Noida, Uttar Pradesh, India');
      setPhoto(localStorage.getItem('userPhoto') || '');
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPhone', phone);
      localStorage.setItem('userAddress', address);
      if (photo) localStorage.setItem('userPhoto', photo);
      
      // Notify other tabs / elements or refresh the page state
      window.dispatchEvent(new Event('storage'));
    }
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      // Force page refresh to sync header/sidebar updates instantly
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">Profile Settings</h2>
          <p className="text-xs text-white/50 mt-1">Configure profile security credentials and personal settings</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        {saved && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-xs text-emerald-400">
            Profile changes successfully saved. Synchronizing...
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="flex items-center space-x-2 pb-2 border-b border-white/5 mb-4">
            <User className="w-4.5 h-4.5 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Account Specifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-semibold block">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-semibold block">Corporate Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-semibold block">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <Phone className="w-4 h-4" />
                </span>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-semibold block">Password Key</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (leave blank to keep unchanged)"
                  className="w-full bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-semibold block">Office Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <MapPin className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Profile Photo */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-semibold block">Profile Image (Local system upload)</label>
              <div className="border border-dashed border-white/10 hover:border-cyan-500/50 rounded-xl p-3 flex items-center justify-between bg-white/5 cursor-pointer relative transition-all">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-[10px] text-white/45 truncate max-w-xs">{photoName}</span>
                <Upload className="w-4 h-4 text-cyan-400" />
              </div>
              {photo && (
                <div className="mt-2.5 w-12 h-12 rounded-lg border border-white/10 overflow-hidden bg-slate-900">
                  <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg mt-6"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Configuration</span>
          </button>
        </form>
      </div>

      <div className="border-t border-white/5 pt-4 flex items-center justify-center space-x-2 text-[9px] text-white/30 font-mono">
        <ShieldCheck className="w-4 h-4 text-cyan-400/60" />
        <span>FIPS 140-2 ENCRYPTED CONNECTION</span>
      </div>
    </div>
  );
}
