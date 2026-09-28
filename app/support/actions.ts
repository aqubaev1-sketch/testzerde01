// app/support/actions.ts
'use server';

import nodemailer from 'nodemailer';

export type SupportState = { ok: boolean; message: string };

const TOPICS: Record<string, string> = {
  bug: 'Қате туралы хабарлама',
  test: 'Тест / нәтиже мәселесі',
  ai: 'AI репетитор',
  idea: 'Ұсыныс',
  other: 'Басқа',
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function sendSupportMessage(
  _prev: SupportState,
  formData: FormData
): Promise<SupportState> {
  // Honeypot: адам көрмейтін өріс. Бот толтырса — үнсіз "сәтті" деп қайтарамыз
  if (formData.get('website')) return { ok: true, message: 'Хабарлама жіберілді.' };

  const name = String(formData.get('name') ?? '').trim().slice(0, 100);
  const email = String(formData.get('email') ?? '').trim().slice(0, 200);
  const topicKey = String(formData.get('topic') ?? 'other');
  const message = String(formData.get('message') ?? '').trim().slice(0, 3000);

  if (name.length < 2) return { ok: false, message: 'Атыңызды жазыңыз.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, message: 'Email мекенжайы дұрыс емес.' };
  if (message.length < 10)
    return { ok: false, message: 'Хабарлама тым қысқа (кемінде 10 таңба).' };

  const topic = TOPICS[topicKey] ?? TOPICS.other;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SUPPORT_TO_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SUPPORT_TO_EMAIL) {
    console.error('SMTP параметрлері .env файлында толық емес');
    return { ok: false, message: 'Сервер бапталмаған. Кейінірек қайталап көріңіз.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 465),
      secure: Number(SMTP_PORT ?? 465) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      // mail.ru тек өз аккаунтыңның мекенжайынан жіберуге рұқсат береді
      from: `"ZERDE қолдау" <${SMTP_USER}>`,
      to: SUPPORT_TO_EMAIL,
      replyTo: `"${name.replace(/"/g, '')}" <${email}>`, // "Жауап беру" батырмасы қолданушыға жібереді
      subject: `[ZERDE] ${topic} — ${name}`,
      text: `Тақырып: ${topic}\nАты: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
          <h2 style="margin:0 0 12px">${escapeHtml(topic)}</h2>
          <p style="margin:0"><b>Аты:</b> ${escapeHtml(name)}</p>
          <p style="margin:0 0 16px"><b>Email:</b> ${escapeHtml(email)}</p>
          <div style="white-space:pre-wrap;border-left:4px solid #6366f1;padding-left:12px">${escapeHtml(message)}</div>
        </div>`,
    });

    return { ok: true, message: 'Хабарлама жіберілді. Жауапты email арқылы аласыз.' };
  } catch (err) {
    console.error('Email жіберу қатесі:', err);
    return { ok: false, message: 'Жіберу мүмкін болмады. Кейінірек қайталап көріңіз.' };
  }
}