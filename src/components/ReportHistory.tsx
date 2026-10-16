import { 
  History, 
  FileSpreadsheet, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  Boxes
} from 'lucide-react';
import { AuditReportSummary } from '../types/stock';
import { exportReportToExcel } from '../utils/excelHelper';

interface ReportHistoryProps {
  reports: AuditReportSummary[];
  onViewReport: (report: AuditReportSummary) => void;
  onDeleteReport: (reportId: string) => void;
  onBackToAudit: () => void;
}

export function ReportHistory({
  reports,
  onViewReport,
  onDeleteReport,
  onBackToAudit,
}: ReportHistoryProps) {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Belum Ada Laporan Tersimpan</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
          Setelah alur pengecekan oleh User tuntas (100%) dan divalidasi oleh Admin tanpa ada barang yang terlewat, laporan resmi akan otomatis tersimpan di sini.
        </p>
        <button
          onClick={onBackToAudit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Kembali ke Pengecekan Aktif
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Arsip Laporan Hasil Pengecekan Stok ({reports.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Riwayat seluruh sesi stock opname yang telah berhasil divalidasi oleh Admin.
          </p>
        </div>

        <button
          onClick={onBackToAudit}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto"
        >
          &larr; Kembali ke Pengecekan Aktif
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((rep) => {
          const totalStok = rep.totalPusat + rep.totalToko1 + rep.totalToko2 + rep.totalToko3;

          return (
            <div
              key={rep.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>TERVALIDASI</span>
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{rep.judul}</h3>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(rep.tanggalSelesai).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{rep.totalItem}</strong> jenis barang ({totalStok.toLocaleString('id-ID')} unit)
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    Validator: <strong>{rep.namaAdmin}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-rose-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Batas Kritis N &le; <strong>{rep.thresholdN}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onViewReport(rep)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat / Cetak</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportReportToExcel(rep)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors"
                  title="Unduh ulang file Excel .xlsx"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus arsip laporan "${rep.judul}"?`)) {
                      onDeleteReport(rep.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus Laporan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
