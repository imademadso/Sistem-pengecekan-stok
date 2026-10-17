import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  ShieldCheck, 
  Calendar, 
  User, 
  AlertTriangle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { AuditReportSummary } from '../types/stock';
import { exportReportToExcel } from '../utils/excelHelper';

interface ReportViewModalProps {
  isOpen: boolean;
  report: AuditReportSummary | null;
  onClose: () => void;
}

export function ReportViewModal({ isOpen, report, onClose }: ReportViewModalProps) {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportReportToExcel(report);
  };

  const totalKeseluruhanStok =
    report.totalPusat + report.totalToko1 + report.totalToko2 + report.totalToko3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  Laporan Hasil Pengecekan Stok
                </h2>
                <p className="text-xs text-slate-400 truncate">
                  Telah divalidasi oleh Admin Gudang
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="sm:hidden text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="hidden sm:block text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:p-0">
          
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 font-mono">
                  DOKUMEN RESMI STOCK OPNAME
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  LAPORAN HASIL PENGECEKAN STOK BARANG
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sesi: <span className="font-bold text-slate-700">{report.judul}</span> | ID: #{report.id.substring(0, 12)}
                </p>
              </div>

              {/* Status Stamp */}
              <div className="border-2 border-emerald-600 rounded-xl p-2.5 text-center bg-emerald-50/50 print:bg-white self-start sm:self-auto">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                  STATUS AUDIT
                </span>
                <span className="text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> TERVALIDASI ADMIN
                </span>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Tanggal Validasi</span>
                  <span className="font-bold text-slate-800">
                    {new Date(report.tanggalSelesai).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Admin Validator</span>
                  <span className="font-bold text-slate-800">{report.namaAdmin}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Petugas Checker</span>
                  <span className="font-bold text-slate-800">{report.namaChecker}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Batas Kritis (N)</span>
                  <span className="font-bold text-rose-600">&le; {report.thresholdN} unit</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Statistics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Jenis Barang</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">{report.totalItem}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Dicek ({report.totalDicek})</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Pusat</span>
              <span className="text-xl font-extrabold text-slate-800 font-mono mt-0.5 block">
                {report.totalPusat.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Gudang Pusat</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Sempu</span>
              <span className="text-xl font-extrabold text-slate-800 font-mono mt-0.5 block">
                {report.totalToko1.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-rose-600 font-semibold">
                {report.kritisToko1} item &le; {report.thresholdN}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Pilar</span>
              <span className="text-xl font-extrabold text-slate-800 font-mono mt-0.5 block">
                {report.totalToko2.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-rose-600 font-semibold">
                {report.kritisToko2} item &le; {report.thresholdN}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Serang</span>
              <span className="text-xl font-extrabold text-slate-800 font-mono mt-0.5 block">
                {report.totalToko3.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-rose-600 font-semibold">
                {report.kritisToko3} item &le; {report.thresholdN}
              </span>
            </div>
          </div>

          {/* Admin Validation Note if available */}
          {report.catatanAdmin && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
              <span className="font-bold">Catatan Verifikasi Admin:</span> {report.catatanAdmin}
            </div>
          )}

          {/* Clean 6-Column Data Table: Kode Item, Nama Item, Pusat, Sempu, Pilar, Serang */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center text-slate-400">No</th>
                  <th className="py-2.5 px-3">Kode Item</th>
                  <th className="py-2.5 px-3">Nama Item (A-Z)</th>
                  <th className="py-2.5 px-3 text-right">Pusat</th>
                  <th className="py-2.5 px-3 text-right">Sempu</th>
                  <th className="py-2.5 px-3 text-right">Pilar</th>
                  <th className="py-2.5 px-3 text-right">Serang</th>
                  <th className="py-2.5 px-3 text-center">Status Cek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.items.map((it, idx) => {
                  const isSempuCrit = it.stokToko1 <= report.thresholdN;
                  const isPilarCrit = it.stokToko2 <= report.thresholdN;
                  const isSerangCrit = it.stokToko3 <= report.thresholdN;

                  return (
                    <tr key={it.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">
                        {it.kodeItem}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {it.namaItem}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {it.stokPusat}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-mono ${isSempuCrit ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {it.stokToko1} {isSempuCrit && `(<= ${report.thresholdN})`}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-mono ${isPilarCrit ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {it.stokToko2} {isPilarCrit && `(<= ${report.thresholdN})`}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-mono ${isSerangCrit ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {it.stokToko3} {isSerangCrit && `(<= ${report.thresholdN})`}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sudah Dicek</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signature Block for Official Printouts */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 print-break-inside-avoid">
            <div className="text-center">
              <p className="text-xs text-slate-500">Petugas Pengecekan Lapangan,</p>
              <div className="h-16 flex items-end justify-center">
                <span className="border-b border-dashed border-slate-400 w-48 block"></span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">({report.namaChecker})</p>
              <p className="text-[10px] text-slate-400">Staff Stock Opname</p>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">Divalidasi & Disetujui Oleh,</p>
              <div className="h-16 flex items-end justify-center">
                <span className="border-b border-dashed border-slate-400 w-48 block"></span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">({report.namaAdmin})</p>
              <p className="text-[10px] text-slate-400">Kepala Gudang / Admin Stok</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
