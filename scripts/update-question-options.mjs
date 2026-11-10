import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { neon } from "@neondatabase/serverless";

const root = process.cwd();
const envPath = path.join(root, "_env");
const seedPath = path.join(root, "scripts", "seed.ts");
const insertMissing = process.argv.includes("--insert-missing");
const applyChanges = process.argv.includes("--apply") || insertMissing;

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (!fs.existsSync(envPath)) {
    throw new Error("DATABASE_URL is missing and local _env was not found");
  }

  const line = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith("DATABASE_URL="));

  if (!line) throw new Error("DATABASE_URL was not found in _env");
  const value = line.slice(line.indexOf("=") + 1).trim();
  return value.replace(/^(['"])(.*)\1$/, "$2");
}

function property(object, name) {
  return object.properties.find(
    (item) => ts.isPropertyAssignment(item) && item.name.getText() === name,
  );
}

function extractQuestions() {
  const source = fs.readFileSync(seedPath, "utf8");
  const file = ts.createSourceFile(
    seedPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const result = [];

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const subject = property(node, "subjectId")?.initializer;
      const text = property(node, "questionText")?.initializer;
      const optionsNode = property(node, "options")?.initializer;
      const correct = property(node, "correctOptionId")?.initializer;

      if (
        subject &&
        text &&
        optionsNode &&
        correct &&
        ts.isStringLiteral(subject) &&
        ts.isStringLiteral(text) &&
        ts.isArrayLiteralExpression(optionsNode) &&
        ts.isStringLiteral(correct)
      ) {
        const options = optionsNode.elements.map((element) => {
          if (!ts.isObjectLiteralExpression(element)) {
            throw new Error(`Invalid option in question: ${text.text}`);
          }
          const id = property(element, "id")?.initializer;
          const optionText = property(element, "text")?.initializer;
          if (!ts.isStringLiteral(id) || !ts.isStringLiteral(optionText)) {
            throw new Error(`Invalid option in question: ${text.text}`);
          }
          return { id: id.text, text: optionText.text };
        });

        result.push({
          seedIndex: result.length,
          subjectId: subject.text,
          questionText: text.text,
          options,
          correctOptionId: correct.text,
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(file);
  return result;
}

function keyOf(question) {
  return `${question.subjectId}\u0000${question.questionText}`;
}

function groupByKey(items) {
  const groups = new Map();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

const databaseUrl = loadDatabaseUrl();
const sql = neon(databaseUrl);
const desired = extractQuestions();
const current = await sql`
  SELECT id, subject_id AS "subjectId", question_text AS "questionText",
         options, correct_option_id AS "correctOptionId"
  FROM questions
  ORDER BY id
`;

const desiredGroups = groupByKey(desired);
const updates = [];
const problems = [];
const usedTargets = new Set();

function optionTextSignature(options) {
  return JSON.stringify(options.map((option) => option.text).sort());
}

for (const row of current) {
  const candidates = desiredGroups.get(keyOf(row)) ?? [];
  const currentSignature = optionTextSignature(row.options);
  const targetIndex = candidates.findIndex(
    (candidate) =>
      !usedTargets.has(candidate.seedIndex) &&
      optionTextSignature(candidate.options) === currentSignature,
  );

  if (targetIndex === -1) {
    problems.push(`no exact seed match: ${row.subjectId}: ${row.questionText}`);
    continue;
  }

  const target = candidates[targetIndex];
  usedTargets.add(target.seedIndex);
  updates.push({
    id: row.id,
    options: target.options,
    correctOptionId: target.correctOptionId,
  });
}

for (const question of desired) {
  const ids = question.options.map((option) => option.id);
  const texts = question.options.map((option) => option.text.trim());
  if (
    question.options.length !== 4 ||
    new Set(ids).size !== 4 ||
    new Set(texts).size !== 4 ||
    !ids.includes(question.correctOptionId)
  ) {
    problems.push(`invalid options: ${question.subjectId}: ${question.questionText}`);
  }
}

const currentKeys = new Set(current.map(keyOf));
const unusedTargets = desired.filter((question) => !usedTargets.has(question.seedIndex));
const duplicatesOfExisting = unusedTargets.filter((question) => currentKeys.has(keyOf(question)));
const insertCandidates = unusedTargets.filter((question) => !currentKeys.has(keyOf(question)));
const insertKeys = new Set();
const inserts = [];

for (const question of insertCandidates) {
  const key = keyOf(question);
  if (insertKeys.has(key)) {
    problems.push(`duplicate new question: ${question.subjectId}: ${question.questionText}`);
    continue;
  }
  insertKeys.add(key);
  inserts.push({
    subjectId: question.subjectId,
    questionText: question.questionText,
    options: question.options,
    correctOptionId: question.correctOptionId,
  });
}

const distribution = updates.reduce((counts, row) => {
  counts[row.correctOptionId] = (counts[row.correctOptionId] ?? 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    {
      mode: insertMissing ? "insert-missing" : applyChanges ? "apply" : "dry-run",
      seedQuestions: desired.length,
      databaseQuestions: current.length,
      matchedQuestions: updates.length,
      seedQuestionsNotInDatabase: desired.length - usedTargets.size,
      duplicatesSkipped: duplicatesOfExisting.length,
      uniqueQuestionsToInsert: inserts.length,
      distribution,
      problems,
    },
    null,
    2,
  ),
);

if (problems.length) {
  throw new Error("Database was not changed because question matching was not exact");
}

if (!applyChanges) {
  console.log("Dry run complete. Use --apply only after reviewing this report.");
  process.exit(0);
}

const backupDirectory = path.join(root, "work");
fs.mkdirSync(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDirectory, `questions-backup-${stamp}.json`);
fs.writeFileSync(backupPath, JSON.stringify(current, null, 2));

await sql`
  UPDATE questions AS question
  SET options = patch.options,
      correct_option_id = patch."correctOptionId"
  FROM jsonb_to_recordset(${JSON.stringify(updates)}::jsonb)
    AS patch(id text, options jsonb, "correctOptionId" text)
  WHERE question.id = patch.id
`;

if (insertMissing && inserts.length) {
  await sql`
    INSERT INTO questions (subject_id, question_text, options, correct_option_id)
    SELECT patch."subjectId", patch."questionText", patch.options, patch."correctOptionId"
    FROM jsonb_to_recordset(${JSON.stringify(inserts)}::jsonb)
      AS patch("subjectId" text, "questionText" text, options jsonb, "correctOptionId" text)
  `;
}

console.log(`Updated ${updates.length} questions.`);
if (insertMissing) console.log(`Inserted ${inserts.length} new questions.`);
console.log(`Backup saved to ${backupPath}`);
