import { useState, useMemo } from 'react';
import { 
  Search, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  AlertCircle,
  Flag,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { StockItem, UserRole } from '../types/stock';

interface StockTableProps {
  items: StockItem[];
  thresholdN: number;
  currentRole: UserRole;
  isAuditFinalized: boolean;
  onToggleCheck: (itemId: string) => void;
  onOpenFlagModal: (item: StockItem) => void;
  onBulkCheck: (ids: string[], checked: boolean) => void;
  onChangeThresholdN?: (newN: number) => void;
}

export function StockTable({
  items,
  thresholdN,
  currentRole,
  isAuditFinalized,
  onToggleCheck,
  onOpenFlagModal,
  onBulkCheck,
  onChangeThresholdN,
}: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNCHECKED' | 'CHECKED' | 'CRITICAL' | 'FLAGGED'>('ALL');
  const [isEditingN, setIsEditingN] = useState(false);
  const [tempN, setTempN] = useState(String(thresholdN));

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(tempN, 10);
    if (!isNaN(parsed) && parsed >= 0 && onChangeThresholdN) {
      onChangeThresholdN(parsed);
      setIsEditingN(false);
    }
  };

  // Filter items based on search and selected filter chip
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        item.kodeItem.toLowerCase().includes(query) ||
        item.namaItem.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // 2. Filter mode
      if (filterMode === 'UNCHECKED') return !item.isChecked;
      if (filterMode === 'CHECKED') return item.isChecked;
      if (filterMode === 'CRITICAL') {
        return (
          item.stokToko1 <= thresholdN ||
          item.stokToko2 <= thresholdN ||
          item.stokToko3 <= thresholdN
        );
      }
      if (filterMode === 'FLAGGED') return !!item.adminFlagged;

      return true;
    });
  }, [items, searchQuery, filterMode, thresholdN]);

  // Statistics for quick badge counts
  const stats = useMemo(() => {
    const total = items.length;
    const checked = items.filter((i) => i.isChecked).length;
    const unchecked = total - checked;
    const critical = items.filter(
      (i) => i.stokToko1 <= thresholdN || i.stokToko2 <= thresholdN || i.stokToko3 <= thresholdN
    ).length;
    const flagged = items.filter((i) => i.adminFlagged).length;

    return { total, checked, unchecked, critical, flagged };
  }, [items, thresholdN]);

  const handleCheckVisibleAll = (shouldCheck: boolean) => {
    const visibleIds = filteredItems.map((i) => i.id);
    onBulkCheck(visibleIds, shouldCheck);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Kode Item atau Nama Item..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
          </div>

          {/* Ambang Batas Kritis (N) Control for Admin */}
          <div className="flex items-center gap-2">
            {currentRole === 'ADMIN' ? (
              isEditingN ? (
                <form onSubmit={handleSaveThreshold} className="flex items-center gap-1.5 bg-white border border-rose-300 rounded-lg px-2.5 py-1 shadow-xs">
                  <span className="text-[11px] font-bold text-rose-700">Ubah N:</span>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={tempN}
                    onChange={(e) => setTempN(e.target.value)}
                    className="w-16 px-1.5 py-0.5 text-xs font-bold text-rose-600 border border-slate-300 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none text-center"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempN(String(thresholdN));
                      setIsEditingN(false);
                    }}
                    className="px-1.5 py-0.5 text-slate-500 hover:text-slate-700 text-[11px]"
                  >
                    Batal
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500">Batas Kritis:</span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                    N = {thresholdN} unit
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempN(String(thresholdN));
                      setIsEditingN(true);
                    }}
                    className="ml-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    title="Ubah ambang batas kritis stok toko"
                  >
                    Ubah N
                  </button>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500">Batas Kritis:</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                  N &le; {thresholdN} unit
                </span>
              </div>
            )}

            {/* Quick Bulk Actions for User */}
            {!isAuditFinalized && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCheckVisibleAll(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  title="Tandai semua barang yang terlihat saat ini sebagai SUDAH DICEK"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Centang Semua ({filteredItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckVisibleAll(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  title="Hapus centang semua barang yang terlihat"
                >
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Centang</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>

          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filterMode === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua Barang ({stats.total})
          </button>

          <button
            onClick={() => setFilterMode('UNCHECKED')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              filterMode === 'UNCHECKED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Square className="w-3 h-3" />
            <span>Belum Dicek ({stats.unchecked})</span>
          </button>

          <button
            onClick={() => setFilterMode('CHECKED')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              filterMode === 'CHECKED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Sudah Dicek ({stats.checked})</span>
          </button>

          <button
            onClick={() => setFilterMode('CRITICAL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              filterMode === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
            title={`Barang dengan stok Sempu, Pilar, atau Serang yang <= ${thresholdN}`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Stok Kritis Sempu/Pilar/Serang &le; {thresholdN} ({stats.critical})</span>
          </button>

          {stats.flagged > 0 && (
            <button
              onClick={() => setFilterMode('FLAGGED')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                filterMode === 'FLAGGED'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 animate-pulse'
              }`}
            >
              <Flag className="w-3 h-3 text-amber-600" />
              <span>Ditandai Admin / Terlewat ({stats.flagged})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 6-Column Table: Kode Item, Nama Item, Pusat, Sempu, Pilar, Serang */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 select-none">
              <th className="py-3 px-3 w-12 text-center text-slate-400">#</th>
              <th className="py-3 px-3 min-w-[120px] uppercase tracking-wider text-[11px]">
                1. Kode Item
              </th>
              <th className="py-3 px-4 min-w-[240px] uppercase tracking-wider text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span>2. Nama Item</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 flex items-center gap-0.5">
                    <ArrowUpDown className="w-2.5 h-2.5" /> A-Z
                  </span>
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[110px] uppercase tracking-wider text-[11px] text-slate-700">
                3. Pusat
              </th>
              <th className="py-3 px-3 text-right min-w-[125px] uppercase tracking-wider text-[11px] bg-slate-50/50">
                <div className="flex flex-col items-end">
                  <span>4. Sempu</span>
                  <span className="text-[9px] font-normal text-slate-400">Tanda &le; {thresholdN}</span>
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[125px] uppercase tracking-wider text-[11px] bg-slate-50/50">
                <div className="flex flex-col items-end">
                  <span>5. Pilar</span>
                  <span className="text-[9px] font-normal text-slate-400">Tanda &le; {thresholdN}</span>
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[125px] uppercase tracking-wider text-[11px] bg-slate-50/50">
                <div className="flex flex-col items-end">
                  <span>6. Serang</span>
                  <span className="text-[9px] font-normal text-slate-400">Tanda &le; {thresholdN}</span>
                </div>
              </th>
              {/* Checkbox column on the right side as requested */}
              <th className="py-3 px-4 text-center min-w-[150px] uppercase tracking-wider text-[11px] bg-indigo-50/60 text-indigo-900 border-l border-indigo-100">
                <div className="flex flex-col items-center">
                  <span>Pengecekan (Checkbox)</span>
                  <span className="text-[9px] font-normal text-indigo-600">Ceklis = Selesai</span>
                </div>
              </th>
              {/* Admin Validation Actions Column */}
              <th className="py-3 px-3 text-center min-w-[130px] uppercase tracking-wider text-[11px] bg-slate-100 text-slate-700 border-l border-slate-200">
                Validasi Admin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-sm">Tidak ada barang yang cocok dengan filter.</p>
                    <p className="text-xs">Coba ubah kata kunci pencarian atau ganti filter chip.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const isT1Crit = item.stokToko1 <= thresholdN;
                const isT2Crit = item.stokToko2 <= thresholdN;
                const isT3Crit = item.stokToko3 <= thresholdN;
                const anyCrit = isT1Crit || isT2Crit || isT3Crit;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      item.adminFlagged
                        ? 'bg-amber-50/80 hover:bg-amber-100/70 border-l-4 border-l-amber-500'
                        : item.isChecked
                        ? 'bg-emerald-50/30 hover:bg-emerald-50/70'
                        : anyCrit
                        ? 'bg-rose-50/20 hover:bg-rose-50/50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-[11px] font-mono text-slate-400">
                      {index + 1}
                    </td>

                    {/* 1. KODE ITEM */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
                        {item.kodeItem}
                      </span>
                    </td>

                    {/* 2. NAMA ITEM (Sorted A-Z) */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {item.namaItem}
                      </div>

                      {/* Flag notification banner inside row if admin flagged as missed */}
                      {item.adminFlagged && (
                        <div className="mt-1 flex items-start gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-100/90 border border-amber-300 rounded-md p-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.2" />
                          <div>
                            <strong>Tanda Terlewat oleh Admin:</strong> {item.adminNote || 'Perlu cek fisik ulang'}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 3. STOK PUSAT */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                      {item.stokPusat.toLocaleString('id-ID')}
                    </td>

                    {/* 4. STOK TOKO 1 (Format Penandaan <= N) */}
                    <td className="py-3 px-3 text-right">
                      {isT1Crit ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            {item.stokToko1}
                          </span>
                          <span className="text-[9px] text-rose-600 font-semibold tracking-tight">
                            &le; {thresholdN} unit
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-medium text-slate-700">
                          {item.stokToko1.toLocaleString('id-ID')}
                        </span>
                      )}
                    </td>

                    {/* 5. STOK TOKO 2 (Format Penandaan <= N) */}
                    <td className="py-3 px-3 text-right">
                      {isT2Crit ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            {item.stokToko2}
                          </span>
                          <span className="text-[9px] text-rose-600 font-semibold tracking-tight">
                            &le; {thresholdN} unit
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-medium text-slate-700">
                          {item.stokToko2.toLocaleString('id-ID')}
                        </span>
                      )}
                    </td>

                    {/* 6. STOK TOKO 3 (Format Penandaan <= N) */}
                    <td className="py-3 px-3 text-right">
                      {isT3Crit ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            {item.stokToko3}
                          </span>
                          <span className="text-[9px] text-rose-600 font-semibold tracking-tight">
                            &le; {thresholdN} unit
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-medium text-slate-700">
                          {item.stokToko3.toLocaleString('id-ID')}
                        </span>
                      )}
                    </td>

                    {/* PADA SEBELAH KANAN TABEL ADA CHECKBOX: JIKA CHECKBOX TELAH DICEKLIS MAKA DATA SUDAH DICEK */}
                    <td className="py-3 px-4 text-center bg-indigo-50/20 border-l border-indigo-100">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            disabled={isAuditFinalized}
                            onChange={() => onToggleCheck(item.id)}
                            className="w-5 h-5 rounded-md text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                          />
                          <span
                            className={`text-xs font-bold ${
                              item.isChecked ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {item.isChecked ? 'Sudah Dicek' : 'Belum Dicek'}
                          </span>
                        </label>

                        {/* Timestamp if checked */}
                        {item.isChecked && item.checkedAt && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(item.checkedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* VALIDASI ADMIN COLUMN: Admin bisa beri tanda jika terlewat */}
                    <td className="py-3 px-3 text-center border-l border-slate-200">
                      {currentRole === 'ADMIN' ? (
                        <button
                          type="button"
                          onClick={() => onOpenFlagModal(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            item.adminFlagged
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                              : 'bg-white hover:bg-amber-50 border border-slate-300 text-slate-700 hover:text-amber-800'
                          }`}
                          title="Jika serasa ada barang yang terlewat, admin memberikan tanda dan validasi ditangguhkan"
                        >
                          <Flag className={`w-3.5 h-3.5 ${item.adminFlagged ? 'fill-white' : 'text-amber-600'}`} />
                          <span>{item.adminFlagged ? 'Revisi Aktif' : 'Tandai Terlewat'}</span>
                        </button>
                      ) : (
                        // Checker view
                        item.adminFlagged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Perlu Dicek Ulang</span>
                          </span>
                        ) : item.isChecked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Siap Divalidasi</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Menunggu</span>
                        )
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Stats */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Menampilkan <strong>{filteredItems.length}</strong> dari <strong>{items.length}</strong> total barang (diurutkan A-Z)
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Merah: Stok Sempu/Pilar/Serang &le; {thresholdN} unit</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Hijau: Sudah Dicek</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Kuning: Ditandai Terlewat oleh Admin</span>
          </span>
        </div>
      </div>

    </div>
  );
}
