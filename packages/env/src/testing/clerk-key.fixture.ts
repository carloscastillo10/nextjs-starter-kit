/*
 * Builds a well-formed key at run time, so no string shaped like a real key is ever
 * committed and the repository's secret scan stays empty.
 */
export const fakeClerkKey = (kind: "pk" | "sk"): string => `${kind}_test_${"x".repeat(12)}`;
