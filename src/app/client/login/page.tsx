'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Lock, Mail, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

import { setAuthSession } from '@/lib/auth';

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email.includes('@') && password.length >= 4) {
        const cleanEmail = email.trim().toLowerCase();
        let nameToSet = '';
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
          const registered = registeredUsers[cleanEmail];
          if (registered && (registered.fullName || registered.name)) {
            nameToSet = registered.fullName || registered.name;
            if (registered.photo) localStorage.setItem('userPhoto', registered.photo);
            if (registered.phone) localStorage.setItem('userPhone', registered.phone);
            if (registered.address) localStorage.setItem('userAddress', registered.address);
          }
        } catch {}

        if (!nameToSet) {
          const derived = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          nameToSet = derived || 'Client User';
        }

        localStorage.setItem('userName', nameToSet);
        localStorage.setItem('userEmail', email);

        setAuthSession('Client', email);
        router.push('/client/dashboard');
      } else {
        setError('Invalid client credentials. Please check your email or password.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Soft Blue Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-100 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-sky-100 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 relative z-10 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 rounded-2xl mb-4">
            <Building2 className="w-6 h-6 text-[#1e3a8a]" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-[#1e3a8a]">Client Portal</h1>
          <p className="text-[10px] text-slate-500 uppercase mt-1 font-mono tracking-wider">Investor & Project Sponsor Login</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Client Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@corporate.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Password</label>
              <Link href="/forgot-password" className="text-[9px] text-[#1e3a8a] font-bold hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1e3a8a]/60 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]/10"
              />
            </div>
          </div>

          {/* BUTTON 1: LOGIN */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-[#1e3a8a] hover:bg-[#1a337a] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg uppercase tracking-wider disabled:opacity-40"
          >
            <span>{isLoading ? 'Connecting Client Portal...' : 'Login'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* BUTTON 2: CREATE CLIENT ACCOUNT */}
        <div className="pt-2">
          <Link 
            href="/client/register"
            className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#1e3a8a] font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Client Account</span>
          </Link>
        </div>

        {/* Security Stamp */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-center space-x-2 text-[9px] text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>AUTHORIZED CLIENT ACCESS GATEWAY</span>
        </div>
      </motion.div>
    </div>
  );
}
