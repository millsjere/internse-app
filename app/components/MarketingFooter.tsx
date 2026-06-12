import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Github, Instagram } from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    // { label: 'Blog', href: '#' },
  ],
  jobSeekers: [
    { label: 'Browse Opportunities', href: '/jobs' },
    { label: 'Create Profile', href: '/register' },
    // { label: 'Career Resources', href: '#' },
    // { label: 'Salary Guide', href: '#' },
  ],
  employers: [
    { label: 'Post a Job', href: '/register' },
    { label: 'Employer Login', href: '/login' },
    // { label: 'Hire Talent', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    // { label: 'Accessibility', href: '#' },
  ],
};

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export function MarketingFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/images/internse-logo.png" alt="Internse" width={140} height={42} className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              The fastest way to find and land your perfect internship. Join 50,000+ students building their careers.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Job Seekers</h4>
            <ul className="space-y-2.5">
              {footerLinks.jobSeekers.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Employers</h4>
            <ul className="space-y-2.5">
              {footerLinks.employers.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Internse. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Powered by <a href="https://jestadigitalsolutions.com" className="hover:text-white transition-colors">Jesta Digital Solutions</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
