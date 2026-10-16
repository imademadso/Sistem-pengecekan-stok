import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AuditSession, AuditReportSummary, AuthUser, StockItem, UserRole } from '../types/stock';
import { PREDEFINED_ACCOUNTS, createDefaultSession } from '../utils/storage';

const ACTIVE_SESSION_DOC = 'active_session';

export interface UserAccountDoc {
  username: string;
  name: string;
  role: UserRole;
  password?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Seeds initial user accounts into Firestore if empty
 */
export async function seedInitialUsers(): Promise<void> {
  try {
    for (const acc of PREDEFINED_ACCOUNTS) {
      const userRef = doc(db, 'users', acc.username);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          username: acc.username,
          name: acc.name,
          role: acc.role,
          password: acc.password,
          title: acc.title,
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
}

/**
 * 2-Way Realtime Listener for Users in Firestore
 */
export function subscribeToUsers(
  onUpdate: (users: UserAccountDoc[]) => void,
  onError?: (err: any) => void
): () => void {
  const usersCol = collection(db, 'users');

  return onSnapshot(
    usersCol,
    (snapshot) => {
      const users: UserAccountDoc[] = [];
      snapshot.forEach((docSnap) => {
        users.push(docSnap.data() as UserAccountDoc);
      });
      // Sort: Admin first, then alphabetical
      users.sort((a, b) => {
        if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
        if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
        return a.name.localeCompare(b.name);
      });
      onUpdate(users);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
      if (onError) onError(error);
    }
  );
}

/**
 * Update user details (e.g. rename 'Budi Santoso' to any name) in Firestore
 */
export async function updateUserInFirestore(
  username: string,
  updates: Partial<UserAccountDoc>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', username.toLowerCase().trim());
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await setDoc(userRef, {
        ...snap.data(),
        ...updates,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      // If document didn't exist yet, create it with updates
      await setDoc(userRef, {
        username: username.toLowerCase().trim(),
        name: updates.name || username,
        role: updates.role || 'ADMIN',
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${username}`);
    throw error;
  }
}

/**
 * Create a new user in Firestore
 */
export async function createUserInFirestore(userData: UserAccountDoc): Promise<void> {
  try {
    const userRef = doc(db, 'users', userData.username.toLowerCase().trim());
    await setDoc(userRef, {
      ...userData,
      username: userData.username.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userData.username}`);
    throw error;
  }
}

/**
 * Authenticates user from Firestore
 */
export async function authenticateFromFirestore(
  username: string, 
  password: string
): Promise<AuthUser | null> {
  try {
    const userRef = doc(db, 'users', username.toLowerCase().trim());
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.password === password) {
        return {
          username: data.username,
          name: data.name,
          role: data.role as UserRole,
        };
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${username}`);
    return null;
  }
}

/**
 * Seeds default active session in Firestore if not exists
 */
export async function seedDefaultSessionIfEmpty(): Promise<AuditSession> {
  const sessionRef = doc(db, 'sessions', ACTIVE_SESSION_DOC);
  try {
    const snap = await getDoc(sessionRef);
    if (!snap.exists()) {
      const defaultSess = createDefaultSession();
      await setDoc(sessionRef, {
        ...defaultSess,
        updatedAt: new Date().toISOString(),
      });
      return defaultSess;
    }
    return snap.data() as AuditSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `sessions/${ACTIVE_SESSION_DOC}`);
    return createDefaultSession();
  }
}

/**
 * 2-Way Realtime Listener for Active Stock Checking Session
 */
export function subscribeToActiveSession(
  onUpdate: (session: AuditSession) => void,
  onError?: (err: any) => void
): () => void {
  const sessionRef = doc(db, 'sessions', ACTIVE_SESSION_DOC);
  
  return onSnapshot(
    sessionRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AuditSession;
        if (data && Array.isArray(data.items)) {
          onUpdate(data);
        }
      } else {
        // If not exists yet, seed it
        seedDefaultSessionIfEmpty().then(onUpdate);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `sessions/${ACTIVE_SESSION_DOC}`);
      if (onError) onError(error);
    }
  );
}

/**
 * Push session updates to Firestore (triggers 2-way sync on all other devices)
 */
export async function syncSessionToFirestore(session: AuditSession): Promise<void> {
  try {
    const sessionRef = doc(db, 'sessions', ACTIVE_SESSION_DOC);
    await setDoc(sessionRef, {
      ...session,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `sessions/${ACTIVE_SESSION_DOC}`);
    throw error;
  }
}

/**
 * Realtime updates for item check state (instant Petugas Cek <-> Admin 2-way sync)
 */
export async function syncItemCheckToFirestore(
  currentSession: AuditSession,
  itemId: string,
  checkerName: string
): Promise<AuditSession> {
  const updatedItems = currentSession.items.map((item) => {
    if (item.id === itemId) {
      const nextChecked = !item.isChecked;
      return {
        ...item,
        isChecked: nextChecked,
        checkedAt: nextChecked ? new Date().toISOString() : null,
        checkedBy: nextChecked ? checkerName : null,
        adminFlagged: nextChecked ? false : item.adminFlagged,
      };
    }
    return item;
  });

  const anyStillFlagged = updatedItems.some((i) => i.adminFlagged);
  const newStatus = anyStillFlagged 
    ? 'PERLU_REVISI' 
    : currentSession.status === 'TERVALIDASI' 
    ? 'TERVALIDASI' 
    : 'SEDANG_DICEK';

  const updatedSession: AuditSession = {
    ...currentSession,
    items: updatedItems,
    status: newStatus,
  };

  await syncSessionToFirestore(updatedSession);
  return updatedSession;
}

/**
 * 2-Way Realtime Listener for Finalized Audit Reports
 */
export function subscribeToReports(
  onUpdate: (reports: AuditReportSummary[]) => void,
  onError?: (err: any) => void
): () => void {
  const reportsCol = collection(db, 'reports');

  return onSnapshot(
    reportsCol,
    (snapshot) => {
      const reports: AuditReportSummary[] = [];
      snapshot.forEach((docSnap) => {
        reports.push(docSnap.data() as AuditReportSummary);
      });
      // Sort newest first
      reports.sort((a, b) => new Date(b.tanggalSelesai).getTime() - new Date(a.tanggalSelesai).getTime());
      onUpdate(reports);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
      if (onError) onError(error);
    }
  );
}

/**
 * Saves a finalized report to Firestore
 */
export async function saveReportToFirestore(report: AuditReportSummary): Promise<void> {
  try {
    const reportRef = doc(db, 'reports', report.id);
    await setDoc(reportRef, {
      ...report,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `reports/${report.id}`);
    throw error;
  }
}

/**
 * Deletes a report from Firestore
 */
export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reports/${reportId}`);
    throw error;
  }
}
