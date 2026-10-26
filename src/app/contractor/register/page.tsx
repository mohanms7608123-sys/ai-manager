'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HardHat, ShieldAlert, Mail, Lock, User, Phone, Upload, MapPin, Building2 } from 'lucide-react';

export default function ContractorRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('No photo selected');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'Contractor');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('userAddress', address);
        if (photo) localStorage.setItem('userPhoto', photo);
        localStorage.setItem('isAuthed', 'true');
      }
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#111217] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans grid-bg">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#f97316]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-[#ea580c]/5 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-xl rounded-2xl p-8 relative z-10 border border-[#f97316]/20 shadow-2xl shadow-[#f97316]/5"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-[#f97316]/20 to-[#f97316]/5 border border-[#f97316]/30 rounded-2xl mb-4">
            <HardHat className="w-6 h-6 text-[#f97316]" />
          </div>
          <h2 className="text-lg font-bold uppercase tracking-widest text-[#f97316]">Contractor Registration</h2>
          <p className="text-[10px] text-white/50 uppercase mt-1 font-mono tracking-wider">Deploy Corporate Infrastructure Console</p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Contractor Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <User className="w-4 h-4 text-[#f97316]/60" />
                </span>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Vikramaditya Skyline"
                  className="w-full bg-slate-950/90 border border-white/5 focus:border-[#f97316]/40 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Company Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <Building2 className="w-4 h-4 text-[#f97316]/60" />
                </span>
                <input 
                  type="text" 
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Larsen & Toubro Ltd Partner"
                  className="w-full bg-slate-950/90 border border-white/5 focus:border-[#f97316]/40 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Corporate Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <Mail className="w-4 h-4 text-[#f97316]/60" />
                </span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contractor@ltindia.com"
                  className="w-full bg-slate-950/90 border border-white/5 focus:border-[#f97316]/40 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <Phone className="w-4 h-4 text-[#f97316]/60" />
                </span>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98888 77777"
                  className="w-full bg-slate-950/90 border border-white/5 focus:border-[#f97316]/40 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Access Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/90 border border-white/5 focus:border-[#f97316]/40 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Confirm Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/90 border border-white/5 focus:border-[#f97316]/40 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Company Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <MapPin className="w-4 h-4 text-[#f97316]/60" />
                </span>
                <input 
                  type="text" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="H-15, Sector 63, Noida, Uttar Pradesh, India"
                  className="w-full bg-slate-950/90 border border-white/5 focus:border-[#f97316]/40 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Profile Photo (Upload from local computer)</label>
              <div className="border border-dashed border-white/10 hover:border-[#f97316]/40 rounded-xl p-3 flex items-center justify-between bg-white/5 cursor-pointer relative transition-all">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-[10px] text-white/45 truncate max-w-xs">{photoName}</span>
                <Upload className="w-4 h-4 text-[#f97316]" />
              </div>
              {photo && (
                <div className="mt-2.5 w-12 h-12 rounded-lg border border-[#f97316]/20 overflow-hidden bg-slate-900">
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold rounded-xl mt-4 hover:brightness-110 transition-all disabled:opacity-40"
          >
            {isLoading ? 'SUBMITTING CREDENTIAL RECORDS...' : 'REGISTER CONTRACTOR LICENSE'}
          </button>
        </form>

        <div className="mt-5 text-center text-[10px] text-white/40">
          Already registered company?{' '}
          <Link href="/contractor/login" className="text-[#f97316] hover:underline font-bold">Suite Login</Link>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 flex items-center justify-center space-x-2 text-[9px] text-white/30 font-mono">
          <ShieldAlert className="w-4 h-4 text-[#f97316]/60" />
          <span>GSTIN & ISO-9001 VERIFIED REGISTRATION</span>
        </div>
      </motion.div>
    </div>
  );
}
