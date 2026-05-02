'use client';

import { useState } from 'react';
import { Send, Users, Building2, User } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

type Tab = 'broadcast' | 'direct';

const SEGMENTS = [
  { value: 'all_users', label: 'All Users', icon: Users },
  { value: 'all_companies', label: 'All Companies', icon: Building2 },
];

export default function EmailPage() {
  const [tab, setTab] = useState<Tab>('broadcast');

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send broadcast or direct emails to users and companies.</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {(['broadcast', 'direct'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${tab === t ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'broadcast' ? <BroadcastForm /> : <DirectForm />}
    </div>
  );
}

function BroadcastForm() {
  const [form, setForm] = useState({ segment: 'all_users', subject: '', html: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.html.trim()) { toast.error('Email body is required'); return; }
    setLoading(true);
    try {
      const res = await adminApi.sendBroadcast(form);
      toast.success(`Sent to ${res.sent ?? '?'} recipients`);
      setForm({ segment: 'all_users', subject: '', html: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Send failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audience</label>
        <div className="grid grid-cols-2 gap-3">
          {SEGMENTS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, segment: value })}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${form.segment === value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>

      <EmailFields form={form} setForm={setForm} />

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Sending…' : 'Send Broadcast'}
      </button>
    </form>
  );
}

function DirectForm() {
  const [form, setForm] = useState({ recipientId: '', recipientType: 'user' as 'user' | 'company', subject: '', html: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.recipientId.trim()) { toast.error('Recipient ID is required'); return; }
    if (!form.html.trim()) { toast.error('Email body is required'); return; }
    setLoading(true);
    try {
      await adminApi.sendDirectEmail(form);
      toast.success('Email sent');
      setForm({ recipientId: '', recipientType: 'user', subject: '', html: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Send failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Recipient Type</label>
          <div className="flex gap-2">
            {(['user', 'company'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, recipientType: t })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 capitalize transition-colors ${form.recipientType === t ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
              >
                {t === 'user' ? <User className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}{t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Recipient ID</label>
          <input
            type="text"
            required
            value={form.recipientId}
            onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
            className="w-full px-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="MongoDB ObjectId"
          />
        </div>
      </div>

      <EmailFields form={form} setForm={setForm} />

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Sending…' : 'Send Email'}
      </button>
    </form>
  );
}

function EmailFields({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Email subject"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Body (HTML)</label>
        <textarea
          required
          rows={10}
          value={form.html}
          onChange={(e) => setForm({ ...form, html: e.target.value })}
          className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono resize-y"
          placeholder="<p>Hello,</p><p>Your email body here...</p>"
        />
      </div>
    </>
  );
}
