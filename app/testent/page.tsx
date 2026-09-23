import { getOrCreateAttempt } from './actions';
import TestEContent from './TestEContent';

export default async function TestPage() {
  const data = await getOrCreateAttempt();

  return <TestEContent initialData={data} />;
}