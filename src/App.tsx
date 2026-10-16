import { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  WorkflowStepsBar 
} from './components/WorkflowStepsBar';
import { 
  StockTable 
} from './components/StockTable';
import { 
  AuditStatusBar 
} from './components/AuditStatusBar';
import { 
  AdminInputModal 
} from './components/AdminInputModal';
import { 
  AdminFlagModal 
} from './components/AdminFlagModal';
import { 
  ReportViewModal 
} from './components/ReportViewModal';
import { 
  ReportHistory 
} from './components/ReportHistory';
import { 
  LoginModal 
} from './components/LoginModal';
import { 
  UserManagementModal 
} from './components/UserManagementModal';
import { 
  LandingPage 
} from './components/LandingPage';

import { 
  StockItem, 
  AuditSession, 
  AuditReportSummary, 
  UserRole,
  AuthUser
} from './types/stock';
import { 
  getActiveSession, 
  saveActiveSession, 
  getReportsHistory, 
  saveReportToHistory, 
  deleteReportFromHistory, 
  getStoredAuthUser,
  saveStoredAuthUser,
  createDefaultSession,
  PREDEFINED_ACCOUNTS
} from './utils/storage';
import { 
  subscribeToActiveSession, 
  syncSessionToFirestore, 
  subscribeToReports, 
  saveReportToFirestore, 
  deleteReportFromFirestore,
  seedInitialUsers,
  seedDefaultSessionIfEmpty,
  subscribeToUsers,
  UserAccountDoc
} from './services/stockSyncService';
import { testFirestoreConnection } from './lib/firebase';
import { downloadExcelTemplate } from './utils/excelHelper';
import { cleanAndSortItemsAZ } from './utils/sampleData';
import { 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Bell, 
  FileCheck,
  ShieldCheck,
  UserCheck,
  LogOut,
  Lock,
  Cloud,
  RefreshCw,
  Users,
  UserCog,
  User
} from 'lucide-react';

