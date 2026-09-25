// app/test/actions.ts
'use server';

import { db } from '@/db/drizzle';
import { attempts, questions } from '@/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { pickRandomQuestions } from '@/db/queries';
import type { InitialData, ServerQuestion } from './TestEContent';

const TOTAL_SECONDS = 5400; // 1.5 часа — держим синхронно с фронтом

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');
  return session.user;
}

/** Собирает данные попытки в безопасном для клиента виде (без correctOptionId) */
async function serializeAttempt(attemptId: string): Promise<InitialData> {
  const [attempt] = await db.select().from(attempts).where(eq(attempts.id, attemptId));
  if (!attempt) throw new Error('Attempt not found');

  const ids = attempt.questionIds as string[];
  const rows = await db.select().from(questions).where(inArray(questions.id, ids));

  const byId = Object.fromEntries(rows.map((q) => [q.id, q]));
  const orderedQuestions: ServerQuestion[] = ids.map((id) => {
    const q = byId[id];
    return {
      id: q.id,
      subjectId: q.subjectId as ServerQuestion['subjectId'],
      questionText: q.questionText,
      options: q.options as { id: string; text: string }[],
    };
  });

  return {
    attemptId: attempt.id,
    questions: orderedQuestions,
    answers: attempt.answers as Record<string, string>,
    startedAt: attempt.startedAt.toISOString(),
    status: attempt.status as InitialData['status'],
    score: attempt.score,
    totalSeconds: TOTAL_SECONDS,
  };
}

/** Создаёт новую попытку с рандомным набором вопросов */
export async function startAttempt() {
  const user = await requireUser();

  const questionIds = await pickRandomQuestions();

  const [attempt] = await db
    .insert(attempts)
    .values({ userId: user.id, questionIds })
    .returning();

  return serializeAttempt(attempt.id);
}

/** Возвращает текущую незавершённую попытку или создаёт новую */
export async function getOrCreateAttempt() {
  const user = await requireUser();

  const [existing] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.userId, user.id), eq(attempts.status, 'in_progress')))
    .limit(1);

  if (existing) {
    return serializeAttempt(existing.id);
  }

  return startAttempt();
}

/** Сохраняет один ответ */
export async function saveAnswer(attemptId: string, questionId: string, optionId: string) {
  const user = await requireUser();

  const [attempt] = await db.select().from(attempts).where(eq(attempts.id, attemptId));
  if (!attempt || attempt.userId !== user.id) throw new Error('Forbidden');
  if (attempt.status !== 'in_progress') throw new Error('Attempt already finished');

  const updatedAnswers = {
    ...(attempt.answers as Record<string, string>),
    [questionId]: optionId,
  };

  await db.update(attempts).set({ answers: updatedAnswers }).where(eq(attempts.id, attemptId));

  return { ok: true };
}

/** Завершает попытку и считает баллы на сервере */
export async function finishAttempt(attemptId: string) {
  const user = await requireUser();

  const [attempt] = await db.select().from(attempts).where(eq(attempts.id, attemptId));
  if (!attempt || attempt.userId !== user.id) throw new Error('Forbidden');
  if (attempt.status === 'finished') {
    return { score: attempt.score ?? 0, total: (attempt.questionIds as string[]).length };
  }

  const ids = attempt.questionIds as string[];
  const rows = await db.select().from(questions).where(inArray(questions.id, ids));
  const answers = attempt.answers as Record<string, string>;

  const score = rows.filter((q) => answers[q.id] === q.correctOptionId).length;

  await db
    .update(attempts)
    .set({ status: 'finished', score, finishedAt: new Date() })
    .where(eq(attempts.id, attemptId));

  return { score, total: rows.length };
}