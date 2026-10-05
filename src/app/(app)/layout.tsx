import { redirect } from 'next/navigation';
import { getAppSession } from '@/lib/auth/session';
import { AppShell } from '@/components/layout/app-shell';
import { Providers } from '@/components/providers';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAppSession();
  if (!user) redirect('/login');

  return (
    <Providers>
      <AppShell userName={user.name}>{children}</AppShell>
    </Providers>
  );
}
