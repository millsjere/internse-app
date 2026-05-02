import { cn } from '@/lib/utils';

type Variant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<Variant, string> = {
  blue:   'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  green:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  red:    'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  gray:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
};

const dotColors: Record<Variant, string> = {
  blue:   'bg-blue-500',
  green:  'bg-emerald-500',
  yellow: 'bg-amber-500',
  red:    'bg-red-500',
  gray:   'bg-gray-400',
  purple: 'bg-purple-500',
};

export function Badge({ variant = 'gray', children, className, dot }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function jobStatusBadge(status: string) {
  const map: Record<string, { variant: Variant; label: string }> = {
    published: { variant: 'green', label: 'Published' },
    drafted:   { variant: 'gray',  label: 'Draft' },
    closed:    { variant: 'red',   label: 'Closed' },
  };
  const cfg = map[status] ?? { variant: 'gray', label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

export function applicationStatusBadge(status: string) {
  const map: Record<string, { variant: Variant; label: string }> = {
    pending:   { variant: 'yellow', label: 'Pending' },
    reviewing: { variant: 'blue',   label: 'Reviewing' },
    accepted:  { variant: 'green',  label: 'Accepted' },
    rejected:  { variant: 'red',    label: 'Rejected' },
  };
  const cfg = map[status] ?? { variant: 'gray', label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}
