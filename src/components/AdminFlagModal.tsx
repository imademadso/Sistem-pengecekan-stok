import { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { StockItem } from '../types/stock';

interface AdminFlagModalProps {
  isOpen: boolean;
  item: StockItem | null;
  onClose: () => void;
  onSaveFlag: (itemId: string, note: string) => void;
  onRemoveFlag: (itemId: string) => void;
}

export function AdminFlagModal({
  isOpen,
  item,
  onClose,
  onSaveFlag,
  onRemoveFlag,
}: AdminFlagModalProps) {
  const [note, setNote] = useState(item?.adminNote || '');

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFlag(item.id, note.trim() || 'Mohon cek ulang fisik barang ini');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-amber-500 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-100" />
            <h3 className="font-bold text-sm">Tandai Barang Terlewat / Perlu Revisi</h3>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900">
            <p className="font-bold">{item.kodeItem} - {item.namaItem}</p>
            <p className="text-[11px] text-amber-700 mt-1">
              Jika ditandai terlewat, status checklist item ini akan di-reset dan sistem <strong>tidak dapat divalidasi</strong> sampai Petugas Cek memeriksa kembali barang ini hingga tuntas.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Instruksi untuk Petugas Cek:
            </label>
            <textarea
              rows={3}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Barang terlewat di rak B3, mohon hitung fisik ulang karena stok toko 2 terlihat selisih."
              className="w-full text-xs p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {item.adminFlagged ? (
              <button
                type="button"
                onClick={() => {
                  onRemoveFlag(item.id);
                  onClose();
                }}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors"
              >
                Hapus Tanda Terlewat
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Tanda</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
