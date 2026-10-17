import { useState } from 'react';
import { UserRole } from '../types/stock';
import { 
  Boxes, 
  ShieldCheck, 
  UserCheck, 
  FileSpreadsheet, 
  History, 
  PlusCircle, 
  Download, 
  RotateCcw,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: 'audit' | 'reports';
  onTabChange: (tab: 'audit' | 'reports') => void;
  onOpenInputModal: () => void;
  onDownloadTemplate: () => void;
  onResetSession: () => void;
  reportCount: number;
  onOpenUserManagement?: () => void;
  userName?: string;
  onLogout?: () => void;
}

export function Header({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenInputModal,
  onDownloadTemplate,
  onResetSession,
  reportCount,
  onOpenUserManagement,
  userName,
  onLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Bar */}
        <div className="flex items-center justify-between py-2.5 sm:py-3.5 gap-2 sm:gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
              <Boxes className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                  Sistem Pengecekan Stok
                </h1>
                <span className="hidden md:inline text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Kode Item &bull; Nama Item &bull; Pusat &bull; Sempu &bull; Pilar &bull; Serang
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
                Pengecekan Stok: Sortir A-Z &bull; Penandaan Sempu/Pilar/Serang &le; N &bull; Ceklis &bull; Validasi Admin
              </p>
            </div>
          </div>

          {/* Desktop Controls (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Navigation Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => onTabChange('audit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'audit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Pengecekan Aktif</span>
              </button>
              <button
                onClick={() => onTabChange('reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'reports'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4 text-emerald-600" />
                <span>Arsip Laporan</span>
                {reportCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                    {reportCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile Badge */}
            {currentRole === 'ADMIN' ? (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 py-1 px-2.5 rounded-lg">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-indigo-950 leading-tight">
                    {userName || 'Abdus Shomad'}
                  </div>
                  <div className="text-[9px] text-indigo-600 font-medium">Admin Gudang</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 py-1 px-2.5 rounded-lg">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-blue-950 leading-tight">
                    {userName || 'Saiful Anwar'}
                  </div>
                  <div className="text-[9px] text-blue-600 font-medium">Petugas Cek</div>
                </div>
              </div>
            )}

            {/* Switch Account & Logout */}
            <button
              onClick={() => onRoleChange('ADMIN')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Ganti Akun Pengguna"
            >
              <span>Ganti Akun</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                title="Keluar ke Halaman Awal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            )}

            {/* Admin Action Buttons */}
            {currentRole === 'ADMIN' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenUserManagement}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-xs transition-colors"
                  title="Pengaturan pengguna (Khusus Admin)"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pengaturan User</span>
                </button>

                <button
                  onClick={onOpenInputModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Input Data Stok (.xlsx)</span>
                </button>

                <button
                  onClick={onDownloadTemplate}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                  title="Unduh Template Excel Kosong 6 Kolom"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Template Excel</span>
                </button>

                <button
                  onClick={onResetSession}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Reset Pengecekan"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: User Badge & Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {/* Quick role pill on mobile */}
            <div className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
              currentRole === 'ADMIN' 
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {currentRole === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> : <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
              <span className="max-w-[90px] truncate">{userName || (currentRole === 'ADMIN' ? 'Admin' : 'Petugas')}</span>
            </div>

            {/* Hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer / Sub-bar */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            
            {/* Segmented Tabs on Mobile */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => {
                  onTabChange('audit');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                  activeTab === 'audit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Pengecekan Aktif</span>
              </button>
              <button
                onClick={() => {
                  onTabChange('reports');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                  activeTab === 'reports'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <History className="w-4 h-4 text-emerald-600" />
                <span>Arsip ({reportCount})</span>
              </button>
            </div>

            {/* Mobile Admin Action Buttons */}
            {currentRole === 'ADMIN' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    if (onOpenUserManagement) onOpenUserManagement();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-2xs"
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Pengaturan User</span>
                </button>

                <button
                  onClick={() => {
                    onOpenInputModal();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Input Data Stok (.xlsx)</span>
                </button>

                <button
                  onClick={() => {
                    onDownloadTemplate();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Unduh Template Excel</span>
                </button>

                <button
                  onClick={() => {
                    onResetSession();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Sesi</span>
                </button>
              </div>
            )}

            {/* Account Switcher & Logout Row on Mobile */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onRoleChange('ADMIN');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                <span>Ganti Akun</span>
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Sistem</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </header>
  );
}
