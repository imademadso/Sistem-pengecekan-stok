import { AuditSession, AuditReportSummary, StockItem, AuthUser, UserRole } from '../types/stock';
import { RAW_SAMPLE_ITEMS, cleanAndSortItemsAZ } from './sampleData';

const STORAGE_ACTIVE_SESSION_KEY = 'stok_opname_active_session_v1';
const STORAGE_REPORTS_KEY = 'stok_opname_reports_v1';
const STORAGE_AUTH_USER_KEY = 'stok_opname_auth_user_v1';
const STORAGE_USERS_KEY = 'stok_opname_users_v1';

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

export function getStoredUsers(): typeof PREDEFINED_ACCOUNTS {
  try {
    const val = localStorage.getItem(STORAGE_USERS_KEY);
    if (val) {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return PREDEFINED_ACCOUNTS;
}

export function saveStoredUsers(users: any[]) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users locally', e);
  }
}

export function updateStoredUser(updatedUser: { username: string; [key: string]: any }) {
  try {
    const current = getStoredUsers();
    const index = current.findIndex(
      (u) => u.username.toLowerCase() === updatedUser.username.toLowerCase()
    );
    let nextList;
    if (index >= 0) {
      nextList = current.map((u, i) => (i === index ? { ...u, ...updatedUser } : u));
    } else {
      nextList = [...current, updatedUser];
    }
    saveStoredUsers(nextList);
    return nextList;
  } catch (e) {
    console.error('Failed to update user locally', e);
    return getStoredUsers();
  }
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    const val = localStorage.getItem(STORAGE_AUTH_USER_KEY);
    if (val) {
      const parsed: AuthUser = JSON.parse(val);
      // Auto sync with latest name from stored users
      const storedUsers = getStoredUsers();
      const matched = storedUsers.find(
        (u) => u.username.toLowerCase() === parsed.username.toLowerCase()
      );
      if (matched && matched.name) {
        parsed.name = matched.name;
        parsed.role = matched.role as UserRole;
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
  // Production ready: Items start unchecked for clean real audit
  const initialStockItems: StockItem[] = RAW_SAMPLE_ITEMS.map((item) => ({
    ...item,
    isChecked: false,
    checkedAt: null,
    checkedBy: null,
    adminFlagged: false,
    adminNote: '',
    userNote: '',
  }));

  const sortedItems = cleanAndSortItemsAZ(initialStockItems);
  const storedUsers = getStoredUsers();
  const adminAcc = storedUsers.find((u) => u.username === 'admin') || PREDEFINED_ACCOUNTS[0];
  const checkerAcc = storedUsers.find((u) => u.username === 'petugas') || PREDEFINED_ACCOUNTS[1];

  return {
    id: `session-${Date.now()}`,
    judul: 'Stock Opname Periode Berjalan',
    tanggalDibuat: new Date().toISOString(),
    thresholdN: 36, // Ambang batas N yang diminta user
    items: sortedItems,
    status: 'SEDANG_DICEK',
    namaAdmin: `${adminAcc.name} (Admin Gudang)`,
    namaChecker: `${checkerAcc.name} (Petugas Cek)`,
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
