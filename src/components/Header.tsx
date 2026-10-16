import { UserRole } from '../types/stock';
import { 
  Boxes, 
  ShieldCheck, 
  UserCheck, 
  FileSpreadsheet, 
  History, 
  PlusCircle, 
  Download, 
  RotateCcw
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
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Sistem Pengecekan Stok Barang
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Kode Item &bull; Nama Item &bull; Pusat &bull; Sempu &bull; Pilar &bull; Serang
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pengecekan Stok: Sortir A-Z &bull; Penandaan Sempu/Pilar/Serang &le; N &bull; Ceklis &bull; Validasi Admin
              </p>
            </div>
          </div>

          {/* Right Controls: Role Switcher & Primary Action */}
          <div className="flex flex-wrap items-center gap-3">
            
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

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 px-2 hidden sm:inline">
                Peran:
              </span>
              <button
                onClick={() => onRoleChange('ADMIN')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'ADMIN'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke peran Admin (Input Data, Beri Tanda Terlewat, Validasi)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => onRoleChange('USER_CHECKER')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'USER_CHECKER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke peran User / Petugas Cek (Mengecek dan mencentang barang di lapangan)"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>User (Petugas Cek)</span>
              </button>
            </div>

            {/* Admin Action Buttons */}
            {currentRole === 'ADMIN' && (
              <div className="flex items-center gap-2">
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
                  <span className="hidden sm:inline">Template Excel</span>
                </button>
              </div>
            )}

            {/* Quick Reset session if needed */}
            <button
              onClick={onResetSession}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset ke Data Contoh Standar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
