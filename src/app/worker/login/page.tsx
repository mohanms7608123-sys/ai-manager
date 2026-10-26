'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QrCode, Lock, User, AlertTriangle, ShieldCheck, CheckCircle2, Cpu, ArrowRight, Camera, Upload, RefreshCw, X, Video, SwitchCamera, Play, Square, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';
import { setAuthSession } from '@/lib/auth';

export default function WorkerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [welcomeWorkerName, setWelcomeWorkerName] = useState<string | null>(null);
  const [isAccountLocked, setIsAccountLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Html5Qrcode State & Camera Switcher
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCameraIdx, setCurrentCameraIdx] = useState(0);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play Beep Sound on Successful Scan (Requirement 22)
  const playSuccessBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz tone (A5)
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  // Initialize html5-qrcode Camera Engine
  const startHtml5QrcodeScanner = async () => {
    setErrorMsg(null);
    setCameraPermissionDenied(false);

    try {
      // 1. Fetch available system cameras (Webcam / Mobile front & back cameras)
      const availableCameras = await Html5Qrcode.getCameras();

      if (!availableCameras || availableCameras.length === 0) {
        setCameraPermissionDenied(true);
        setErrorMsg('No local system camera found. Please connect a webcam or upload a QR Code image file below.');
        return;
      }

      setCameras(availableCameras.map(c => ({ id: c.id, label: c.label || `Camera ${c.id}` })));

      const targetCameraId = availableCameras[currentCameraIdx % availableCameras.length].id;

      // Stop existing instance if running
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
        } catch {}
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        targetCameraId,
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Requirement 4 & 11: Auto detected QR code -> stop scanner & authenticate
          playSuccessBeep();
          handleQrCodeDecoded(decodedText);
          stopHtml5QrcodeScanner();
        },
        () => {
          // Continuous scanning tick
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Html5Qrcode camera error:', err);
      setCameraPermissionDenied(true);
      setErrorMsg('Camera permission denied or camera device busy. Please allow camera access in your browser settings.');
      setIsScanning(false);
    }
  };

  // Stop Html5Qrcode Scanner (Requirement 20)
  const stopHtml5QrcodeScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  // Switch Camera (Front/Back on Mobile / Webcams) (Requirement 20)
  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIdx = (currentCameraIdx + 1) % cameras.length;
    setCurrentCameraIdx(nextIdx);

    if (isScanning) {
      await stopHtml5QrcodeScanner();
      setTimeout(() => {
        startHtml5QrcodeScanner();
      }, 300);
    }
  };

  // Process Decoded QR Code (Requirement 10, 11, 12, 17, 18)
  const handleQrCodeDecoded = (decodedText: string) => {
    setShowQrModal(false);

    let extractedUserOrId = decodedText.trim();
    if (decodedText.includes('USER:')) {
      const match = decodedText.match(/USER:([^\s|]+)/);
      if (match) extractedUserOrId = match[1];
    } else if (decodedText.includes('WORKER:')) {
      const match = decodedText.match(/WORKER:([^\s|]+)/);
      if (match) extractedUserOrId = match[1];
    }

    setUsername(extractedUserOrId);
    setPassword('worker123');

    // Trigger auto-login
    executeWorkerLogin(extractedUserOrId, 'worker123', decodedText);
  };

  // Handle Image File Upload QR Reader (Requirement 10)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              if (code && code.data) {
                playSuccessBeep();
                handleQrCodeDecoded(code.data);
                return;
              }
            }
            setErrorMsg('No valid Worker QR Code detected in the uploaded image.');
          } catch (err) {
            setErrorMsg('Unable to parse image data. Please upload a clear QR code image.');
          }
        };
        img.onerror = () => setErrorMsg('Failed to load image file.');
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setErrorMsg('Invalid Worker QR Code in image file.');
    }
  };

  // Execute Worker Login Request
  const executeWorkerLogin = async (userVal: string, passVal: string, qrVal?: string) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setWelcomeWorkerName(null);

    try {
      const res = await fetch('/api/auth/worker-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userVal,
          password: passVal,
          qrCode: qrVal || undefined,
          device: 'Local WebRTC System Camera Scanner',
          location: 'Sector 62 Site, Noida'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isInvalidQr) {
          setErrorMsg('Invalid Worker QR Code.');
        } else if (data.isInactive) {
          setErrorMsg('Worker account is disabled. Contact your contractor.');
        } else if (data.isLocked) {
          setIsAccountLocked(true);
          setErrorMsg(data.message || 'ACCOUNT LOCKED: 5 Failed Password Attempts. Contact your Contractor to unlock.');
        } else {
          setErrorMsg(data.message || 'Invalid username or password.');
        }
      } else {
        // Requirement 11: Create session & redirect to Worker Dashboard
        setAuthSession('Worker', `${data.worker.username}@worker.site`, data.worker);

        setTimeout(() => {
          router.push('/worker/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error during worker authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter your Username / Worker ID or Scan your QR Code.');
      return;
    }
    executeWorkerLogin(username, password || 'worker123');
  };

  useEffect(() => {
    return () => {
      stopHtml5QrcodeScanner();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-cyan-900/10 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4 border-b border-white/5 relative z-10">
        <Link href="/" className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-wider text-white uppercase">AI Smart Construction</span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-widest block uppercase">Worker Access Terminal</span>
          </div>
        </Link>
        <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors font-semibold">
          Return to Home
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-8 relative z-10">
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* GREEN SUCCESS CHECKMARK ANIMATION (Requirement 21 & 23) */}
          {showSuccessAnimation && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-emerald-500/20 border-4 border-emerald-400 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)] animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Welcome {welcomeWorkerName}!</h2>
                <p className="text-sm font-bold text-emerald-400 font-mono mt-1">{successMsg}</p>
                <p className="text-xs text-white/50 font-mono mt-3 animate-pulse">Redirecting to Worker Dashboard...</p>
              </div>
            </div>
          )}

          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <QrCode className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Worker Access Terminal</h1>
            <p className="text-xs text-white/50">Scan your Worker QR ID Card or enter credentials to access your dashboard.</p>
          </div>

          {/* Account Locked Banner */}
          {isAccountLocked && (
            <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-4 space-y-2 text-xs text-rose-200">
              <div className="flex items-center space-x-2 font-bold text-rose-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Account Locked (5 Failed Attempts)</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                Your worker account has been locked. Notification sent to Contractor. Ask Contractor to click &quot;Unlock Account&quot;.
              </p>
            </div>
          )}

          {/* Error Message */}
          {!isAccountLocked && errorMsg && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-rose-300 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && !showSuccessAnimation && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center space-x-3 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {/* QR CODE SCAN LAUNCHER & FILE UPLOADER */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setShowQrModal(true);
                setTimeout(() => {
                  startHtml5QrcodeScanner();
                }, 200);
              }}
              className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/25 uppercase tracking-wider"
            >
              <Camera className="w-5 h-5 text-white animate-pulse" />
              <span>Open Local Camera QR Scanner</span>
            </button>

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 rounded-2xl font-bold text-xs text-emerald-400 flex items-center justify-center space-x-2 transition-all"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Saved QR Image File (PNG/JPG)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[10px] text-white/30 uppercase font-mono my-2">
            <div className="h-[1px] bg-white/10 flex-1"></div>
            <span>Or Enter Credentials Manually</span>
            <div className="h-[1px] bg-white/10 flex-1"></div>
          </div>

          {/* MANUAL LOGIN FORM */}
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">Username / Worker ID *</label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  disabled={isAccountLocked || loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. WRK-1001 or arjun.das"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  disabled={isAccountLocked || loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defaults to worker123 if blank"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAccountLocked || loading}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center space-x-2 transition-all uppercase tracking-wider"
            >
              {loading ? (
                <span>Authenticating Worker...</span>
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill helper buttons */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="text-[9px] text-white/40 font-mono block uppercase text-center">Quick Demo 1-Click QR Scan Logins</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleQrCodeDecoded('WORKER:WK001|USER:WK001|NAME:Ramesh Kumar')}
                className="bg-emerald-950/20 hover:bg-emerald-950/40 p-2.5 rounded-xl text-emerald-300 text-left font-mono truncate border border-emerald-500/30 font-bold"
              >
                ⚡ Ramesh Kumar (WK001)
              </button>
              <button
                type="button"
                onClick={() => handleQrCodeDecoded('WORKER:WK002|USER:WK002|NAME:Sunita Devi')}
                className="bg-emerald-950/20 hover:bg-emerald-950/40 p-2.5 rounded-xl text-emerald-300 text-left font-mono truncate border border-emerald-500/30 font-bold"
              >
                ⚡ Sunita Devi (WK002)
              </button>
              <button
                type="button"
                onClick={() => handleQrCodeDecoded('WORKER:WK003|USER:WK003|NAME:Suresh Verma')}
                className="bg-emerald-950/20 hover:bg-emerald-950/40 p-2.5 rounded-xl text-emerald-300 text-left font-mono truncate border border-emerald-500/30 font-bold"
              >
                ⚡ Suresh Verma (WK003)
              </button>
              <button
                type="button"
                onClick={() => handleQrCodeDecoded('WORKER:WK006|USER:WK006|NAME:Rajesh Sharma')}
                className="bg-emerald-950/20 hover:bg-emerald-950/40 p-2.5 rounded-xl text-emerald-300 text-left font-mono truncate border border-emerald-500/30 font-bold"
              >
                ⚡ Rajesh Sharma (WK006)
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* HTML5-QRCODE SYSTEM CAMERA SCANNER MODAL (Requirements 1 - 20) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-sm uppercase flex items-center space-x-2">
                <Video className="w-4.5 h-4.5 text-emerald-400" />
                <span>Worker System Camera QR Scanner</span>
              </h3>
              <button 
                onClick={async () => {
                  await stopHtml5QrcodeScanner();
                  setShowQrModal(false);
                }} 
                className="text-white/40 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Permission Denied Alert (Requirement 19) */}
            {cameraPermissionDenied && (
              <div className="bg-rose-950/50 border border-rose-500/40 p-3.5 rounded-2xl text-xs text-rose-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Camera Access Required</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/80">
                  Camera permission denied. Please allow camera access in your browser settings to scan your QR code.
                </p>
              </div>
            )}

            {/* SCANNING GUIDE FRAME CONTAINER (Requirements 6, 7 & 8) */}
            <div className="bg-black rounded-2xl border-2 border-emerald-500/40 aspect-square relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
              <div id="qr-reader-container" className="w-full h-full"></div>

              {/* Requirement 7: Alignment Guide Text */}
              <div className="absolute top-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] font-mono text-emerald-300 border border-emerald-500/30 text-center pointer-events-none z-10">
                <span className="flex items-center justify-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Align the QR code inside the frame.</span>
                </span>
              </div>
            </div>

            {/* SCANNER CONTROL BUTTONS (Requirement 20) */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={startHtml5QrcodeScanner}
                disabled={isScanning}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl flex items-center justify-center space-x-1 text-[11px]"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start</span>
              </button>

              <button
                type="button"
                onClick={stopHtml5QrcodeScanner}
                disabled={!isScanning}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold rounded-xl flex items-center justify-center space-x-1 text-[11px]"
              >
                <Square className="w-3.5 h-3.5 text-rose-400" />
                <span>Stop</span>
              </button>

              <button
                type="button"
                onClick={switchCamera}
                disabled={cameras.length <= 1}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold rounded-xl flex items-center justify-center space-x-1 text-[11px]"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                <span>Switch</span>
              </button>
            </div>

            {/* Quick Demo Instant Trigger inside Scanner Modal */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[9px] text-white/40 font-mono block uppercase text-center">Test Scan Without Camera</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    playSuccessBeep();
                    stopHtml5QrcodeScanner();
                    handleQrCodeDecoded('WRK-1001');
                  }}
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono font-bold text-center"
                >
                  Scan WRK-1001 (Arjun)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSuccessBeep();
                    stopHtml5QrcodeScanner();
                    handleQrCodeDecoded('WRK-1002');
                  }}
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono font-bold text-center"
                >
                  Scan WRK-1002 (Rajesh)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center py-4 text-[10px] text-white/30 font-mono relative z-10">
        © {new Date().getFullYear()} AI Smart Construction Manager • Worker Access Terminal
      </footer>
    </div>
  );
}
