import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const SEARCH_TOOLS = new Set(["Glob", "Grep"]);

/*
 * A search program in command position only: at the start, after a separator, a pipe or an
 * opening parenthesis, or handed to xargs. A flag such as --grep does not count.
 */
const SEARCH_COMMAND = /(?:^|[;&|(]|\bxargs)\s*(?:git\s+grep|[ef]?grep|rg|find|fd|ack|ag)(?=\s|$)/u;

const HINT = [
  "A code graph of this repository is in .graphify/, rebuilt after each commit, branch checkout, merge and rebase.",
  "Before searching the files, read .graphify/GRAPH_REPORT.md for the most connected symbols and the communities,",
  'or ask the graph: `graphify query "<question>"`, `graphify path "<from>" "<to>"`, `graphify explain "<symbol>"`.',
  "The graph holds the code and the git history, not the Markdown docs: search those as usual.",
  "This note appears once per session.",
].join(" ");

const readPayload = async () => {
  const chunks = [];

  for await (const chunk of process.stdin) chunks.push(chunk);

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return undefined;
  }
};

const isSearch = (payload) => {
  const tool = payload?.tool_name;
  const command = payload?.tool_input?.command;

  return (
    SEARCH_TOOLS.has(tool) ||
    (tool === "Bash" && typeof command === "string" && SEARCH_COMMAND.test(command))
  );
};

// The nearest folder holding a .git entry: a nested worktree has a graph of its own.
const checkoutRoot = (directory) => {
  if (existsSync(path.join(directory, ".git"))) return directory;

  const parent = path.dirname(directory);

  return parent === directory ? undefined : checkoutRoot(parent);
};

// Once per session: a hook that repeats itself on every search is one people switch off.
const isFirstInSession = (session) => {
  const marker = path.join(os.tmpdir(), "claude-graph-hint", session);

  if (existsSync(marker)) return false;

  mkdirSync(path.dirname(marker), { recursive: true });
  writeFileSync(marker, "");

  return true;
};

const hintFor = (payload) => {
  if (!isSearch(payload)) return undefined;

  const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
  const root = checkoutRoot(path.resolve(cwd));
  const hasGraph =
    root !== undefined && existsSync(path.join(root, ".graphify", "GRAPH_REPORT.md"));
  const session = String(payload.session_id ?? "no-session").replaceAll(/[^\w-]/gu, "_");

  return hasGraph && isFirstInSession(session) ? HINT : undefined;
};

const additionalContext = hintFor(await readPayload());

if (additionalContext !== undefined) {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext } }),
  );
}
