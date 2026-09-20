import { parse } from "yaml";

export const WORKFLOW = ".github/workflows/ci.yml";

// A gate is a step whose condition calls cancelled(), which a setup step never does.
const isGate = (step) =>
  typeof step?.run === "string" && String(step.if ?? "").includes("cancelled()");

export const readGates = (text, job = "checks") => {
  const steps = parse(text)?.jobs?.[job]?.steps;

  if (!Array.isArray(steps)) throw new Error(`${WORKFLOW} has no "${job}" job`);

  const gates = steps
    .filter(isGate)
    .map(({ name, run }) => ({ name: name ?? run, run: run.trim() }));

  if (gates.length === 0) {
    throw new Error(`${WORKFLOW} declares no gates in "${job}", so the marker must have changed`);
  }

  return gates;
};
