import React, { useState } from 'react';
import { 
  Boxes, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  KeyRound, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  FileSpreadsheet, 
  CheckSquare, 
  Building2, 
  Database, 
  Clock, 
  Check, 
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/stock';
import { PREDEFINED_ACCOUNTS, getStoredUsers } from '../utils/storage';
import { authenticateFromFirestore } from '../services/stockSyncService';

interface LandingPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  isDbConnected: boolean;
}

export function LandingPage({ onLoginSuccess, isDbConnected }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const storedUsers = getStoredUsers();
  const currentAdmin = storedUsers.find((u) => u.username.toLowerCase() === 'admin') || PREDEFINED_ACCOUNTS[0];
  const currentChecker = storedUsers.find((u) => u.username.toLowerCase() === 'petugas') || PREDEFINED_ACCOUNTS[1];

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'ADMIN') {
      setUsername(currentAdmin.username);
      setPassword(currentAdmin.password || '123');
    } else {
      setUsername(currentChecker.username);
      setPassword(currentChecker.password || '123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Try Firestore login
      const dbUser = await authenticateFromFirestore(username, password);
      if (dbUser) {
        onLoginSuccess(dbUser);
        setIsSubmitting(false);
        return;
      }

      // 2. Dynamic stored accounts verification
      const allAccounts = getStoredUsers();
      const found = allAccounts.find(
        (acc) =>
          acc.username.toLowerCase() === username.trim().toLowerCase() &&
          acc.password === password.trim()
      );

      if (found) {
        onLoginSuccess({
          username: found.username,
          name: found.name,
          role: found.role,
        });
        setIsSubmitting(false);
        return;
      }

      setErrorMsg('Username atau password tidak cocok. Silakan periksa kembali.');
    } catch {
      const allAccounts = getStoredUsers();
      const found = allAccounts.find(
        (acc) =>
          acc.username.toLowerCase() === username.trim().toLowerCase() &&
          acc.password === password.trim()
      );
      if (found) {
        onLoginSuccess({
          username: found.username,
          name: found.name,
          role: found.role,
        });
      } else {
        setErrorMsg('Gagal memverifikasi akun ke sistem.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const allAccounts = getStoredUsers();
    const acc = allAccounts.find((a) => a.role === role) || PREDEFINED_ACCOUNTS.find((a) => a.role === role);
    if (acc) {
      onLoginSuccess({
        username: acc.username,
        name: acc.name,
        role: acc.role,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">
                  Stock Opname System
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cloud 2-Arah
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pusat &bull; Sempu &bull; Pilar &bull; Serang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium">Database Real-Time Aktif</span>
            </div>
            <a
              href="#login-section"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Masuk Sekarang
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero & Login Split */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 flex-1 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: System Overview & 5 Workflow Steps */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sistem Pengecekan Stok Barang Terpadu</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Pengecekan Stok Barang Modern, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">Tepat, dan Tervalidasi</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Platform stock opname 6 kolom terintegrasi database cloud 2-arah. Admin mengimpor spreadsheet Excel, sistem merapihkan serta mengurutkan A-Z otomatis, petugas mengecek fisik hingga tuntas, dan admin memvalidasi hasil tanpa risiko barang terlewat.
            </p>

            {/* The 5 Steps Workflow Visual Badges */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>5 Alur Kerja Standar Sistem:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/40">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Input Data Stok (.xlsx)</h4>
                    <p className="text-[11px] text-slate-400">Admin mengunggah file Excel 6 kolom & tentukan batas kritis N.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/40">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Sistem Rapihkan Data</h4>
                    <p className="text-[11px] text-slate-400">Sortir otomatis A-Z nama item & tandai merah stok &le; N.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/40">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Pengecekan Fisik Tuntas</h4>
                    <p className="text-[11px] text-slate-400">Petugas ceklis checkbox hingga 100% selesai.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-500/40">
                    4
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Validasi Admin Gudang</h4>
                    <p className="text-[11px] text-slate-400">Tandai jika ada barang terlewat; validasi terkunci sampai tuntas.</p>
                  </div>
                </div>

                <div className="sm:col-span-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                    5
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">Hasil Tersimpan di Laporan Resmi</h4>
                    <p className="text-[11px] text-emerald-200/70">Arsip otomatis tersimpan di cloud, siap cetak PDF dan ekspor Excel .xlsx.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Specs Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-medium text-slate-300">
                Kolom: <strong>Kode Item</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-medium text-slate-300">
                <strong>Nama Item</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-medium text-slate-300">
                <strong>Pusat</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-medium text-slate-300">
                <strong>Sempu</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-medium text-slate-300">
                <strong>Pilar</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-medium text-slate-300">
                <strong>Serang</strong>
              </span>
            </div>

          </div>

          {/* Right Column: Gateway Login Card */}
          <div id="login-section" className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 relative overflow-hidden backdrop-blur-xl">
              
              {/* Subtle card glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-5 relative z-10">
                
                {/* Login Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Login Autentikasi Pengguna
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-semibold text-slate-400">
                      Multi-Role RBAC
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Masuk ke Sistem
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan pilih akun Anda untuk melanjutkan pengecekan stok
                  </p>
                </div>

                {/* Role Switcher Selector Tabs */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2">
                    Pilih Peran Akun:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    {/* Admin Tab */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('ADMIN')}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                        selectedRole === 'ADMIN'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-900/30'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-1.5 rounded-lg ${selectedRole === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        {selectedRole === 'ADMIN' && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">Admin Gudang</div>
                        <div className="text-[11px] font-semibold text-indigo-300 truncate">{currentAdmin.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Akses Penuh & Validasi</div>
                      </div>
                    </button>

                    {/* Petugas Cek Tab */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('USER_CHECKER')}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                        selectedRole === 'USER_CHECKER'
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-900/30'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-1.5 rounded-lg ${selectedRole === 'USER_CHECKER' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                          <UserCheck className="w-4 h-4" />
                        </div>
                        {selectedRole === 'USER_CHECKER' && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">Petugas Cek</div>
                        <div className="text-[11px] font-semibold text-blue-300 truncate">{currentChecker.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Terkunci dari Mode Admin</div>
                      </div>
                    </button>

                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username login"
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white font-medium placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password akun"
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white font-medium placeholder-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                      selectedRole === 'ADMIN'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-900/30'
                        : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-blue-900/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSubmitting 
                        ? 'Memverifikasi...' 
                        : selectedRole === 'ADMIN' 
                        ? `Masuk sebagai ${currentAdmin.name} (Admin)` 
                        : `Masuk sebagai ${currentChecker.name} (Petugas Cek)`}
                    </span>
                  </button>
                </form>

                {/* Quick 1-Click Access for Verified Accounts */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Akses Cepat Akun Terdaftar (1-Klik):
                    </span>
                    <span className="text-[10px] text-slate-500">Akun Resmi</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('ADMIN')}
                      className="py-2 px-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 text-left transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-1">
                        <div className="text-[11px] font-bold text-white truncate">{currentAdmin.name}</div>
                        <div className="text-[9px] text-indigo-400">Admin Gudang</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('USER_CHECKER')}
                      className="py-2 px-3 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-700/60 text-blue-200 text-left transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-1">
                        <div className="text-[11px] font-bold text-white truncate">{currentChecker.name}</div>
                        <div className="text-[9px] text-blue-400">Petugas Cek</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 text-center pt-1">
                    *Petugas Cek tidak dapat mengakses menu admin atau mengubah data stok.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Bottom Features Strip */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-400 text-xs">
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white">Impor Excel .xlsx & Sortir A-Z</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Unggah berkas Excel langsung, sistem merapikan dan mengurutkan secara alfabetis otomatis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white">Deteksi Stok Kritis &le; N</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stok toko Sempu, Pilar, dan Serang di bawah batas langsung ditandai merah agar segera restock.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white">Proteksi Validasi & Anti-Manipulasi</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Validasi terkunci bila barang belum 100% dicek atau ada tanda terlewat oleh Admin Abdus Shomad.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            Sistem Pengecekan Stok Barang (Stock Opname) &bull; Format 6 Kolom: Kode Item, Nama Item, Pusat, Sempu, Pilar, Serang &bull; Real-Time Cloud Sync
          </div>
        </div>
      </footer>

    </div>
  );
}
