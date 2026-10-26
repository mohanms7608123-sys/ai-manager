'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Hammer, Lock, Mail, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

import { setAuthSession } from '@/lib/auth';

export default function EngineerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('rahul@smartbuild.ai');
  const [password, setPassword] = useState('Rahul@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email.includes('@') && password.length >= 4) {
        setAuthSession('Engineer', email);
        router.push('/engineer/dashboard');
      } else {
        setError('Invalid engineer credentials.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#12141d] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans grid-bg">
      {/* Decorative Yellow Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-md rounded-2xl p-8 relative z-10 border border-yellow-500/20 shadow-2xl shadow-yellow-500/5 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-4">
            <Hammer className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-yellow-400">Engineer Portal</h1>
          <p className="text-[10px] text-white/50 uppercase mt-1 font-mono tracking-wider">Technical Review & Site Supervisor Login</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Engineer License Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                <Mail className="w-4 h-4 text-yellow-400/60" />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram.engineer@site.com"
                className="w-full bg-[#070912] border border-white/5 focus:border-yellow-500/40 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Password</label>
              <Link href="/forgot-password" className="text-[9px] text-yellow-400 font-bold hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                <Lock className="w-4 h-4 text-yellow-400/60" />
              </span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#070912] border border-white/5 focus:border-yellow-500/40 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/10"
              />
            </div>
          </div>

          {/* BUTTON 1: LOGIN */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg uppercase tracking-wider disabled:opacity-40"
          >
            <span>{isLoading ? 'Authenticating License...' : 'Login'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* BUTTON 2: REGISTER ENGINEER */}
        <div className="pt-2">
          <Link 
            href="/engineer/register"
            className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-yellow-400 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Engineer</span>
          </Link>
        </div>

        {/* Security Stamp */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-center space-x-2 text-[9px] text-white/30 font-mono">
          <ShieldCheck className="w-4 h-4 text-yellow-400/60" />
          <span>QUALIFIED STRUCTURAL ENGINEER CONSOLE</span>
        </div>
      </motion.div>
    </div>
  );
}
