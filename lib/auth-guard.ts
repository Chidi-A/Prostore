import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    redirect('/unauthorized');
  }
  return session;
}
