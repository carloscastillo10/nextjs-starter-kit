export const snapshotEnv = (): NodeJS.ProcessEnv => ({ ...process.env });

/*
 * Restores key by key rather than reassigning `process.env`: a wholesale assignment detaches
 * it from the native store that `process.loadEnvFile` writes to, and a later call in the same
 * process then silently stops adding variables.
 */
export const restoreEnv = (snapshot: NodeJS.ProcessEnv): void => {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) Reflect.deleteProperty(process.env, key);
  }

  Object.assign(process.env, snapshot);
};
