import React, { useState } from 'react';
import { 
  X, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Edit3, 
  Check, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Lock,
  Sparkles,
  UserCog,
  Save
} from 'lucide-react';
import { UserAccountDoc, updateUserInFirestore, createUserInFirestore } from '../services/stockSyncService';
import { AuthUser } from '../types/stock';
import { PREDEFINED_ACCOUNTS } from '../utils/storage';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  usersList: UserAccountDoc[];
  onUserUpdated: (updatedUser: UserAccountDoc) => void;
}

export function UserManagementModal({
  isOpen,
  onClose,
  currentUser,
  usersList = [],
  onUserUpdated,
}: UserManagementModalProps) {
  // Safe user list fallback
  const effectiveUsers = usersList.length > 0 ? usersList : PREDEFINED_ACCOUNTS;

  // Find the admin account (Budi Santoso)
  const adminAccount = effectiveUsers.find((u) => u.username === 'admin') || 
                       effectiveUsers.find((u) => u.role === 'ADMIN') || 
                       PREDEFINED_ACCOUNTS[0];

  // Quick rename state specifically for Budi Santoso / Admin
  const [budiNewName, setBudiNewName] = useState(adminAccount?.name || 'Budi Santoso');
  const [isSavingBudi, setIsSavingBudi] = useState(false);

  // General user editing state
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER_CHECKER'>('USER_CHECKER');
  const [newPassword, setNewPassword] = useState('123');
  const [newTitle, setNewTitle] = useState('');

  if (!isOpen) return null;

  // STRICT SECURITY GUARD: If non-admin tries to open, strictly block access!
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Akses Ditolak</h3>
            <p className="text-xs text-slate-500 mt-1">
              Pengaturan pengguna hanya dapat diakses oleh akun <strong>Admin</strong>. Petugas Cek dilarang mengubah data akun.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // Quick rename handler specifically for Budi Santoso / Admin
  const handleQuickRenameBudi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budiNewName.trim()) {
      setErrorMsg('Nama baru tidak boleh kosong!');
      return;
    }

    setIsSavingBudi(true);
    setErrorMsg(null);

    try {
      const targetUsername = adminAccount.username || 'admin';
      const updates: Partial<UserAccountDoc> = {
        name: budiNewName.trim(),
        updatedAt: new Date().toISOString(),
      };

      await updateUserInFirestore(targetUsername, updates);

      const updatedAccount: UserAccountDoc = {
        ...adminAccount,
        ...updates,
        name: budiNewName.trim(),
      };

      onUserUpdated(updatedAccount);
      setSuccessMsg(`Nama Admin (Budi Santoso) berhasil diubah menjadi "${budiNewName.trim()}". Tersimpan di database cloud.`);
      setTimeout(() => setSuccessMsg(null), 4500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah nama Budi Santoso ke database cloud.');
    } finally {
      setIsSavingBudi(false);
    }
  };

  const startEdit = (user: UserAccountDoc) => {
    setEditingUsername(user.username);
    setFormName(user.name);
    setFormTitle(user.title || '');
    setFormPassword(user.password || '123');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUsername) return;
    if (!formName.trim()) {
      setErrorMsg('Nama pengguna tidak boleh kosong!');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updates: Partial<UserAccountDoc> = {
        name: formName.trim(),
        title: formTitle.trim(),
        password: formPassword.trim() || '123',
      };

      await updateUserInFirestore(editingUsername, updates);

      const target = effectiveUsers.find((u) => u.username === editingUsername);
      if (target) {
        onUserUpdated({
          ...target,
          ...updates,
          name: formName.trim(),
        });
      }

      setSuccessMsg(`Data pengguna "${formName.trim()}" berhasil disimpan ke database.`);
      setEditingUsername(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan pengguna ke database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      setErrorMsg('Username dan Nama wajib diisi!');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const newUser: UserAccountDoc = {
        username: newUsername.trim().toLowerCase(),
        name: newName.trim(),
        role: newRole,
        password: newPassword.trim() || '123',
        title: newTitle.trim() || (newRole === 'ADMIN' ? 'Admin Gudang' : 'Petugas Cek Lapangan'),
      };

      await createUserInFirestore(newUser);
      setShowAddUser(false);
      setNewUsername('');
      setNewName('');
      setNewTitle('');
      setSuccessMsg(`Pengguna baru "${newUser.name}" berhasil ditambahkan ke database cloud.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan pengguna baru.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Pengaturan Pengguna & Nama User
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  Khusus Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ubah nama akun Budi Santoso, perbarui profil, atau tambah petugas cek baru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Notification Messages */}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SPOTLIGHT CARD: Ubah Nama Budi Santoso (Permintaan User #7) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50/70 border-2 border-indigo-300 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-indigo-950 flex items-center gap-1.5">
                    <span>Ubah Nama Admin: <strong>{adminAccount.name}</strong></span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      @{adminAccount.username}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ketik nama baru untuk menggantikan nama default <em>"Budi Santoso"</em>
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleQuickRenameBudi} className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={budiNewName}
                    onChange={(e) => setBudiNewName(e.target.value)}
                    placeholder="Masukkan nama baru (contoh: Matsunaga / Budi Santoso)"
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900 shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSavingBudi || !budiNewName.trim() || budiNewName.trim() === adminAccount.name}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingBudi ? 'Menyimpan...' : 'Simpan Nama Admin'}</span>
                </button>
              </div>

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Pilihan cepat:
                </span>
                {['Matsunaga', 'Budi Santoso', 'Admin Gudang Pusat', 'Mads'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudiNewName(preset)}
                    className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400 text-slate-700 text-[10px] font-medium transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* User List Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Daftar Seluruh Pengguna Sistem ({effectiveUsers.length})</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddUser ? 'Batal Tambah' : 'Tambah Pengguna Baru'}</span>
              </button>
            </div>

            {/* Add User Form (Collapsible) */}
            {showAddUser && (
              <form onSubmit={handleCreateUser} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-slate-900 block">Form Tambah Akun Pengguna Baru</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Username (Login)</label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: budi_gudang"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: Matsunaga"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Peran Akun</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="ADMIN">Admin (Akses Penuh)</option>
                      <option value="USER_CHECKER">Petugas Cek (Hanya Cek Barang)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Password Login</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-3 py-1 text-xs text-slate-600 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Akun Baru'}
                  </button>
                </div>
              </form>
            )}

            {/* Accounts Cards List */}
            <div className="space-y-2.5">
              {effectiveUsers.map((user) => {
                const isCurrentlyEditing = editingUsername === user.username;
                const isAdmin = user.role === 'ADMIN';

                return (
                  <div
                    key={user.username}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrentlyEditing
                        ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isCurrentlyEditing ? (
                      /* Edit Form */
                      <form onSubmit={handleSaveEdit} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Edit Pengguna: <strong>@{user.username}</strong></span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                            {isAdmin ? 'Akun Admin' : 'Akun Petugas Cek'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Nama Lengkap Pengguna <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formName}
                              onChange={(e) => setFormName(e.target.value)}
                              placeholder="Masukkan nama baru"
                              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900"
                              autoFocus
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Nama ini akan tampil di header, sesi aktif, dan laporan resmi.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Jabatan / Keterangan
                            </label>
                            <input
                              type="text"
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              placeholder="Contoh: Kepala Gudang & Stok"
                              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Password Login
                            </label>
                            <input
                              type="text"
                              value={formPassword}
                              onChange={(e) => setFormPassword(e.target.value)}
                              placeholder="Password"
                              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setEditingUsername(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Display Card */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              isAdmin
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-blue-600 text-white shadow-xs'
                            }`}
                          >
                            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900">{user.name}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                                  isAdmin
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {isAdmin ? 'ADMIN' : 'PETUGAS CEK'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Username: <span className="font-mono font-semibold text-slate-700">@{user.username}</span> &bull;{' '}
                              <span>{user.title || (isAdmin ? 'Admin Gudang & Stok' : 'Petugas Cek Lapangan')}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action Edit */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Ubah Nama / Data</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            *Semua perubahan nama akan otomatis tersinkronisasi ke seluruh perangkat secara real-time.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
