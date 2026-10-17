import React, { useState, useMemo } from 'react';
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
  Filter,
  LayoutGrid,
  Table as TableIcon,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Edit2
} from 'lucide-react';
import { StockItem, UserRole } from '../types/stock';

interface StockTableProps {
  items: StockItem[];
  thresholdN: number;
  currentRole: UserRole;
  isAuditFinalized: boolean;
  onToggleCheck: (itemId: string) => void;
  onOpenFlagModal: (item: StockItem) => void;
  onOpenDiscrepancyModal: (item: StockItem) => void;
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
  onOpenDiscrepancyModal,
  onBulkCheck,
  onChangeThresholdN,
}: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNCHECKED' | 'CHECKED' | 'CRITICAL' | 'FLAGGED' | 'DISCREPANCY'>('ALL');
  const [isEditingN, setIsEditingN] = useState(false);
  const [tempN, setTempN] = useState(String(thresholdN));
  const [viewMode, setViewMode] = useState<'auto' | 'card' | 'table'>('auto');

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
      if (filterMode === 'DISCREPANCY') return !!item.isDiscrepancy;

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
    const discrepancy = items.filter((i) => i.isDiscrepancy).length;

    return { total, checked, unchecked, critical, flagged, discrepancy };
  }, [items, thresholdN]);

  const handleCheckVisibleAll = (shouldCheck: boolean) => {
    const visibleIds = filteredItems.map((i) => i.id);
    onBulkCheck(visibleIds, shouldCheck);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Search & Filter Toolbar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        
        {/* Row 1: Search & Ambang Batas N */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Kode Item atau Nama Item..."
              className="w-full pl-9 pr-8 py-2.5 sm:py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            )}
          </div>

          {/* Ambang Batas Kritis & View Mode Switcher */}
          <div className="flex items-center flex-wrap gap-2 justify-between sm:justify-start">
            
            {/* Ambang Batas Kritis (N) Control */}
            {currentRole === 'ADMIN' ? (
              isEditingN ? (
                <form onSubmit={handleSaveThreshold} className="flex items-center gap-1.5 bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-rose-700">Ubah N:</span>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={tempN}
                    onChange={(e) => setTempN(e.target.value)}
                    className="w-14 px-1.5 py-0.5 text-xs font-bold text-rose-600 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none text-center"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempN(String(thresholdN));
                      setIsEditingN(false);
                    }}
                    className="px-1.5 py-1 text-slate-500 hover:text-slate-700 text-[11px]"
                  >
                    Batal
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Batas Kritis:</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                    N = {thresholdN} unit
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempN(String(thresholdN));
                      setIsEditingN(true);
                    }}
                    className="ml-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                    title="Ubah ambang batas kritis stok toko"
                  >
                    Ubah N
                  </button>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500">Batas Kritis:</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                  N &le; {thresholdN} unit
                </span>
              </div>
            )}

            {/* View Mode Toggle (Card HP vs Table) */}
            <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'card' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'
                }`}
                title="Alihkan Tampilan Kartu HP / Tabel Lengkap"
              >
                {viewMode === 'card' ? (
                  <>
                    <TableIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tabel</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Kartu HP</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Bulk Actions */}
            {!isAuditFinalized && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCheckVisibleAll(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                  title="Tandai semua barang terlihat sebagai SUDAH DICEK"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Centang Semua</span>
                  <span className="sm:hidden">Ceklis ({filteredItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckVisibleAll(false)}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                  title="Hapus centang semua barang terlihat"
                >
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline ml-1">Reset</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Row 2: Filter Chips with Horizontal Scroll Support for Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              filterMode === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('UNCHECKED')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
              filterMode === 'UNCHECKED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Square className="w-3 h-3" />
            <span>Belum Dicek ({stats.unchecked})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('CHECKED')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
              filterMode === 'CHECKED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Sudah Dicek ({stats.checked})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('CRITICAL')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
              filterMode === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
            title={`Barang dengan stok Sempu, Pilar, atau Serang <= ${thresholdN}`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Kritis &le; {thresholdN} ({stats.critical})</span>
          </button>

          {/* New Filter: Stok Pusat Tidak Sesuai / Selisih Fisik */}
          <button
            type="button"
            onClick={() => setFilterMode('DISCREPANCY')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
              filterMode === 'DISCREPANCY'
                ? 'bg-orange-600 text-white shadow-xs'
                : stats.discrepancy > 0 
                ? 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-300 font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            title="Tampilkan hanya barang dengan selisih fisik di gudang pusat"
          >
            <SlidersHorizontal className="w-3 h-3 text-orange-500" />
            <span>Selisih Pusat ({stats.discrepancy})</span>
          </button>

          {stats.flagged > 0 && (
            <button
              type="button"
              onClick={() => setFilterMode('FLAGGED')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
                filterMode === 'FLAGGED'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 animate-pulse'
              }`}
            >
              <Flag className="w-3 h-3 text-amber-600" />
              <span>Terlewat ({stats.flagged})</span>
            </button>
          )}
        </div>

      </div>

      {/* MOBILE-FIRST VIEW: Responsive Cards (Visible on Mobile screens or when viewMode === 'card') */}
      <div className={`${viewMode === 'table' ? 'hidden' : viewMode === 'card' ? 'block' : 'block md:hidden'} p-3 space-y-3`}>
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">Tidak ada barang yang cocok dengan filter.</p>
            <p className="text-xs">Coba ubah kata kunci pencarian atau ganti filter chip.</p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isT1Crit = item.stokToko1 <= thresholdN;
            const isT2Crit = item.stokToko2 <= thresholdN;
            const isT3Crit = item.stokToko3 <= thresholdN;
            const diffPusat = item.isDiscrepancy && item.stokPusatAktual !== undefined && item.stokPusatAktual !== null 
              ? item.stokPusatAktual - item.stokPusat 
              : 0;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.adminFlagged
                    ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300/40'
                    : item.isDiscrepancy
                    ? 'bg-orange-50/40 border-orange-300 ring-1 ring-orange-200'
                    : item.isChecked
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : (isT1Crit || isT2Crit || isT3Crit)
                    ? 'bg-rose-50/30 border-rose-200'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                {/* Top Row: Checkbox + Kode Item + Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      #{index + 1}
                    </span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {item.kodeItem}
                    </span>

                    {/* Badge Penanda Selisih Stok Pusat */}
                    {item.isDiscrepancy && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white flex items-center gap-1 shadow-2xs">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Selisih Pusat
                      </span>
                    )}

                    {item.adminFlagged && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
                        <Flag className="w-2.5 h-2.5 fill-white" />
                        Terlewat
                      </span>
                    )}
                  </div>

                  {/* Prominent Checkbox Button for Mobile Screen Touch (Min 44x44px target) */}
                  <button
                    type="button"
                    disabled={isAuditFinalized}
                    onClick={() => onToggleCheck(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all select-none active:scale-95 disabled:opacity-50 shrink-0 ${
                      item.isChecked
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {item.isChecked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sudah Dicek</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 text-slate-400" />
                        <span>Ceklis</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Nama Item (A-Z) */}
                <div className="mt-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    {item.namaItem}
                  </h4>
                </div>

                {/* Discrepancy Callout Banner on Card if marked */}
                {item.isDiscrepancy && (
                  <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-xs text-orange-950 flex flex-col gap-1">
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5 text-orange-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>Stok Pusat Tidak Sesuai:</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-extrabold ${
                        diffPusat < 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Fisik: {item.stokPusatAktual} ({diffPusat > 0 ? `+${diffPusat}` : diffPusat})
                      </span>
                    </div>
                    {item.discrepancyNote && (
                      <p className="text-[11px] text-orange-900 italic">
                        &ldquo;{item.discrepancyNote}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* 4-Cell Stock Matrix: Pusat, Sempu, Pilar, Serang */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2 border-t border-slate-100 text-center">
                  
                  {/* Pusat Cell with Discrepancy Display */}
                  <div className={`p-1.5 rounded-xl border relative ${
                    item.isDiscrepancy 
                      ? 'bg-orange-100/70 border-orange-300 text-orange-950' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Pusat
                    </div>
                    {item.isDiscrepancy ? (
                      <div className="mt-0.5">
                        <span className="line-through text-[10px] text-slate-400 block font-mono">
                          {item.stokPusat}
                        </span>
                        <span className="font-mono font-black text-xs sm:text-sm text-orange-700 block">
                          {item.stokPusatAktual}
                        </span>
                      </div>
                    ) : (
                      <div className="font-mono font-bold text-xs sm:text-sm text-slate-800 mt-0.5">
                        {item.stokPusat.toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>

                  {/* Sempu */}
                  <div className={`p-1.5 rounded-xl border ${
                    isT1Crit 
                      ? 'bg-rose-100/90 border-rose-300 text-rose-900' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-0.5">
                      <span>Sempu</span>
                      {isT1Crit && <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />}
                    </div>
                    <div className={`font-mono font-bold text-xs sm:text-sm mt-0.5 ${isT1Crit ? 'text-rose-700' : 'text-slate-800'}`}>
                      {item.stokToko1}
                    </div>
                    {isT1Crit && (
                      <div className="text-[9px] font-bold text-rose-600">&le;{thresholdN}</div>
                    )}
                  </div>

                  {/* Pilar */}
                  <div className={`p-1.5 rounded-xl border ${
                    isT2Crit 
                      ? 'bg-rose-100/90 border-rose-300 text-rose-900' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-0.5">
                      <span>Pilar</span>
                      {isT2Crit && <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />}
                    </div>
                    <div className={`font-mono font-bold text-xs sm:text-sm mt-0.5 ${isT2Crit ? 'text-rose-700' : 'text-slate-800'}`}>
                      {item.stokToko2}
                    </div>
                    {isT2Crit && (
                      <div className="text-[9px] font-bold text-rose-600">&le;{thresholdN}</div>
                    )}
                  </div>

                  {/* Serang */}
                  <div className={`p-1.5 rounded-xl border ${
                    isT3Crit 
                      ? 'bg-rose-100/90 border-rose-300 text-rose-900' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-0.5">
                      <span>Serang</span>
                      {isT3Crit && <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />}
                    </div>
                    <div className={`font-mono font-bold text-xs sm:text-sm mt-0.5 ${isT3Crit ? 'text-rose-700' : 'text-slate-800'}`}>
                      {item.stokToko3}
                    </div>
                    {isT3Crit && (
                      <div className="text-[9px] font-bold text-rose-600">&le;{thresholdN}</div>
                    )}
                  </div>

                </div>

                {/* Flag note if admin marked */}
                {item.adminFlagged && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-100 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Instruksi Admin:</strong> {item.adminNote || 'Barang terlewat, mohon hitung fisik ulang'}
                    </div>
                  </div>
                )}

                {/* Bottom Card Footer: Actions for Discrepancy & Flagging */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div>
                    {item.isChecked && item.checkedAt ? (
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>Dicek {new Date(item.checkedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Belum diverifikasi</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Discrepancy Button for Petugas Cek and Admin */}
                    <button
                      type="button"
                      disabled={isAuditFinalized}
                      onClick={() => onOpenDiscrepancyModal(item)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                        item.isDiscrepancy
                          ? 'bg-orange-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-800 border border-slate-200'
                      }`}
                      title="Tandai jika stok fisik pusat tidak sesuai dengan sistem"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>{item.isDiscrepancy ? 'Ubah Fisik' : 'Stok Tidak Sesuai'}</span>
                    </button>

                    {/* Admin Flag Button */}
                    {currentRole === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => onOpenFlagModal(item)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          item.adminFlagged
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200'
                        }`}
                      >
                        <Flag className={`w-3 h-3 ${item.adminFlagged ? 'fill-white' : 'text-amber-600'}`} />
                        <span>{item.adminFlagged ? 'Revisi Aktif' : 'Tandai'}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW: Full 6-Column Layout (Visible on Desktop or when viewMode === 'table') */}
      <div className={`${viewMode === 'card' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'} overflow-x-auto`}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 select-none">
              <th className="py-3 px-3 w-12 text-center text-slate-400">#</th>
              <th className="py-3 px-3 min-w-[110px] uppercase tracking-wider text-[11px]">
                Kode Item
              </th>
              <th className="py-3 px-4 min-w-[240px] uppercase tracking-wider text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span>Nama Item</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 flex items-center gap-0.5">
                    <ArrowUpDown className="w-2.5 h-2.5" /> A-Z
                  </span>
                </div>
              </th>
              {/* Kolom 3: Stok Pusat (dengan penanda ketidaksesuaian stok) */}
              <th className="py-3 px-3 text-right min-w-[130px] uppercase tracking-wider text-[11px] bg-slate-50 text-slate-700 border-l border-r border-slate-200">
                <div className="flex flex-col items-end">
                  <span>Pusat</span>
                  <span className="text-[9px] font-normal text-slate-400">Tandai Jika Selisih</span>
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[115px] uppercase tracking-wider text-[11px]">
                <div className="flex flex-col items-end">
                  <span>Sempu</span>
                  <span className="text-[9px] font-normal text-slate-400">Tanda &le; {thresholdN}</span>
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[115px] uppercase tracking-wider text-[11px]">
                <div className="flex flex-col items-end">
                  <span>Pilar</span>
                  <span className="text-[9px] font-normal text-slate-400">Tanda &le; {thresholdN}</span>
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[115px] uppercase tracking-wider text-[11px]">
                <div className="flex flex-col items-end">
                  <span>Serang</span>
                  <span className="text-[9px] font-normal text-slate-400">Tanda &le; {thresholdN}</span>
                </div>
              </th>
              {/* Checkbox column */}
              <th className="py-3 px-4 text-center min-w-[150px] uppercase tracking-wider text-[11px] bg-indigo-50/60 text-indigo-900 border-l border-indigo-100">
                <div className="flex flex-col items-center">
                  <span>Pengecekan (Checkbox)</span>
                  <span className="text-[9px] font-normal text-indigo-600">Ceklis = Selesai</span>
                </div>
              </th>
              {/* Actions Column */}
              <th className="py-3 px-3 text-center min-w-[140px] uppercase tracking-wider text-[11px] bg-slate-100 text-slate-700 border-l border-slate-200">
                Aksi & Validasi
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
                const diffPusat = item.isDiscrepancy && item.stokPusatAktual !== undefined && item.stokPusatAktual !== null 
                  ? item.stokPusatAktual - item.stokPusat 
                  : 0;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      item.adminFlagged
                        ? 'bg-amber-50/80 hover:bg-amber-100/70 border-l-4 border-l-amber-500'
                        : item.isDiscrepancy
                        ? 'bg-orange-50/30 hover:bg-orange-50/60 border-l-4 border-l-orange-500'
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
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs">
                        {item.kodeItem}
                      </span>
                    </td>

                    {/* 2. NAMA ITEM (Sorted A-Z) */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {item.namaItem}
                      </div>

                      {/* Discrepancy indicator under item name */}
                      {item.isDiscrepancy && (
                        <div className="mt-1 flex items-start gap-1.5 text-[11px] font-medium text-orange-900 bg-orange-100/80 border border-orange-300 rounded-md p-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Stok Pusat Tidak Sesuai:</strong> Aktual <strong>{item.stokPusatAktual} unit</strong> (Sistem: {item.stokPusat}, Selisih: {diffPusat > 0 ? `+${diffPusat}` : diffPusat}).
                            {item.discrepancyNote && <span className="block text-[10px] text-orange-800 italic mt-0.5">&ldquo;{item.discrepancyNote}&rdquo;</span>}
                          </div>
                        </div>
                      )}

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

                    {/* 3. STOK PUSAT (Fitur Penandaan Stok Tidak Sesuai & Input Sebenarnya) */}
                    <td className="py-3 px-3 text-right border-l border-r border-slate-200 bg-slate-50/40">
                      {item.isDiscrepancy ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="line-through text-slate-400 font-mono text-[10px]">
                            Sistem: {item.stokPusat}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-black text-xs bg-orange-100 text-orange-800 border border-orange-300">
                            Aktual: {item.stokPusatAktual}
                          </span>
                          <span className={`text-[10px] font-bold font-mono ${
                            diffPusat < 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            Selisih: {diffPusat > 0 ? `+${diffPusat}` : diffPusat}
                          </span>
                          <button
                            type="button"
                            disabled={isAuditFinalized}
                            onClick={() => onOpenDiscrepancyModal(item)}
                            className="text-[10px] text-orange-700 hover:text-orange-900 underline font-semibold mt-0.5"
                          >
                            Ubah Fisik
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-medium text-slate-700 text-xs">
                            {item.stokPusat.toLocaleString('id-ID')}
                          </span>
                          {!isAuditFinalized && (
                            <button
                              type="button"
                              onClick={() => onOpenDiscrepancyModal(item)}
                              className="text-[10px] text-slate-400 hover:text-orange-700 hover:underline opacity-60 group-hover:opacity-100 transition-opacity mt-0.5"
                              title="Tandai jika stok fisik gudang pusat berbeda"
                            >
                              + Selisih Fisik
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 4. STOK SEMPU (Format Penandaan <= N) */}
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

                    {/* 5. STOK PILAR (Format Penandaan <= N) */}
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

                    {/* 6. STOK SERANG (Format Penandaan <= N) */}
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

                    {/* PADA SEBELAH KANAN TABEL ADA CHECKBOX */}
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

                    {/* AKSI & VALIDASI COLUMN */}
                    <td className="py-3 px-3 text-center border-l border-slate-200">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Discrepancy Action Button */}
                        <button
                          type="button"
                          disabled={isAuditFinalized}
                          onClick={() => onOpenDiscrepancyModal(item)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                            item.isDiscrepancy
                              ? 'bg-orange-600 text-white shadow-2xs'
                              : 'bg-white hover:bg-orange-50 border border-slate-300 text-slate-600 hover:text-orange-800'
                          }`}
                          title="Tandai stok fisik pusat tidak sesuai atau input stok sebenarnya"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {/* Admin Flag Action Button */}
                        {currentRole === 'ADMIN' ? (
                          <button
                            type="button"
                            onClick={() => onOpenFlagModal(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              item.adminFlagged
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                                : 'bg-white hover:bg-amber-50 border border-slate-300 text-slate-700 hover:text-amber-800'
                            }`}
                            title="Jika merasa ada barang yang terlewat, admin memberikan tanda dan validasi ditangguhkan"
                          >
                            <Flag className={`w-3.5 h-3.5 ${item.adminFlagged ? 'fill-white' : 'text-amber-600'}`} />
                            <span>{item.adminFlagged ? 'Revisi Aktif' : 'Tandai'}</span>
                          </button>
                        ) : (
                          item.adminFlagged ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Revisi</span>
                            </span>
                          ) : item.isChecked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>OK</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Stats */}
      <div className="bg-slate-50 px-3 sm:px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500">
        <div>
          Menampilkan <strong>{filteredItems.length}</strong> dari <strong>{items.length}</strong> barang (Urut A-Z)
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Merah: Stok Toko &le; {thresholdN}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Hijau: Sudah Dicek</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>Oranye: Stok Pusat Tidak Sesuai</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Kuning: Tanda Terlewat</span>
          </span>
        </div>
      </div>

    </div>
  );
}
