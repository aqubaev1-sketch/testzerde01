import fs from 'node:fs';

const mode = process.argv[2];
const page = fs.readFileSync('app/testent/page.tsx', 'utf8');
const client = fs.readFileSync('app/testent/TestStart.tsx', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

if (mode === 'source') {
  assert(page.includes("import TestStart from './TestStart'"), 'test route must render TestStart');
  assert(!page.includes('getOrCreateAttempt'), 'test route must not fetch or create an attempt');
  assert(page.includes('return <TestStart />'), 'test route must return the lightweight start screen');
  console.log('source flow verification passed');
} else if (mode === 'client') {
  assert(client.includes('onClick={handleStart}'), 'start control must call handleStart');
  assert(client.includes('await getOrCreateAttempt()'), 'attempt must be requested only from the start handler');
  assert(client.includes('setAttempt(data)'), 'loaded attempt must be stored');
  assert(client.includes('return <TestEContent initialData={attempt} />'), 'loaded attempt must render timed test');
  assert(client.includes('disabled={isStarting}'), 'duplicate starts must be disabled while loading');
  assert(client.includes('Тест дайындалуда…'), 'loading feedback must be visible');
  console.log('client flow verification passed');
} else {
  throw new Error('Use source or client verification mode');
}
