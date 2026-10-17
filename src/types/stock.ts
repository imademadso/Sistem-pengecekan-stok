export interface StockItem {
  id: string;
  kodeItem: string;
  namaItem: string;
  stokPusat: number;
  stokToko1: number;
  stokToko2: number;
  stokToko3: number;
  // Audit properties
  isChecked: boolean;
  checkedAt?: string | null;
  checkedBy?: string | null;
  adminFlagged?: boolean; // Tanda dari admin jika terlewat/perlu cek ulang
  adminNote?: string;
  userNote?: string;
  // Penanda Ketidaksesuaian Stok Pusat (Physical Discrepancy)
  isDiscrepancy?: boolean;
  stokPusatAktual?: number | null; // Stok fisik sebenarnya yang diinput petugas
  discrepancyNote?: string;
  discrepancyMarkedBy?: string;
  discrepancyMarkedAt?: string;
}

export type AuditStatus = 'DRAFT' | 'SEDANG_DICEK' | 'PERLU_REVISI' | 'TERVALIDASI';

export interface AuditSession {
  id: string;
  judul: string;
  tanggalDibuat: string;
  thresholdN: number; // Nilai N batas stok kritis
  items: StockItem[];
  status: AuditStatus;
  namaAdmin: string;
  namaChecker: string;
  tanggalValidasi?: string | null;
  catatanValidasi?: string;
}

export interface AuditReportSummary {
  id: string;
  sessionId: string;
  judul: string;
  tanggalSelesai: string;
  namaAdmin: string;
  namaChecker: string;
  thresholdN: number;
  totalItem: number;
  totalDicek: number;
  totalPusat: number;
  totalToko1: number;
  totalToko2: number;
  totalToko3: number;
  kritisToko1: number;
  kritisToko2: number;
  kritisToko3: number;
  totalDiscrepancy?: number;
  items: StockItem[];
  catatanAdmin?: string;
}

export type UserRole = 'ADMIN' | 'USER_CHECKER';

export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
}
