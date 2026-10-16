import { CheckCircle2, FileSpreadsheet, ArrowUpDown, ClipboardCheck, ShieldCheck, FileCheck } from 'lucide-react';
import { AuditStatus } from '../types/stock';

interface WorkflowStepsBarProps {
  currentStatus: AuditStatus;
  totalItems: number;
  checkedCount: number;
  flaggedCount: number;
  thresholdN: number;
}

export function WorkflowStepsBar({
  currentStatus,
  totalItems,
  checkedCount,
  flaggedCount,
  thresholdN,
}: WorkflowStepsBarProps) {
  const isAllChecked = totalItems > 0 && checkedCount === totalItems;
  const hasRevision = flaggedCount > 0;
  const isDone = currentStatus === 'TERVALIDASI';

  // Determine current active step (1 to 5)
  let activeStep = 3; // default checking
  if (totalItems === 0) activeStep = 1;
  else if (isDone) activeStep = 5;
  else if (hasRevision) activeStep = 4;
  else if (isAllChecked) activeStep = 4;
  else activeStep = 3;

  const steps = [
    {
      num: 1,
      title: 'Admin Input Stok',
      desc: 'Upload file .xlsx / Template',
      icon: FileSpreadsheet,
      done: totalItems > 0,
      active: activeStep === 1,
    },
    {
      num: 2,
      title: 'Sistem Rapihkan Data',
      desc: `Sort A-Z & Cek Sempu/Pilar/Serang <= ${thresholdN}`,
      icon: ArrowUpDown,
      done: totalItems > 0,
      active: activeStep === 2,
    },
    {
      num: 3,
      title: 'Pengecekan oleh User',
      desc: `${checkedCount}/${totalItems} Selesai Dicek`,
      icon: ClipboardCheck,
      done: isAllChecked && !hasRevision,
      active: activeStep === 3,
    },
    {
      num: 4,
      title: 'Validasi Admin',
      desc: hasRevision ? `${flaggedCount} Item Terlewat/Revisi` : (isAllChecked ? 'Siap Divalidasi' : 'Menunggu Pengecekan'),
      icon: ShieldCheck,
      done: isDone,
      active: activeStep === 4,
      alert: hasRevision,
    },
    {
      num: 5,
      title: 'Laporan Tersimpan',
      desc: isDone ? 'Arsip & Ekspor Excel' : 'Menunggu Validasi',
      icon: FileCheck,
      done: isDone,
      active: activeStep === 5,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span>Alur Sistem Pengecekan Barang Sederhana</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            Standar 5 Tahap
          </span>
        </h3>
        <span className="text-xs text-slate-400">
          Ambang Batas Kritis: <strong className="text-rose-600 font-bold">N = {thresholdN}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${
                st.done
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : st.alert
                  ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  : st.active
                  ? 'bg-blue-50/90 border-blue-300 text-blue-900 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 text-slate-600 opacity-80'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-semibold text-xs transition-colors ${
                  st.done
                    ? 'bg-emerald-600 text-white'
                    : st.alert
                    ? 'bg-amber-500 text-white'
                    : st.active
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {st.done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                    Tahap {st.num}
                  </span>
                </div>
                <div className="text-xs font-bold truncate leading-snug">{st.title}</div>
                <div className="text-[11px] text-slate-500 truncate">{st.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
