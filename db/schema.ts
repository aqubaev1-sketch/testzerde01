import { relations, sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
    image: text('image'),
    role: text('role').notNull().default('user'),
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const notebooks = pgTable("notebooks", {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const notebookRelations = relations(notebooks, ({ many, one }) => ({
    notes: many(notes),
    user: one(user, {
        fields: [notebooks.userId],
        references: [user.id]
    })
}));

export type Notebook = typeof notebooks.$inferSelect & {
    notes: Note[];
};
export type InsertNotebook = typeof notebooks.$inferInsert;

export const notes = pgTable("notes", {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    title: text('title').notNull(),
    content: jsonb('content').notNull(),
    notebookId: text('notebook_id').notNull().references(() => notebooks.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const noteRelations = relations(notes, ({ one }) => ({
    notebook: one(notebooks, {
        fields: [notes.notebookId],
        references: [notebooks.id]
    })
}));

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

// ===== НОВОЕ: таблицы теста (ниже до конца файла) =====

export const subjects = pgTable("subjects", {
    id: text('id').primaryKey(), // 'history' | 'reading' | 'math'
    title: text('title').notNull(),
    shortTitle: text('short_title').notNull(),
    questionsCount: integer('questions_count').notNull(), // сколько вопросов брать при рандоме (20/10/10)
});

export const questions = pgTable("questions", {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
    questionText: text('question_text').notNull(),
    options: jsonb('options').notNull(), // [{ id: 'a', text: '...' }, ...]
    correctOptionId: text('correct_option_id').notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
});

export const attempts = pgTable("attempts", {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    questionIds: jsonb('question_ids').notNull(), // ['uuid1', 'uuid2', ...] — зафиксированный набор при старте
    answers: jsonb('answers').notNull().default({}), // { [questionId]: optionId }
    score: integer('score'),
    status: text('status').notNull().default('in_progress'), // 'in_progress' | 'finished'
    startedAt: timestamp('started_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
    finishedAt: timestamp('finished_at'),
});

export const subjectRelations = relations(subjects, ({ many }) => ({
    questions: many(questions),
}));

export const questionRelations = relations(questions, ({ one }) => ({
    subject: one(subjects, {
        fields: [questions.subjectId],
        references: [subjects.id]
    })
}));

export const attemptRelations = relations(attempts, ({ one }) => ({
    user: one(user, {
        fields: [attempts.userId],
        references: [user.id]
    })
}));

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = typeof attempts.$inferInsert;

// ===== КОНЕЦ НОВОГО =====

export const schema = {
    user, session, account, verification,
    notebooks, notes, notebookRelations, noteRelations,
    subjects, questions, attempts,
    subjectRelations, questionRelations, attemptRelations,
};