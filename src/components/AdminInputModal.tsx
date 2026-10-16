import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  Plus, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { StockItem } from '../types/stock';
import { parseExcelFile, downloadExcelTemplate } from '../utils/excelHelper';
import { RAW_SAMPLE_ITEMS, cleanAndSortItemsAZ } from '../utils/sampleData';

interface AdminInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholdN: number;
  onSaveNewData: (items: StockItem[], newThresholdN: number, sessionTitle: string) => void;
}

export function AdminInputModal({
  isOpen,
  onClose,
  thresholdN,
  onSaveNewData,
}: AdminInputModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'sample' | 'manual'>('upload');
  const [currentThreshold, setCurrentThreshold] = useState<number>(thresholdN);
  const [sessionTitle, setSessionTitle] = useState<string>('Pengecekan Stok Toko (Opname)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<StockItem[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual input form state
  const [manualForm, setManualForm] = useState({
    kodeItem: '',
    namaItem: '',
    stokPusat: 100,
    stokToko1: 25,
    stokToko2: 40,
    stokToko3: 30,
  });

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const result = await parseExcelFile(file);
      // Auto sorted A-Z handled inside parseExcelFile
      setPreviewItems(result.items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses file Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    const preparedItems: StockItem[] = RAW_SAMPLE_ITEMS.map((item, idx) => ({
      ...item,
      id: `sample-${Date.now()}-${idx}`,
      isChecked: false,
      checkedAt: null,
      checkedBy: null,
      adminFlagged: false,
    }));

    // Auto sort A-Z
    const sorted = cleanAndSortItemsAZ(preparedItems);
    setPreviewItems(sorted);
    setErrorMsg(null);
  };

  const handleApplyData = () => {
    if (!previewItems || previewItems.length === 0) {
      setErrorMsg('Tidak ada data barang yang siap diimpor.');
      return;
    }

    onSaveNewData(previewItems, Number(currentThreshold) || 36, sessionTitle || 'Pengecekan Stok');
    onClose();
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.kodeItem.trim() || !manualForm.namaItem.trim()) {
      setErrorMsg('Kode Item dan Nama Item wajib diisi!');
      return;
    }

    const newItem: StockItem = {
      id: `manual-${Date.now()}`,
      kodeItem: manualForm.kodeItem.trim().toUpperCase(),
      namaItem: manualForm.namaItem.trim(),
      stokPusat: Number(manualForm.stokPusat) || 0,
      stokToko1: Number(manualForm.stokToko1) || 0,
      stokToko2: Number(manualForm.stokToko2) || 0,
      stokToko3: Number(manualForm.stokToko3) || 0,
      isChecked: false,
      adminFlagged: false,
    };

    const currentList = previewItems ? [...previewItems, newItem] : [newItem];
    // Automatically sort A-Z by namaItem
    const sorted = cleanAndSortItemsAZ(currentList);
    setPreviewItems(sorted);

    // Reset form inputs
    setManualForm({
      kodeItem: '',
      namaItem: '',
      stokPusat: 100,
      stokToko1: 25,
      stokToko2: 40,
      stokToko3: 30,
    });
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Tahap 1: Admin Input Data Stok Barang
              </h2>
              <p className="text-xs text-slate-400">
                Impor file .xlsx (Excel) 6 kolom, atur batas N, dan sistem akan merapikan data A-Z
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Form Judul & Ambang Batas N */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Sesi Pengecekan
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Contoh: Stock Opname Bulan Ini"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Batas Stok Kritis (N)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={currentThreshold}
                  onChange={(e) => setCurrentThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg text-rose-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">unit</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Stok Sempu, Pilar, Serang yang <strong>&le; {currentThreshold}</strong> akan ditandai merah.
              </p>
            </div>
          </div>

          {/* Input Method Selector */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Unggah File Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sample');
                if (!previewItems) handleLoadSample();
              }}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'sample'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Gunakan Data Contoh (15 Barang)</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Manual</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Klik untuk memilih atau seret file .xlsx ke sini
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mendukung format Microsoft Excel (.xlsx, .xls) atau .csv
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Download template notice */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Belum punya format Excel? Gunakan template standar 6 kolom sistem ini.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadExcelTemplate(currentThreshold)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template .xlsx</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SAMPLE DATA */}
          {activeTab === 'sample' && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    Memuat 15 Barang Sampel Siap Uji
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    Data ini berisi produk supermarket/retail dengan variasi stok toko di atas dan di bawah {currentThreshold} unit, sehingga Anda dapat langsung melihat bagaimana sistem menandai stok kritis dan merapikan urutan A-Z.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
              >
                Muat Ulang Data Sampel
              </button>
            </div>
          )}

          {/* TAB 3: MANUAL INPUT */}
          {activeTab === 'manual' && (
            <form onSubmit={handleAddManualItem} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    1. Kode Item
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: BRG-001"
                    value={manualForm.kodeItem}
                    onChange={(e) => setManualForm({ ...manualForm, kodeItem: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    2. Nama Item
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Beras Ramos Premium 5kg"
                    value={manualForm.namaItem}
                    onChange={(e) => setManualForm({ ...manualForm, namaItem: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    3. Pusat
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualForm.stokPusat}
                    onChange={(e) => setManualForm({ ...manualForm, stokPusat: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    4. Sempu
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualForm.stokToko1}
                    onChange={(e) => setManualForm({ ...manualForm, stokToko1: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    5. Pilar
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualForm.stokToko2}
                    onChange={(e) => setManualForm({ ...manualForm, stokToko2: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    6. Serang
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualForm.stokToko3}
                    onChange={(e) => setManualForm({ ...manualForm, stokToko3: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan Baris ke Daftar</span>
              </button>
            </form>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PREVIEW OF SORTED ITEMS (Requirement 2: SISTEM MERAPIHKAN DATA A-Z) */}
          {previewItems && previewItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Data Berhasil Dirapikan & Diurutkan A-Z ({previewItems.length} Barang Siap Dicek)
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Format 6 Kolom: Kode Item, Nama Item, Pusat, Sempu, Pilar, Serang
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Kode Item</th>
                      <th className="py-2 px-3">Nama Item (A-Z)</th>
                      <th className="py-2 px-3 text-right">Pusat</th>
                      <th className="py-2 px-3 text-right">Sempu</th>
                      <th className="py-2 px-3 text-right">Pilar</th>
                      <th className="py-2 px-3 text-right">Serang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewItems.slice(0, 10).map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-mono font-medium text-slate-600">{it.kodeItem}</td>
                        <td className="py-1.5 px-3 font-medium text-slate-900">{it.namaItem}</td>
                        <td className="py-1.5 px-3 text-right text-slate-600">{it.stokPusat}</td>
                        <td className="py-1.5 px-3 text-right">
                          <span className={it.stokToko1 <= currentThreshold ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {it.stokToko1}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <span className={it.stokToko2 <= currentThreshold ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {it.stokToko2}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <span className={it.stokToko3 <= currentThreshold ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {it.stokToko3}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewItems.length > 10 && (
                <p className="text-[11px] text-slate-400 text-right italic">
                  Menampilkan 10 dari {previewItems.length} total baris...
                </p>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={!previewItems || previewItems.length === 0 || isProcessing}
            onClick={handleApplyData}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Terapkan Data & Mulai Pengecekan</span>
          </button>
        </div>

      </div>
    </div>
  );
}
