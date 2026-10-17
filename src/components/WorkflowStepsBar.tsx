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
      desc: 'Upload .xlsx / Template',
      shortTitle: '1. Input Stok',
      icon: FileSpreadsheet,
      done: totalItems > 0,
      active: activeStep === 1,
    },
    {
      num: 2,
      title: 'Rapihkan Data',
      desc: `Sort A-Z & Cek <= ${thresholdN}`,
      shortTitle: '2. Rapihkan A-Z',
      icon: ArrowUpDown,
      done: totalItems > 0,
      active: activeStep === 2,
    },
    {
      num: 3,
      title: 'Pengecekan User',
      desc: `${checkedCount}/${totalItems} Selesai Dicek`,
      shortTitle: `3. Cek Fisik (${checkedCount}/${totalItems})`,
      icon: ClipboardCheck,
      done: isAllChecked && !hasRevision,
      active: activeStep === 3,
    },
    {
      num: 4,
      title: 'Validasi Admin',
      desc: hasRevision ? `${flaggedCount} Terlewat` : (isAllChecked ? 'Siap Validasi' : 'Menunggu Selesai'),
      shortTitle: hasRevision ? '4. Revisi' : '4. Validasi',
      icon: ShieldCheck,
      done: isDone,
      active: activeStep === 4,
      alert: hasRevision,
    },
    {
      num: 5,
      title: 'Laporan Final',
      desc: isDone ? 'Arsip & Ekspor Excel' : 'Menunggu Validasi',
      shortTitle: '5. Laporan',
      icon: FileCheck,
      done: isDone,
      active: activeStep === 5,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span>Alur Sistem Pengecekan Barang</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            5 Tahap
          </span>
        </h3>
        <span className="text-xs text-slate-500">
          Ambang Batas Kritis: <strong className="text-rose-600 font-bold">N &le; {thresholdN} unit</strong>
        </span>
      </div>

      {/* Mobile Horizontal Stepper (Scrollable row on small screens) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {steps.map((st) => {
          return (
            <div
              key={st.num}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0 text-[11px] font-bold ${
                st.done
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : st.alert
                  ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  : st.active
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-1 ring-indigo-400/40'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              {st.done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  st.active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {st.num}
                </span>
              )}
              <span>{st.shortTitle}</span>
            </div>
          );
        })}
      </div>

      {/* Desktop Grid Layout (Hidden on Mobile) */}
      <div className="hidden md:grid grid-cols-5 gap-2.5">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              className={`relative flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                st.done
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : st.alert
                  ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  : st.active
                  ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  st.done
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : st.alert
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : st.active
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {st.done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="min-w-0">
                <div className="font-bold text-xs truncate">{st.title}</div>
                <div className="text-[10px] truncate text-slate-500">{st.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
