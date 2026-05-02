'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, ShieldOff, Trash2, Eye, CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

type CreateForm = { firstname: string; lastname: string; email: string; password: string };
const EMPTY_FORM: CreateForm = { firstname: '', lastname: '', email: '', password: '' };

export default function UsersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'verified' | 'suspended'>('all');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateForm>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15, search: search || undefined };
      if (filter === 'verified') params.verified = true;
      if (filter === 'suspended') params.suspended = true;
      const res = await adminApi.getUsers(params);
      const d = res.data ?? res;
      setData({ users: d.users ?? [], total: d.total ?? 0, pages: d.totalPages ?? 1 });
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  async function handleSuspend(id: string, suspended: boolean) {
    try {
      if (suspended) {
        await adminApi.activateUser(id);
        toast.success('User activated');
      } else {
        await adminApi.suspendUser(id);
        toast.success('User suspended');
      }
      load();
    } catch {
      toast.error('Action failed');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  }

  function validate() {
    const e: Partial<CreateForm> = {};
    if (!form.firstname.trim()) e.firstname = 'Required';
    if (!form.lastname.trim()) e.lastname = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await adminApi.createUser({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('User created');
      setShowModal(false);
      setForm(EMPTY_FORM);
      setErrors({});
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data?.total ?? '—'} total users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />New User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'verified', 'suspended'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Verified</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Applications</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.users?.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No users found</td></tr>
              ) : (
                data?.users?.map((user: any) => (
                  <tr key={user._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                          {user.firstname?.[0]}{user.lastname?.[0]}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{user.firstname} {user.lastname}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-5 py-3.5">
                      {user.verified
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <XCircle className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${user.suspended ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                        {user.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{user.applicationCount ?? 0}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/users/${user._id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleSuspend(user._id, user.suspended)}
                          className={`p-1.5 rounded-lg transition-colors ${user.suspended ? 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}
                        >
                          <ShieldOff className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, `${user.firstname} ${user.lastname}`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {data.pages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Create User</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">A verification email will be sent to their inbox</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" error={errors.firstname}>
                  <input
                    value={form.firstname}
                    onChange={e => { setForm(f => ({ ...f, firstname: e.target.value })); setErrors(v => ({ ...v, firstname: undefined })); }}
                    placeholder="John"
                    className={inputCls(!!errors.firstname)}
                  />
                </Field>
                <Field label="Last Name" error={errors.lastname}>
                  <input
                    value={form.lastname}
                    onChange={e => { setForm(f => ({ ...f, lastname: e.target.value })); setErrors(v => ({ ...v, lastname: undefined })); }}
                    placeholder="Doe"
                    className={inputCls(!!errors.lastname)}
                  />
                </Field>
              </div>
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(v => ({ ...v, email: undefined })); }}
                  placeholder="john@example.com"
                  className={inputCls(!!errors.email)}
                />
              </Field>
              <Field label="Password" error={errors.password}>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(v => ({ ...v, password: undefined })); }}
                  placeholder="Min 8 characters"
                  className={inputCls(!!errors.password)}
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors">
                  {saving ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors`;
}
