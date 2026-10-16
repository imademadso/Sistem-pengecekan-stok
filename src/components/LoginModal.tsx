import { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  User, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  X
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/stock';
import { PREDEFINED_ACCOUNTS } from '../utils/storage';
import { authenticateFromFirestore } from '../services/stockSyncService';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  onClose?: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export function LoginModal({
  isOpen,
  currentUser,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'ADMIN') {
      setUsername('admin');
      setPassword('123');
    } else {
      setUsername('petugas');
      setPassword('123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. First attempt login from Firestore database
      const dbUser = await authenticateFromFirestore(username, password);
      if (dbUser) {
        onLoginSuccess(dbUser);
        setIsSubmitting(false);
        return;
      }

      // 2. Fallback to predefined accounts
      const found = PREDEFINED_ACCOUNTS.find(
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

      setErrorMsg('Username atau password salah! Periksa kembali atau gunakan tombol demo.');
    } catch (err: any) {
      console.warn('Login database fallback', err);
      // Fallback
      const found = PREDEFINED_ACCOUNTS.find(
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
        setErrorMsg('Gagal memverifikasi akun.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const acc = PREDEFINED_ACCOUNTS.find((a) => a.role === role);
    if (acc) {
      onLoginSuccess({
        username: acc.username,
        name: acc.name,
        role: acc.role,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Login Autentikasi Pengguna</h3>
                <p className="text-xs text-slate-400">Pilih peran Anda untuk mengakses sistem</p>
              </div>
            </div>
            {currentUser && onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Peran Akun:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  selectedRole === 'ADMIN'
                    ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20 text-indigo-950'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${selectedRole === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  {selectedRole === 'ADMIN' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <div className="font-bold text-xs mt-1">Admin</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Akses penuh: Input data, ubah batas N, validasi akhir
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('USER_CHECKER')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  selectedRole === 'USER_CHECKER'
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 text-blue-950'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${selectedRole === 'USER_CHECKER' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  {selectedRole === 'USER_CHECKER' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="font-bold text-xs mt-1">Petugas Cek</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Hanya cek barang. <strong>Terkunci dari mode admin</strong>
                </div>
              </button>
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'ADMIN'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Masuk sebagai {selectedRole === 'ADMIN' ? 'Admin' : 'Petugas Cek'}</span>
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Login Cepat Demo (1-Klik):</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg text-[11px] font-semibold text-center transition-colors flex flex-col items-center gap-0.5"
              >
                <span className="font-bold text-indigo-950">Admin Gudang</span>
                <span className="text-[10px] text-indigo-700">Abdus Shomad</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('USER_CHECKER')}
                className="py-2 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-lg text-[11px] font-semibold text-center transition-colors flex flex-col items-center gap-0.5"
              >
                <span className="font-bold text-blue-950">Petugas Cek</span>
                <span className="text-[10px] text-blue-700">Saiful Anwar</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              *Petugas Cek tidak dapat mengakses pengaturan admin atau memvalidasi stok.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
