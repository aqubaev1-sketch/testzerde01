import { getOrCreateAttempt } from './actions';
import TestEContent from './TestEContent';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function TestPage() {
  // Proxy проверяет наличие cookie, а здесь проверяем, что сессия ещё действительна.
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    // Вместо server-side error возвращаем пользователя на вход и сохраняем цель.
    redirect('/login?callbackUrl=/testent');
  }

  const data = await getOrCreateAttempt();

  return <TestEContent initialData={data} />;
}
