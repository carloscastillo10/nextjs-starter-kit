import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { formatReminders, remindersFor } from "./skill-rules.mjs";

const readPayload = async () => {
  const chunks = [];

  for await (const chunk of process.stdin) chunks.push(chunk);

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return undefined;
  }
};

const isInside = (directory, file) => {
  const relative = path.relative(directory, file);

  return relative !== "" && !path.isAbsolute(relative) && relative.split(path.sep)[0] !== "..";
};

/*
 * The nearest folder holding a .git entry, not the project folder: a worktree nested
 * inside the project is a checkout of its own, and its paths start at its own root.
 */
const checkoutRoot = (directory) => {
  if (existsSync(path.join(directory, ".git"))) return directory;

  const parent = path.dirname(directory);

  return parent === directory ? undefined : checkoutRoot(parent);
};

/*
 * Once per session and per reminder: repeated on every edit, the same paragraphs
 * become noise, and a noisy hook is one people switch off.
 */
const unseen = (session, reminders) => {
  const seen = path.join(os.tmpdir(), "claude-skill-reminders", session);
  const fresh = reminders.filter(({ key }) => !existsSync(path.join(seen, key)));

  if (fresh.length > 0) mkdirSync(seen, { recursive: true });

  for (const { key } of fresh) writeFileSync(path.join(seen, key), "");

  return fresh;
};

const reminderContext = (payload) => {
  const filePath = payload?.tool_input?.file_path;

  if (typeof filePath !== "string") return undefined;

  const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
  const file = path.resolve(cwd, filePath);
  const project = process.env.CLAUDE_PROJECT_DIR || cwd;
  const root = isInside(project, file) ? checkoutRoot(path.dirname(file)) : undefined;

  if (root === undefined) return undefined;

  const relative = path.relative(root, file).split(path.sep).join("/");
  const session = String(payload.session_id ?? "no-session").replaceAll(/[^\w-]/gu, "_");
  const fresh = unseen(session, remindersFor(relative));

  return fresh.length > 0 ? formatReminders(relative, fresh) : undefined;
};

const additionalContext = reminderContext(await readPayload());

if (additionalContext !== undefined) {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext } }),
  );
}
