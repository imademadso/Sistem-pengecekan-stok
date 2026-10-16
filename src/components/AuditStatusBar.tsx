import { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  Send,
  Lock,
  ArrowRight
} from 'lucide-react';
import { AuditSession, UserRole } from '../types/stock';

interface AuditStatusBarProps {
  session: AuditSession;
  currentRole: UserRole;
  onValidateAndSaveReport: (adminNotes: string) => void;
  onUserSubmitToCheck: () => void;
  onViewReport: () => void;
}

export function AuditStatusBar({
  session,
  currentRole,
  onValidateAndSaveReport,
  onUserSubmitToCheck,
  onViewReport,
}: AuditStatusBarProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  const total = session.items.length;
  const checkedCount = session.items.filter((i) => i.isChecked).length;
  const uncheckedCount = total - checkedCount;
  const flaggedCount = session.items.filter((i) => i.adminFlagged).length;
  const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const isAllChecked = total > 0 && checkedCount === total;
  const hasFlaggedItems = flaggedCount > 0;
  const canValidate = isAllChecked && !hasFlaggedItems && session.status !== 'TERVALIDASI';
  const isFinalized = session.status === 'TERVALIDASI';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      
      {/* Top Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Progres Pengecekan Fisik Stok
            </span>
            {isFinalized ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>TERVALIDASI OLEH ADMIN</span>
              </span>
            ) : hasFlaggedItems ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>ADA BARANG TERLEWAT ({flaggedCount})</span>
              </span>
            ) : isAllChecked ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>PENGECEKAN TUNTAS (100%)</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                DALAM PROSES ({percentage}%)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            <strong>{checkedCount}</strong> dari <strong>{total}</strong> barang telah dicek oleh User (Sisa: {uncheckedCount} barang)
          </p>
        </div>

        {/* Progress Bar Display */}
        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Kelengkapan</span>
            <span className={percentage === 100 ? 'text-emerald-600 font-bold' : 'text-slate-700'}>
              {percentage}%
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFinalized
                  ? 'bg-emerald-600'
                  : hasFlaggedItems
                  ? 'bg-amber-500'
                  : percentage === 100
                  ? 'bg-emerald-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Validation Condition Banner (Tahap 4) */}
      <div className="pt-2 border-t border-slate-100">
        
        {isFinalized ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-900">
                  Tahap 4 & 5 Selesai: Pengecekan Telah Divalidasi
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Admin telah memvalidasi seluruh data stok. Hasil pengecekan sudah tersimpan ke dalam arsip laporan resmi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onViewReport}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              <FileCheck className="w-4 h-4" />
              <span>Buka & Ekspor Laporan Resmi</span>
            </button>
          </div>
        ) : hasFlaggedItems ? (
          <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                  <span>Pengecekan Belum Dapat Divalidasi</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Ada {flaggedCount} Item Terlewat
                  </span>
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Admin telah memberikan tanda bahwa terdapat barang yang terlewat / perlu dicek ulang. Sesuai aturan sistem, 
                  <strong> validasi terkunci</strong> hingga User menyelesaikan pengecekan pada barang bertanda kuning tersebut.
                </p>
              </div>
            </div>

            {currentRole === 'USER_CHECKER' && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-200 text-amber-900 shrink-0">
                &larr; Cek barang yang ditandai kuning di tabel
              </span>
            )}
          </div>
        ) : !isAllChecked ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">
                  Validasi Belum Tersedia (Menunggu Pengecekan Tuntas)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Masih terdapat <strong>{uncheckedCount} barang</strong> yang belum dicentang oleh Petugas Cek. Seluruh barang harus dicentang sebelum Admin dapat memvalidasi.
                </p>
              </div>
            </div>

            {currentRole === 'USER_CHECKER' ? (
              <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg shrink-0">
                Silakan centang sisa barang di kolom sebelah kanan
              </div>
            ) : (
              <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Tombol Validasi Terkunci</span>
              </div>
            )}
          </div>
        ) : (
          /* When all is checked and NO flagged items -> Ready for Admin Validation */
          <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-300 text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-blue-950">
                  Tahap 4: Seluruh Pengecekan Telah Selesai Dicek
                </h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  Semua barang ({total} item) sudah dicentang oleh Petugas Cek. Tidak ada tanda terlewat. Admin kini dapat melakukan validasi final.
                </p>
              </div>
            </div>

            {/* Validation Action */}
            {currentRole === 'ADMIN' ? (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNotesInput(!showNotesInput)}
                  className="text-xs text-blue-700 underline font-medium hover:text-blue-900"
                >
                  {showNotesInput ? 'Tutup Catatan' : '+ Catatan Admin (Opsional)'}
                </button>
                <button
                  type="button"
                  disabled={!canValidate}
                  onClick={() => onValidateAndSaveReport(adminNotes)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>VALIDASI SELESAI & SIMPAN LAPORAN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onUserSubmitToCheck}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Notifikasi ke Admin</span>
              </button>
            )}
          </div>
        )}

        {/* Optional Admin Notes Input prior to validation */}
        {showNotesInput && currentRole === 'ADMIN' && canValidate && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 animate-in fade-in duration-150">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Validasi Admin (Akan dicetak di laporan resmi):
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Contoh: Stok telah diverifikasi fisik di 3 toko cabang, hasil cocok dengan sistem."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

      </div>

    </div>
  );
}
