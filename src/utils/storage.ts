import { AuditSession, AuditReportSummary, StockItem, AuthUser, UserRole } from '../types/stock';
import { RAW_SAMPLE_ITEMS, cleanAndSortItemsAZ } from './sampleData';

const STORAGE_ACTIVE_SESSION_KEY = 'stok_opname_active_session_v1';
const STORAGE_REPORTS_KEY = 'stok_opname_reports_v1';
const STORAGE_AUTH_USER_KEY = 'stok_opname_auth_user_v1';

// Predefined accounts
export const PREDEFINED_ACCOUNTS = [
  {
    username: 'admin',
    password: '123',
    name: 'Abdus Shomad',
    role: 'ADMIN' as UserRole,
    title: 'Admin Gudang & Stok',
  },
  {
    username: 'petugas',
    password: '123',
    name: 'Saiful Anwar',
    role: 'USER_CHECKER' as UserRole,
    title: 'Petugas Cek / Checker Lapangan',
  },
];

export function getStoredAuthUser(): AuthUser | null {
  try {
    const val = localStorage.getItem(STORAGE_AUTH_USER_KEY);
    if (val) {
      const parsed: AuthUser = JSON.parse(val);
      // Auto-migrate old names if present in localStorage
      if (parsed.username === 'admin' && (parsed.name === 'Budi Santoso' || !parsed.name)) {
        parsed.name = 'Abdus Shomad';
        saveStoredAuthUser(parsed);
      } else if (parsed.username === 'petugas' && (parsed.name === 'Ahmad Fauzi' || !parsed.name)) {
        parsed.name = 'Saiful Anwar';
        saveStoredAuthUser(parsed);
      }
      return parsed;
    }
  } catch {
    return null;
  }
  // Default to null so landing page with login form is shown first
  return null;
}

export function saveStoredAuthUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_AUTH_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save auth user', e);
  }
}

export function createDefaultSession(): AuditSession {
  const initialStockItems: StockItem[] = RAW_SAMPLE_ITEMS.map((item, idx) => ({
    ...item,
    isChecked: idx < 6, // simulate some checked items for immediate visual fidelity
    checkedAt: idx < 6 ? new Date(Date.now() - (idx + 1) * 300000).toISOString() : null,
    checkedBy: idx < 6 ? 'Saiful Anwar (Petugas Cek)' : null,
    adminFlagged: false,
    adminNote: '',
    userNote: '',
  }));

  const sortedItems = cleanAndSortItemsAZ(initialStockItems);

  return {
    id: `session-${Date.now()}`,
    judul: 'Stock Opname Periode Berjalan',
    tanggalDibuat: new Date().toISOString(),
    thresholdN: 36, // Ambang batas N yang diminta user (contoh N=36)
    items: sortedItems,
    status: 'SEDANG_DICEK',
    namaAdmin: 'Abdus Shomad (Admin Gudang)',
    namaChecker: 'Saiful Anwar (Petugas Cek)',
    catatanValidasi: '',
  };
}

export function getActiveSession(): AuditSession {
  try {
    const stored = localStorage.getItem(STORAGE_ACTIVE_SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load active session from localStorage', e);
  }

  const defaultSession = createDefaultSession();
  saveActiveSession(defaultSession);
  return defaultSession;
}

export function saveActiveSession(session: AuditSession) {
  try {
    localStorage.setItem(STORAGE_ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save active session', e);
  }
}

export function getReportsHistory(): AuditReportSummary[] {
  try {
    const stored = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load reports history', e);
  }
  return [];
}

export function saveReportToHistory(report: AuditReportSummary) {
  try {
    const existing = getReportsHistory();
    const updated = [report, ...existing.filter((r) => r.id !== report.id)];
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save report to history', e);
  }
}

export function deleteReportFromHistory(reportId: string): AuditReportSummary[] {
  try {
    const existing = getReportsHistory();
    const filtered = existing.filter((r) => r.id !== reportId);
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Failed to delete report', e);
    return [];
  }
}
