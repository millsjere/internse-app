import { Rethink_Sans } from 'next/font/google';
import { MarketingShell } from '@/app/components/MarketingShell';

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-rethink',
  display: 'swap',
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${rethinkSans.variable} font-rethink`}>
      <MarketingShell>{children}</MarketingShell>
    </div>
  );
}
