'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Twitter, Linkedin, Github, CheckCircle2 } from 'lucide-react';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@internse.com', href: 'mailto:hello@internse.com' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 000-1234', href: 'tel:+15550001234' },
  { icon: MapPin, label: 'Office', value: 'San Francisco, CA 94105', href: '#' },
];

const socials = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
];

const subjects = [
  'General enquiry',
  'Employer / hiring partnership',
  'Technical support',
  'Billing question',
  'Press & media',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-5xl font-extrabold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-blue-100">
            Have a question, a partnership idea, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Left — info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">We&apos;re here to help</h2>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Our team typically responds within 24 hours on business days. For urgent support, reach out via email directly.
                </p>
              </div>

              {/* Contact cards */}
              <div className="space-y-3">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Socials */}
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {socials.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-200"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Office hours */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-transparent dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Office Hours</h3>
                <div className="space-y-1.5 text-sm">
                  {[
                    { day: 'Monday – Friday', hours: '9:00 AM – 6:00 PM PST' },
                    { day: 'Saturday', hours: '10:00 AM – 2:00 PM PST' },
                    { day: 'Sunday', hours: 'Closed' },
                  ].map((row) => (
                    <div key={row.day} className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{row.day}</span>
                      <span className={row.hours === 'Closed' ? 'text-red-400 font-semibold' : ''}>{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                      className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label">Full Name</label>
                        <input type="text" required placeholder="Jane Smith" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="input" />
                      </div>
                      <div>
                        <label className="label">Email Address</label>
                        <input type="email" required placeholder="jane@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input" />
                      </div>
                    </div>

                    <div>
                      <label className="label">Subject</label>
                      <select required value={form.subject} onChange={(e) => updateField('subject', e.target.value)} className="input">
                        <option value="">Select a subject...</option>
                        {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="label">Message</label>
                      <textarea required rows={6} placeholder="Tell us how we can help..." value={form.message} onChange={(e) => updateField('message', e.target.value)} className="input resize-none" />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-blue-200 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Message</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
