import PasswordResetEmail from "@/components/emails/reset-email";
import VerificationEmail from "@/components/emails/verification-email";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

const sendAuthEmail = async ({
    to,
    subject,
    email,
}: {
    to: string;
    subject: string;
    email: ReactElement;
}) => {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        EMAIL_SENDER_NAME,
        EMAIL_SENDER_ADDRESS,
    } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new Error("SMTP_HOST, SMTP_USER and SMTP_PASS must be configured");
    }

    const port = Number(SMTP_PORT ?? 465);
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    const [html, text] = await Promise.all([
        render(email),
        render(email, { plainText: true }),
    ]);

    await transporter.sendMail({
        from: `"${EMAIL_SENDER_NAME ?? "GeoKenistik"}" <${EMAIL_SENDER_ADDRESS ?? SMTP_USER}>`,
        to,
        subject,
        html,
        text,
    });
};

export const auth = betterAuth({
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendAuthEmail({
                to: user.email,
                subject: "Электрондық поштаңызды растаңыз",
                email: VerificationEmail({ userName: user.name, verificationUrl: url }),
            });
        },
        sendOnSignUp: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendAuthEmail({
                to: user.email,
                subject: "Құпиясөзді қалпына келтіру",
                email: PasswordResetEmail({ userName: user.name, resetUrl: url, requestTime: new Date().toLocaleString() }),
            });
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 минут: в это время getSession не ходит в БД
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    plugins: [nextCookies()]
});
