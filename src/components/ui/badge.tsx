import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'hot' | 'warm' | 'cold' | 'outline' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variant === 'default' && 'bg-primary/10 text-primary',
        variant === 'hot' && 'bg-red-100 text-red-700',
        variant === 'warm' && 'bg-amber-100 text-amber-800',
        variant === 'cold' && 'bg-slate-100 text-slate-600',
        variant === 'outline' && 'border text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
