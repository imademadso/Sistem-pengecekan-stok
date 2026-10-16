import * as XLSX from 'xlsx';
import { StockItem, AuditReportSummary } from '../types/stock';
import { cleanAndSortItemsAZ } from './sampleData';

/**
 * Normalizes header string to help with fuzzy column matching
 */
function normalizeHeader(header: any): string {
  if (typeof header !== 'string') return String(header || '').trim().toLowerCase();
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parses an Excel (.xlsx or .xls) or CSV file buffer into sanitized StockItem array
 */
export async function parseExcelFile(file: File): Promise<{
  items: StockItem[];
  rowCount: number;
  warnings: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to array of arrays to inspect headers and rows
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (rows.length < 2) {
          throw new Error('File Excel kosong atau hanya berisi baris judul.');
        }

        // Find header row (usually first non-empty row)
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i];
          const hasItemOrKode = row.some((cell) => {
            const norm = normalizeHeader(cell);
            return norm.includes('kode') || norm.includes('nama') || norm.includes('item') || norm.includes('barang');
          });
          if (hasItemOrKode) {
            headerRowIndex = i;
            break;
          }
        }

        let colKode = -1;
        let colNama = -1;
        let colPusat = -1;
        let colToko1 = -1;
        let colToko2 = -1;
        let colToko3 = -1;

        if (headerRowIndex !== -1) {
          const headers = rows[headerRowIndex];
          headers.forEach((cell, idx) => {
            const norm = normalizeHeader(cell);
            if (norm.includes('kode') || norm.includes('barcode') || norm.includes('sku') || norm === 'kodeitem') {
              if (colKode === -1) colKode = idx;
            } else if (norm.includes('nama') || norm.includes('item') || norm.includes('barang') || norm.includes('deskripsi')) {
              if (colNama === -1) colNama = idx;
            } else if (norm.includes('pusat') || norm.includes('gudang') || norm.includes('wh') || norm.includes('central')) {
              if (colPusat === -1) colPusat = idx;
            } else if (norm.includes('sempu') || norm.includes('toko1') || norm.includes('cabang1') || norm.includes('outlet1') || norm === 'stok1') {
              if (colToko1 === -1) colToko1 = idx;
            } else if (norm.includes('pilar') || norm.includes('toko2') || norm.includes('cabang2') || norm.includes('outlet2') || norm === 'stok2') {
              if (colToko2 === -1) colToko2 = idx;
            } else if (norm.includes('serang') || norm.includes('toko3') || norm.includes('cabang3') || norm.includes('outlet3') || norm === 'stok3') {
              if (colToko3 === -1) colToko3 = idx;
            }
          });
        }

        // Fallback to strict standard column indexing:
        // Col 0: Kode Item, Col 1: Nama Item, Col 2: Pusat, Col 3: Sempu, Col 4: Pilar, Col 5: Serang
        if (colKode === -1) colKode = 0;
        if (colNama === -1) colNama = 1;
        if (colPusat === -1) colPusat = 2;
        if (colToko1 === -1) colToko1 = 3;
        if (colToko2 === -1) colToko2 = 4;
        if (colToko3 === -1) colToko3 = 5;

        const dataStartIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 1;
        const parsedItems: StockItem[] = [];
        const warnings: string[] = [];

        for (let i = dataStartIndex; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const rawKode = String(row[colKode] ?? '').trim();
          const rawNama = String(row[colNama] ?? '').trim();

          // Skip completely empty row
          if (!rawKode && !rawNama) continue;

          const safeKode = rawKode || `BRG-${String(i).padStart(3, '0')}`;
          const safeNama = rawNama || `Item Tanpa Nama (${safeKode})`;

          const parseStock = (val: any): number => {
            if (val === undefined || val === null || val === '') return 0;
            const cleanStr = String(val).replace(/[^0-9.-]/g, '');
            const num = parseFloat(cleanStr);
            return isNaN(num) ? 0 : Math.max(0, Math.round(num));
          };

          const stokPusat = parseStock(row[colPusat]);
          const stokToko1 = parseStock(row[colToko1]);
          const stokToko2 = parseStock(row[colToko2]);
          const stokToko3 = parseStock(row[colToko3]);

          parsedItems.push({
            id: `item-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            kodeItem: safeKode,
            namaItem: safeNama,
            stokPusat,
            stokToko1,
            stokToko2,
            stokToko3,
            isChecked: false,
            adminFlagged: false,
          });
        }

        if (parsedItems.length === 0) {
          throw new Error('Tidak ditemukan data baris barang yang valid dalam file Excel.');
        }

        // Requirement 2: SISTEM MERAPIHKAN DATA DENGAN SORT A-Z PADA BAGIAN NAMA ITEM DAN LAINNYA MENGIKUTI
        const cleanedAndSorted = cleanAndSortItemsAZ(parsedItems);

        resolve({
          items: cleanedAndSorted,
          rowCount: cleanedAndSorted.length,
          warnings,
        });
      } catch (err: any) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file. Pastikan file tidak terkunci atau rusak.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates and downloads a standardized .xlsx template with 6 columns:
 * Kode Item, Nama Item, Pusat, Sempu, Pilar, Serang
 */
export function downloadExcelTemplate(thresholdN: number = 36) {
  const headers = [
    ['TEMPLATE PENGECEKAN STOK BARANG (STOCK OPNAME)'],
    [`Petunjuk: Isi 6 kolom data barang (Kode Item, Nama Item, Pusat, Sempu, Pilar, Serang). Kolom Sempu, Pilar, Serang yang <= ${thresholdN} akan otomatis ditandai kritis oleh sistem.`],
    [''],
    ['KODE ITEM', 'NAMA ITEM', 'PUSAT', 'SEMPU', 'PILAR', 'SERANG']
  ];

  const sampleRows = [
    ['BRG-001', 'Beras Ramos Super 5kg', 300, 55, 30, 48],
    ['BRG-002', 'Deterjen Konsentrat 800g', 210, 48, 52, 40],
    ['BRG-003', 'Gula Kristal Putih 1kg', 200, 60, 50, 35],
    ['BRG-004', 'Kecap Manis Refill 550ml', 190, 70, 65, 36],
    ['BRG-005', 'Kopi Robusta Lampung 250g', 150, 40, 25, 36],
    ['BRG-006', 'Minyak Goreng Sawit 2L', 240, 32, 45, 18],
    ['BRG-007', 'Sabun Mandi Cair 450ml', 160, 12, 34, 29],
    ['BRG-008', 'Teh Celup Melati 25s', 180, 20, 15, 22],
  ];

  const fullData = [...headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Kode Item
    { wch: 35 }, // Nama Item
    { wch: 14 }, // Pusat
    { wch: 14 }, // Sempu
    { wch: 14 }, // Pilar
    { wch: 14 }, // Serang
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Stok');

  XLSX.writeFile(workbook, `Template_Stok_Barang_6_Kolom.xlsx`);
}

/**
 * Exports an audit report to Excel (.xlsx) with detailed tabs and summary
 */
export function exportReportToExcel(report: AuditReportSummary) {
  const workbook = XLSX.utils.book_new();

  // 1. Data Sheet
  const headerInfo = [
    ['LAPORAN HASIL PENGECEKAN STOK BARANG (STOCK OPNAME)'],
    ['Judul Pengecekan:', report.judul],
    ['Tanggal Selesai:', new Date(report.tanggalSelesai).toLocaleString('id-ID')],
    ['Admin Validator:', report.namaAdmin],
    ['Petugas Cek:', report.namaChecker],
    ['Batas Stok Kritis (N):', `<= ${report.thresholdN} unit`],
    ['Status Validasi:', 'TERVALIDASI (LENGKAP)'],
    [''],
    [
      'NO',
      'KODE ITEM',
      'NAMA ITEM (A-Z)',
      'PUSAT',
      'SEMPU',
      'STATUS SEMPU',
      'PILAR',
      'STATUS PILAR',
      'SERANG',
      'STATUS SERANG',
      'TOTAL STOK',
      'STATUS CEK',
      'WAKTU CEK',
      'CATATAN'
    ]
  ];

  const rows = report.items.map((item, idx) => {
    const isSempuCrit = item.stokToko1 <= report.thresholdN ? `KRITIS (<= ${report.thresholdN})` : 'AMAN';
    const isPilarCrit = item.stokToko2 <= report.thresholdN ? `KRITIS (<= ${report.thresholdN})` : 'AMAN';
    const isSerangCrit = item.stokToko3 <= report.thresholdN ? `KRITIS (<= ${report.thresholdN})` : 'AMAN';
    const total = item.stokPusat + item.stokToko1 + item.stokToko2 + item.stokToko3;

    return [
      idx + 1,
      item.kodeItem,
      item.namaItem,
      item.stokPusat,
      item.stokToko1,
      isSempuCrit,
      item.stokToko2,
      isPilarCrit,
      item.stokToko3,
      isSerangCrit,
      total,
      item.isChecked ? 'SUDAH DICEK' : 'BELUM DICEK',
      item.checkedAt ? new Date(item.checkedAt).toLocaleTimeString('id-ID') : '-',
      item.adminNote || item.userNote || '-'
    ];
  });

  const fullSheetData = [...headerInfo, ...rows];
  const wsItems = XLSX.utils.aoa_to_sheet(fullSheetData);

  wsItems['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // Kode Item
    { wch: 38 }, // Nama Item
    { wch: 13 }, // Pusat
    { wch: 13 }, // Sempu
    { wch: 18 }, // Status Sempu
    { wch: 13 }, // Pilar
    { wch: 18 }, // Status Pilar
    { wch: 13 }, // Serang
    { wch: 18 }, // Status Serang
    { wch: 14 }, // Total Stok
    { wch: 15 }, // Status Cek
    { wch: 14 }, // Waktu
    { wch: 25 }, // Catatan
  ];

  XLSX.utils.book_append_sheet(workbook, wsItems, 'Data Pengecekan');

  // 2. Summary Sheet
  const summaryData = [
    ['RINGKASAN AUDIT STOK BARANG'],
    [''],
    ['Parameter', 'Nilai'],
    ['Judul Sesi', report.judul],
    ['Batas Kritis N', `<= ${report.thresholdN} unit`],
    ['Total Jenis Barang', report.totalItem],
    ['Total Barang Sudah Dicek', `${report.totalDicek} (${Math.round((report.totalDicek / report.totalItem) * 100)}%)`],
    ['Akumulasi Stok Pusat', report.totalPusat],
    ['Akumulasi Stok Sempu', report.totalToko1],
    ['Akumulasi Stok Pilar', report.totalToko2],
    ['Akumulasi Stok Serang', report.totalToko3],
    ['Total Keseluruhan Unit Stok', report.totalPusat + report.totalToko1 + report.totalToko2 + report.totalToko3],
    ['Jumlah Item Stok Kritis Sempu', report.kritisToko1],
    ['Jumlah Item Stok Kritis Pilar', report.kritisToko2],
    ['Jumlah Item Stok Kritis Serang', report.kritisToko3],
    ['Status Akhir', 'Divalidasi Penuh Oleh Admin'],
    ['Catatan Admin', report.catatanAdmin || '-']
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan & Statistik');

  const filenameSafe = report.judul.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  XLSX.writeFile(workbook, `Laporan_Pengecekan_${filenameSafe}_${Date.now()}.xlsx`);
}
