import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  Check, 
  RotateCcw, 
  HelpCircle,
  Building2,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus
} from 'lucide-react';
import { StockItem } from '../types/stock';

interface StockDiscrepancyModalProps {
  isOpen: boolean;
  item: StockItem | null;
  onClose: () => void;
  onSaveDiscrepancy: (itemId: string, actualStock: number, note: string) => void;
  onRemoveDiscrepancy: (itemId: string) => void;
}

export function StockDiscrepancyModal({
  isOpen,
  item,
  onClose,
  onSaveDiscrepancy,
  onRemoveDiscrepancy,
}: StockDiscrepancyModalProps) {
  const [actualStockStr, setActualStockStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (item) {
      if (item.stokPusatAktual !== undefined && item.stokPusatAktual !== null) {
        setActualStockStr(String(item.stokPusatAktual));
      } else {
        setActualStockStr(String(item.stokPusat));
      }
      setNote(item.discrepancyNote || '');
      setErrorMsg('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const systemStock = item.stokPusat;
  const parsedActual = parseInt(actualStockStr, 10);
  const isValidNumber = !isNaN(parsedActual) && parsedActual >= 0;
  const difference = isValidNumber ? parsedActual - systemStock : 0;

  const handleAdjust = (delta: number) => {
    const current = isNaN(parsedActual) ? systemStock : parsedActual;
    const nextVal = Math.max(0, current + delta);
    setActualStockStr(String(nextVal));
    setErrorMsg('');
  };

  const handleQuickReason = (reason: string) => {
    setNote((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}. ${reason}` : reason;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNumber) {
      setErrorMsg('Masukkan jumlah stok fisik sebenarnya yang valid (angka 0 atau lebih).');
      return;
    }

    if (parsedActual === systemStock && !note.trim()) {
      setErrorMsg('Jumlah stok sebenarnya sama dengan stok sistem. Jika stok memang sesuai, silakan gunakan tombol "Hapus Tanda / Reset".');
      return;
    }

    onSaveDiscrepancy(item.id, parsedActual, note.trim() || 'Stok fisik tidak sesuai data sistem');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Tandai Stok Pusat Tidak Sesuai
              </h3>
              <p className="text-[11px] text-amber-100">
                Catat stok fisik aktual dan laporkan selisih barang di gudang pusat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Item Info Card */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                  {item.kodeItem}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">
                  {item.namaItem}
                </h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-500 block">Stok Sistem Pusat</span>
                <span className="text-base font-extrabold text-blue-700 font-mono">
                  {systemStock} <span className="text-xs font-normal text-slate-500">unit</span>
                </span>
              </div>
            </div>
          </div>

          {/* Actual Physical Stock Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Stok Sebenarnya (Hasil Hitung Fisik Petugas di Pusat):
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust(-10)}
                className="w-10 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center text-xs active:scale-95 transition-all"
                title="Kurang 10"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                className="w-10 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                title="Kurang 1"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={actualStockStr}
                  onChange={(e) => {
                    setActualStockStr(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="0"
                  className="w-full text-center text-lg font-bold font-mono py-2 bg-amber-50/50 border-2 border-amber-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none text-slate-900"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAdjust(1)}
                className="w-10 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                title="Tambah 1"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(10)}
                className="w-10 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center text-xs active:scale-95 transition-all"
                title="Tambah 10"
              >
                +10
              </button>
            </div>

            {/* Difference Calculation Callout */}
            {isValidNumber && (
              <div 
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  difference < 0 
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : difference > 0 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {difference < 0 ? (
                    <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : difference > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className="font-medium">
                    {difference < 0 ? (
                      <>Stok Fisik Lebih Sedikit: Kurang <strong>{Math.abs(difference)}</strong> unit</>
                    ) : difference > 0 ? (
                      <>Stok Fisik Lebih Banyak: Surplus <strong>+{difference}</strong> unit</>
                    ) : (
                      <>Stok fisik sama dengan data sistem (Cocok)</>
                    )}
                  </span>
                </div>
                <div className="font-mono font-bold text-sm">
                  {difference > 0 ? `+${difference}` : difference}
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
            )}
          </div>

          {/* Note / Reason Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Alasan / Keterangan Ketidaksesuaian:
              </label>
              <span className="text-[11px] text-slate-400">Opsional</span>
            </div>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Ditemukan 4 dus basah/rusak saat bongkar muat, atau barang belum tercatat sistem."
              className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-400"
            />

            {/* Quick Reason Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                'Barang Rusak/Cacat',
                'Kadaluarsa',
                'Selisih Kirim Gudang',
                'Salah Input Sistem',
                'Fisik Hilang'
              ].map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => handleQuickReason(reason)}
                  className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 rounded-lg border border-slate-200 transition-colors"
                >
                  + {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            {item.isDiscrepancy ? (
              <button
                type="button"
                onClick={() => {
                  onRemoveDiscrepancy(item.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-rose-200 sm:border-transparent"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hapus Tanda / Reset ke Sesuai</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Stok Sebenarnya</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
