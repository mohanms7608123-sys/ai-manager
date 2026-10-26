'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Mail, Lock, User, Phone, Upload, MapPin } from 'lucide-react';

export default function ClientRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
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
        const cleanEmail = email.trim().toLowerCase();
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
          registeredUsers[cleanEmail] = {
            fullName,
            company: clientCompany,
            email: cleanEmail,
            phone,
            address,
            password,
            photo,
            role: 'Client'
          };
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        } catch {}

        localStorage.setItem('userRole', 'Client');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('userAddress', address);
        if (photo) localStorage.setItem('userPhoto', photo);
        localStorage.setItem('isAuthed', 'true');
      }
      router.push('/client/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-100 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-sky-100 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 rounded-2xl mb-4">
            <Building2 className="w-6 h-6 text-[#1e3a8a]" />
          </div>
          <h2 className="text-lg font-bold uppercase tracking-widest text-[#1e3a8a]">Client Registration</h2>
          <p className="text-[10px] text-slate-500 uppercase mt-1 font-mono tracking-wider">Initialize Developer Audit Account</p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Representative Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Srinivas Murthy"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Client Company Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Client Company Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Building2 className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  required
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Apex Realty Holdings"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Business Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="murthy@apexrealty.co.in"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 95555 44444"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Access Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Confirm Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Registered Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="A-40, Level 6, BKC, Mumbai, India"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Profile Photo (Upload from local computer)</label>
              <div className="border border-dashed border-slate-200 hover:border-[#1e3a8a]/40 rounded-xl p-3 flex items-center justify-between bg-slate-50 cursor-pointer relative transition-all">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 truncate max-w-xs">{photoName}</span>
                <Upload className="w-4 h-4 text-[#1e3a8a]" />
              </div>
              {photo && (
                <div className="mt-2.5 w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1a337a] text-white font-bold rounded-xl mt-4 transition-all disabled:opacity-40"
          >
            {isLoading ? 'ESTABLISHING INVESTOR LINKS...' : 'SUBMIT PARTNER AUDIT REQUEST'}
          </button>
        </form>

        <div className="mt-5 text-center text-[10px] text-slate-500">
          Already registered developer?{' '}
          <Link href="/client/login" className="text-[#1e3a8a] hover:underline font-bold">Client Login</Link>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-4 flex items-center justify-center space-x-2 text-[9px] text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>FIPS 140-2 REGISTER SECURITY SHEETS</span>
        </div>
      </motion.div>
    </div>
  );
}
