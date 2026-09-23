// db/queries.ts
import { db } from '@/db/drizzle';
import { questions, subjects, attempts } from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

/**
 * Берёт случайные вопросы по каждому предмету согласно
 * questionsCount, заданному в таблице subjects (20/10/10).
 * Возвращает массив id вопросов в порядке: history -> reading -> math
 * (порядок определяется порядком предметов в таблице subjects).
 */
export async function pickRandomQuestions(): Promise<string[]> {
  const allSubjects = await db.select().from(subjects);

  if (allSubjects.length === 0) {
    throw new Error('В таблице subjects нет записей. Запусти seed.');
  }

  const allIds: string[] = [];

  for (const subject of allSubjects) {
    const rows = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.subjectId, subject.id))
      .orderBy(sql`random()`)
      .limit(subject.questionsCount);

    if (rows.length < subject.questionsCount) {
      throw new Error(
        `Недостаточно вопросов по предмету "${subject.id}": есть ${rows.length}, нужно ${subject.questionsCount}`
      );
    }

    allIds.push(...rows.map((r) => r.id));
  }

  return allIds;
}

/**
 * История завершённых попыток пользователя для профиля.
 */
export async function getUserAttemptsHistory(userId: string) {
  const rows = await db
    .select({
      id: attempts.id,
      score: attempts.score,
      questionIds: attempts.questionIds,
      status: attempts.status,
      startedAt: attempts.startedAt,
      finishedAt: attempts.finishedAt,
    })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.status, 'finished')))
    .orderBy(desc(attempts.finishedAt));

  return rows.map((r) => ({
    id: r.id,
    score: r.score ?? 0,
    total: (r.questionIds as string[]).length,
    startedAt: r.startedAt.toISOString(),
    finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
  }));
}

/**
 * Разбивка результата одной попытки по предметам (сколько правильно из скольки).
 */
export async function getAttemptSubjectBreakdown(attemptId: string, userId: string) {
  const [attempt] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId)));

  if (!attempt) return null;

  const ids = attempt.questionIds as string[];
  const answers = attempt.answers as Record<string, string>;
  const rows = await db.select().from(questions).where(sql`${questions.id} = ANY(${ids})`);

  const bySubject: Record<string, { correct: number; total: number }> = {};
  for (const q of rows) {
    if (!bySubject[q.subjectId]) bySubject[q.subjectId] = { correct: 0, total: 0 };
    bySubject[q.subjectId].total += 1;
    if (answers[q.id] === q.correctOptionId) bySubject[q.subjectId].correct += 1;
  }

  return bySubject;
}