export default function App() {
  // Authentication & Role State
  const [authUser, setAuthUser] = useState<AuthUser | null>(getStoredAuthUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Active Role derived strictly from authenticated user
  const role: UserRole = authUser?.role ?? 'USER_CHECKER';

  // Application State with Real-time Sync
  const [session, setSession] = useState<AuditSession>(getActiveSession);
  const [reports, setReports] = useState<AuditReportSummary[]>(getReportsHistory);
  const [activeTab, setActiveTab] = useState<'audit' | 'reports'>('audit');
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');

  // Modals & Popups
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [usersList, setUsersList] = useState<UserAccountDoc[]>(PREDEFINED_ACCOUNTS);
  const [flaggingItem, setFlaggingItem] = useState<StockItem | null>(null);
  const [viewingReport, setViewingReport] = useState<AuditReportSummary | null>(null);

  // Toast / System Notification
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Bootstrap initial Firestore collections & 2-Way Realtime Subscriptions
  useEffect(() => {
    // 1. Test connection & seed initial data if empty
    testFirestoreConnection().then((connected) => {
      setIsDbConnected(connected);
      if (connected) {
        seedInitialUsers();
        seedDefaultSessionIfEmpty();
      }
    });

    // 2. Real-time 2-way listener for users (Admin name updates propagate instantly)
    const unsubscribeUsers = subscribeToUsers(
      (remoteUsers) => {
        if (remoteUsers && remoteUsers.length > 0) {
          setUsersList(remoteUsers);
          // If authUser is logged in, ensure their displayed name stays in sync
          setAuthUser((prev) => {
            if (!prev) return prev;
            const match = remoteUsers.find((u) => u.username === prev.username);
            if (match && match.name !== prev.name) {
              const updatedAuth: AuthUser = { ...prev, name: match.name, role: match.role };
              saveStoredAuthUser(updatedAuth);
              return updatedAuth;
            }
            return prev;
          });
        }
      },
      (error) => {
        console.warn('Realtime users subscription error:', error);
      }
    );

    // 3. Real-time 2-way listener for active session (Admin <-> Petugas Cek)
    const unsubscribeSession = subscribeToActiveSession(
      (remoteSession) => {
        setSession(remoteSession);
        saveActiveSession(remoteSession);
        setIsDbConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      },
      (error) => {
        console.warn('Realtime session subscription error:', error);
      }
    );

    // 4. Real-time 2-way listener for audit reports
    const unsubscribeReports = subscribeToReports(
      (remoteReports) => {
        setReports(remoteReports);
        localStorage.setItem('stok_opname_reports_v1', JSON.stringify(remoteReports));
      },
      (error) => {
        console.warn('Realtime reports subscription error:', error);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeSession();
      unsubscribeReports();
    };
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    saveStoredAuthUser(user);
    setIsLoginModalOpen(false);
    showToast(`Berhasil login sebagai ${user.name} (${user.role === 'ADMIN' ? 'Admin' : 'Petugas Cek'})`, 'success');
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    setAuthUser(null);
    saveStoredAuthUser(null);
    showToast('Berhasil keluar dari sistem.', 'info');
  };

  // Handle user updated from UserManagementModal
  const handleUserUpdated = (updatedUser: UserAccountDoc) => {
    setUsersList((prev) =>
      prev.map((u) => (u.username === updatedUser.username ? { ...u, ...updatedUser } : u))
    );

    // If current logged-in user was updated (e.g. Budi Santoso renamed to new name)
    if (authUser?.username === updatedUser.username || (updatedUser.role === 'ADMIN' && authUser?.role === 'ADMIN')) {
      const updatedAuth: AuthUser = {
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
      };
      setAuthUser(updatedAuth);
      saveStoredAuthUser(updatedAuth);
    }

    // If admin name changed, update the active session's namaAdmin
    if (updatedUser.role === 'ADMIN') {
      const updatedSession: AuditSession = {
        ...session,
        namaAdmin: `${updatedUser.name} (Admin Gudang)`,
      };
      updateSession(updatedSession);
    }

    showToast(`Nama pengguna berhasil diperbarui menjadi "${updatedUser.name}". Tersimpan di database cloud!`, 'success');
  };

  // Sync session changes to both local state and Firestore (propagates instantly to 2nd user)
  const updateSession = async (updated: AuditSession) => {
    // Optimistic local update
    setSession(updated);
    saveActiveSession(updated);

    // Remote Firestore write for 2-way synchronization
    try {
      await syncSessionToFirestore(updated);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Failed to sync to Firestore, saved locally', e);
    }
  };

  // 1. Toggle Checkbox on Item (Tahap 3 & 4)
  const handleToggleCheck = (itemId: string) => {
    const updatedItems = session.items.map((item) => {
      if (item.id === itemId) {
        const nextChecked = !item.isChecked;
        return {
          ...item,
          isChecked: nextChecked,
          checkedAt: nextChecked ? new Date().toISOString() : null,
          checkedBy: nextChecked ? (authUser?.name || (role === 'ADMIN' ? session.namaAdmin : session.namaChecker)) : null,
          // If item was previously flagged by admin and user checks it now, mark the flag resolved
          adminFlagged: nextChecked ? false : item.adminFlagged,
        };
      }
      return item;
    });

    const anyStillFlagged = updatedItems.some((i) => i.adminFlagged);
    const newStatus = anyStillFlagged 
      ? 'PERLU_REVISI' 
      : session.status === 'TERVALIDASI' 
      ? 'TERVALIDASI' 
      : 'SEDANG_DICEK';

    updateSession({
      ...session,
      items: updatedItems,
      status: newStatus,
    });
  };

  // Bulk Check
  const handleBulkCheck = (ids: string[], checked: boolean) => {
    const idSet = new Set(ids);
    const updatedItems = session.items.map((item) => {
      if (idSet.has(item.id)) {
        return {
          ...item,
          isChecked: checked,
          checkedAt: checked ? new Date().toISOString() : null,
          checkedBy: checked ? (authUser?.name || (role === 'ADMIN' ? session.namaAdmin : session.namaChecker)) : null,
          adminFlagged: checked ? false : item.adminFlagged,
        };
      }
      return item;
    });

    const anyStillFlagged = updatedItems.some((i) => i.adminFlagged);
    updateSession({
      ...session,
      items: updatedItems,
      status: anyStillFlagged ? 'PERLU_REVISI' : 'SEDANG_DICEK',
    });

    showToast(
      checked ? `${ids.length} barang ditandai sudah dicek (Tersinkronisasi)` : 'Centang berhasil di-reset',
      'info'
    );
  };

  // 2. Admin Flags an Item as Missed / Needs Revision (Tahap 4)
  const handleSaveAdminFlag = (itemId: string, note: string) => {
    const updatedItems = session.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          adminFlagged: true,
          adminNote: note,
          isChecked: false, // Reset checklist because it's flagged as missed!
        };
      }
      return item;
    });

    updateSession({
      ...session,
      items: updatedItems,
      status: 'PERLU_REVISI',
    });

    showToast('Barang ditandai terlewat! Validasi ditangguhkan hingga user selesai memeriksa.', 'warning');
  };

  // Remove Admin Flag
  const handleRemoveAdminFlag = (itemId: string) => {
    const updatedItems = session.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          adminFlagged: false,
          adminNote: '',
        };
      }
      return item;
    });

    const anyStillFlagged = updatedItems.some((i) => i.adminFlagged);
    updateSession({
      ...session,
      items: updatedItems,
      status: anyStillFlagged ? 'PERLU_REVISI' : 'SEDANG_DICEK',
    });

    showToast('Tanda terlewat telah dihapus.', 'info');
  };

  // 3. Admin Validates & Saves Report (Tahap 4 & 5)
  const handleValidateAndSaveReport = (adminNotes: string) => {
    const total = session.items.length;
    const checkedCount = session.items.filter((i) => i.isChecked).length;
    const flaggedCount = session.items.filter((i) => i.adminFlagged).length;

    // Strict validation requirement check
    if (checkedCount < total) {
      showToast('Pengecekan belum tuntas! Seluruh barang harus dicek terlebih dahulu.', 'warning');
      return;
    }

    if (flaggedCount > 0) {
      showToast(`Pengecekan belum dapat divalidasi karena ada ${flaggedCount} barang yang terlewat!`, 'warning');
      return;
    }

    // Calculate aggregated statistics
    let totalPusat = 0;
    let totalToko1 = 0;
    let totalToko2 = 0;
    let totalToko3 = 0;
    let kritisToko1 = 0;
    let kritisToko2 = 0;
    let kritisToko3 = 0;

    session.items.forEach((it) => {
      totalPusat += it.stokPusat;
      totalToko1 += it.stokToko1;
      totalToko2 += it.stokToko2;
      totalToko3 += it.stokToko3;

      if (it.stokToko1 <= session.thresholdN) kritisToko1++;
      if (it.stokToko2 <= session.thresholdN) kritisToko2++;
      if (it.stokToko3 <= session.thresholdN) kritisToko3++;
    });

    const reportSummary: AuditReportSummary = {
      id: `report-${Date.now()}`,
      sessionId: session.id,
      judul: session.judul,
      tanggalSelesai: new Date().toISOString(),
      namaAdmin: session.namaAdmin,
      namaChecker: session.namaChecker,
      thresholdN: session.thresholdN,
      totalItem: total,
      totalDicek: checkedCount,
      totalPusat,
      totalToko1,
      totalToko2,
      totalToko3,
      kritisToko1,
      kritisToko2,
      kritisToko3,
      items: [...session.items],
      catatanAdmin: adminNotes,
    };

    // Save to history & Firestore
    saveReportToHistory(reportSummary);
    setReports(getReportsHistory());
    saveReportToFirestore(reportSummary).catch((e) => console.error('Failed to save report to Firestore', e));

    // Update active session
    const validatedSession: AuditSession = {
      ...session,
      status: 'TERVALIDASI',
      tanggalValidasi: new Date().toISOString(),
      catatanValidasi: adminNotes,
    };
    updateSession(validatedSession);

    // Prompt viewing report
    setViewingReport(reportSummary);
    showToast('Pengecekan berhasil divalidasi dan tersimpan di database cloud!', 'success');
  };

  // 4. Save New Data from Admin Modal (Tahap 1 & 2)
  const handleSaveNewData = (items: StockItem[], newThresholdN: number, sessionTitle: string) => {
    // Sesuai Tahap 2: Sistem merapihkan data dengan sort A-Z pada Nama Item
    const cleanedAndSorted = cleanAndSortItemsAZ(items);

    const newSession: AuditSession = {
      id: `session-${Date.now()}`,
      judul: sessionTitle,
      tanggalDibuat: new Date().toISOString(),
      thresholdN: newThresholdN,
      items: cleanedAndSorted,
      status: 'SEDANG_DICEK',
      namaAdmin: authUser?.name || session.namaAdmin,
      namaChecker: session.namaChecker,
    };

    updateSession(newSession);
    setActiveTab('audit');
    showToast(
      `Berhasil mengimpor ${cleanedAndSorted.length} barang ke database cloud. Data telah dirapikan & diurutkan A-Z. Batas N = ${newThresholdN}.`,
      'success'
    );
  };

  // Change Critical Threshold N dynamically
  const handleChangeThresholdN = (newThresholdN: number) => {
    updateSession({
      ...session,
      thresholdN: newThresholdN,
    });
    showToast(
      `Ambang batas kritis berhasil diubah menjadi N = ${newThresholdN}. Penandaan stok Sempu, Pilar, Serang telah diperbarui di database cloud.`,
      'success'
    );
  };

  // Reset to default sample
  const handleResetSession = () => {
    if (confirm('Reset sesi pengecekan ke data contoh awal di database?')) {
      const def = createDefaultSession();
      updateSession(def);
      showToast('Sesi pengecekan di-reset ke data sampel standar.', 'info');
    }
  };

  const handleDeleteReport = (reportId: string) => {
    const updated = deleteReportFromHistory(reportId);
    setReports(updated);
    deleteReportFromFirestore(reportId).catch((e) => console.error('Failed to delete report from Firestore', e));
    showToast('Laporan berhasil dihapus dari arsip.', 'info');
  };

  const handleUserSubmitToCheck = () => {
    showToast('Hasil pengecekan telah diajukan ke Admin secara real-time!', 'info');
  };

  const flaggedCount = session.items.filter((i) => i.adminFlagged).length;
  const checkedCount = session.items.filter((i) => i.isChecked).length;

  // DIRECT LANDING PAGE GATEWAY: If not logged in, show Landing Page with Login first!
  if (!authUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-5 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-200">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                  : toastMessage.type === 'warning'
                  ? 'bg-amber-900 text-amber-100 border-amber-700'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              {toastMessage.type === 'info' && <Bell className="w-4 h-4 text-indigo-400 shrink-0" />}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}
        <LandingPage
          onLoginSuccess={handleLoginSuccess}
          isDbConnected={isDbConnected}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toastMessage.type === 'warning'
                ? 'bg-amber-900 text-amber-100 border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toastMessage.type === 'info' && <Bell className="w-4 h-4 text-indigo-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Cloud 2-Way Sync Status Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">Database Cloud 2-Arah Terhubung:</span>
            <span>Perubahan oleh Admin & Petugas Cek tersinkronisasi otomatis secara real-time antar perangkat.</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Cloud className="w-3 h-3 text-indigo-400" />
            <span>Sinkron terakhir: {lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* App Header */}
      <Header
        currentRole={role}
        onRoleChange={handleOpenLoginModal}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenInputModal={() => setIsInputModalOpen(true)}
        onDownloadTemplate={() => downloadExcelTemplate(session.thresholdN)}
        onResetSession={handleResetSession}
        reportCount={reports.length}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        userName={authUser?.name}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        
        {/* Role Banner / Helper Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white border border-white/10">
              {role === 'ADMIN' ? <ShieldCheck className="w-5 h-5 text-indigo-300" /> : <UserCheck className="w-5 h-5 text-blue-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Akun Aktif:
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white/20 text-white">
                  {role === 'ADMIN' ? 'ADMIN GUDANG (AKSES PENUH)' : 'PETUGAS CEK (TERKUNCI)'}
                </span>
                {authUser && (
                  <span className="text-xs font-medium text-slate-300 hidden sm:inline">
                    &bull; {authUser.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {role === 'ADMIN'
                  ? 'Admin Abdus Shomad berhak mengubah ambang batas kritis (N), menginput data stok (.xlsx), meninjau kelengkapan, menandai barang terlewat, dan memvalidasi laporan akhir.'
                  : 'Petugas Cek Saiful Anwar bertugas memeriksa fisik barang dan mencentang checkbox hingga tuntas. Mode admin dikunci untuk mencegah manipulasi data.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {role === 'ADMIN' && (
              <button
                onClick={() => setIsUserManagementOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 shadow-xs transition-colors"
                title="Buka pengaturan user untuk mengubah nama Abdus Shomad atau akun lainnya"
              >
                <UserCog className="w-3.5 h-3.5 text-indigo-200" />
                <span>Pengaturan User</span>
              </button>
            )}

            {role === 'USER_CHECKER' ? (
              <button
                onClick={handleOpenLoginModal}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                title="Petugas Cek tidak dapat langsung beralih ke Admin. Anda harus login ulang dengan kredensial Admin."
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Ganti Akun / Login Admin</span>
              </button>
            ) : (
              <button
                onClick={handleOpenLoginModal}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span>Ganti Akun</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 transition-colors"
              title="Keluar ke Halaman Utama (Landing Page)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Pengecekan Aktif (The 5-Step Process) */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            
            {/* Visual Workflow Steps (Tahap 1 - 5) */}
            <WorkflowStepsBar
              currentStatus={session.status}
              totalItems={session.items.length}
              checkedCount={checkedCount}
              flaggedCount={flaggedCount}
              thresholdN={session.thresholdN}
            />

            {/* Audit Status Bar with Strict Validation Rules */}
            <AuditStatusBar
              session={session}
              currentRole={role}
              onValidateAndSaveReport={handleValidateAndSaveReport}
              onUserSubmitToCheck={handleUserSubmitToCheck}
              onViewReport={() => {
                const latestReport = reports[0];
                if (latestReport) {
                  setViewingReport(latestReport);
                } else {
                  handleValidateAndSaveReport('');
                }
              }}
            />

            {/* Core 6-Column Stock Table: Kode Item, Nama Item, Pusat, Sempu, Pilar, Serang */}
            <StockTable
              items={session.items}
              thresholdN={session.thresholdN}
              currentRole={role}
              isAuditFinalized={session.status === 'TERVALIDASI'}
              onToggleCheck={handleToggleCheck}
              onOpenFlagModal={(item) => setFlaggingItem(item)}
              onBulkCheck={handleBulkCheck}
              onChangeThresholdN={handleChangeThresholdN}
            />

          </div>
        )}

        {/* Tab 2: Arsip Laporan (Tahap 5) */}
        {activeTab === 'reports' && (
          <ReportHistory
            reports={reports}
            onViewReport={(rep) => setViewingReport(rep)}
            onDeleteReport={handleDeleteReport}
            onBackToAudit={() => setActiveTab('audit')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>Sistem Pengecekan Stok Barang &bull; Format 6 Kolom: Kode Item, Nama Item, Pusat, Sempu, Pilar, Serang &bull; Sortir Otomatis A-Z &bull; Penandaan Stok Kritis &le; N</p>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        currentUser={authUser}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminInputModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        thresholdN={session.thresholdN}
        onSaveNewData={handleSaveNewData}
      />

      <AdminFlagModal
        isOpen={!!flaggingItem}
        item={flaggingItem}
        onClose={() => setFlaggingItem(null)}
        onSaveFlag={handleSaveAdminFlag}
        onRemoveFlag={handleRemoveAdminFlag}
      />

      <ReportViewModal
        isOpen={!!viewingReport}
        report={viewingReport}
        onClose={() => setViewingReport(null)}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUser={authUser}
        usersList={usersList}
        onUserUpdated={handleUserUpdated}
      />

    </div>
  );
}
