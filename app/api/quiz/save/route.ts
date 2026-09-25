// app/api/quiz/save/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';        // ← жоғарыдағы команда нәтижесіне қарай түзетіңіз
import { db } from '@/db/drizzle';        // ← auth.ts-те осылай импортталған
import { aiQuizResults } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: 'Авторизация керек' }, { status: 401 });
    }

    const { topic, score, total, answers, questions } = await request.json();

    const [saved] = await db
      .insert(aiQuizResults)
      .values({
        userId: session.user.id,
        topic,
        score,
        total,
        answers,
        questions,
      })
      .returning();

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    console.error('Save quiz error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}