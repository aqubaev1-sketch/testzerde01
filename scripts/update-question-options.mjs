import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { neon } from "@neondatabase/serverless";

const root = process.cwd();
const envPath = path.join(root, "_env");
const seedPath = path.join(root, "scripts", "seed.ts");
const applyChanges = process.argv.includes("--apply");

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
    (candidate, index) =>
      !usedTargets.has(`${keyOf(row)}\u0000${index}`) &&
      optionTextSignature(candidate.options) === currentSignature,
  );

  if (targetIndex === -1) {
    problems.push(`no exact seed match: ${row.subjectId}: ${row.questionText}`);
    continue;
  }

  const target = candidates[targetIndex];
  usedTargets.add(`${keyOf(row)}\u0000${targetIndex}`);
  updates.push({
    id: row.id,
    options: target.options,
    correctOptionId: target.correctOptionId,
  });
}

const distribution = updates.reduce((counts, row) => {
  counts[row.correctOptionId] = (counts[row.correctOptionId] ?? 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    {
      mode: applyChanges ? "apply" : "dry-run",
      seedQuestions: desired.length,
      databaseQuestions: current.length,
      matchedQuestions: updates.length,
      seedQuestionsNotInDatabase: desired.length - usedTargets.size,
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

console.log(`Updated ${updates.length} questions.`);
console.log(`Backup saved to ${backupPath}`);
