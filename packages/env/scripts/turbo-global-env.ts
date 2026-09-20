import { ENV_SCHEMAS } from "../src/schemas";

type TurboConfig = Readonly<Record<string, unknown>>;

export const GLOBAL_ENV_KEY = "globalEnv";

export type GlobalEnvCheckResult =
  | { readonly kind: "key-not-found" }
  | { readonly kind: "missing-variables"; readonly missing: readonly string[] }
  | { readonly kind: "ok" };

export const declaredVariableNames = (): string[] =>
  ENV_SCHEMAS.flatMap(({ shape }) => Object.keys(shape));

// Turborepo patterns: `*` matches any run of characters and `\*` is a literal asterisk.
const matches = (pattern: string, name: string): boolean => {
  const parts = pattern.split(String.raw`\*`).map((part) => {
    const escaped = part.replaceAll(/[.+?^${}()|[\]\\]/gu, String.raw`\$&`);

    return escaped.replaceAll("*", ".*");
  });

  return new RegExp(`^${parts.join(String.raw`\*`)}$`, "u").test(name);
};

const stringsIn = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

/*
 * All four lists: calling a secret undeclared because it sits in a pass-through list would
 * push it into every task hash, which is the one place it must not be.
 */
const coveringPatterns = (config: TurboConfig): string[] => {
  const tasks = (config.tasks ?? {}) as Readonly<Record<string, TurboConfig>>;
  const perTask = Object.values(tasks).flatMap((task) => [
    ...stringsIn(task.env),
    ...stringsIn(task.passThroughEnv),
  ]);

  return [
    ...stringsIn(config[GLOBAL_ENV_KEY]),
    ...stringsIn(config.globalPassThroughEnv),
    ...perTask,
  ];
};

export const checkGlobalEnv = (
  turboConfig: unknown,
  declared: readonly string[],
): GlobalEnvCheckResult => {
  const config = turboConfig as TurboConfig;

  if (!Array.isArray(config[GLOBAL_ENV_KEY])) return { kind: "key-not-found" };

  const patterns = coveringPatterns(config);
  const included = patterns.filter((pattern) => !pattern.startsWith("!"));
  const excluded = patterns.filter((pattern) => pattern.startsWith("!"));
  const isCovered = (name: string): boolean =>
    included.some((pattern) => matches(pattern, name)) &&
    !excluded.some((pattern) => matches(pattern.slice(1), name));
  const missing = declared.filter((name) => !isCovered(name));

  return missing.length > 0 ? { kind: "missing-variables", missing } : { kind: "ok" };
};
