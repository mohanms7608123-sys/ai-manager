'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Cpu, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

import { setAuthSession } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@construction.com');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email.includes('@') && password.length >= 4) {
        setAuthSession('Admin', email);
        router.push('/admin/dashboard');
      } else {
        setError('Invalid admin credentials. Access denied.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans grid-bg">
      {/* Decorative Gold & Blue Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#fbbf24]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-md rounded-2xl p-8 relative z-10 border border-[#fbbf24]/20 shadow-2xl shadow-[#fbbf24]/5"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-[#fbbf24]/20 to-[#fbbf24]/5 border border-[#fbbf24]/30 rounded-2xl mb-4">
            <Cpu className="w-6 h-6 text-[#fbbf24]" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-[#fbbf24]">Super Admin Portal</h1>
          <p className="text-[10px] text-white/50 uppercase mt-1 font-mono tracking-wider">Global Master Control Terminal</p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Admin Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                <Mail className="w-4 h-4 text-[#fbbf24]/60" />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@construction.com"
                className="w-full bg-[#030612]/90 border border-white/5 focus:border-[#fbbf24]/40 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Password</label>
              <Link href="/forgot-password" className="text-[9px] text-[#fbbf24] hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                <Lock className="w-4 h-4 text-[#fbbf24]/60" />
              </span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#030612]/90 border border-white/5 focus:border-[#fbbf24]/40 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/10"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold py-3.5 rounded-xl transition-all shadow-lg hover:brightness-110 disabled:opacity-40 uppercase tracking-wider"
          >
            <span>{isLoading ? 'Authenticating Admin...' : 'Login to Super Admin Portal'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Security Stamp */}
        <div className="mt-8 border-t border-white/5 pt-4 flex items-center justify-center space-x-2 text-[9px] text-white/30 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#fbbf24]/60" />
          <span>SUPER ADMIN AUTHORIZED ACCESS ONLY</span>
        </div>
      </motion.div>
    </div>
  );
}
