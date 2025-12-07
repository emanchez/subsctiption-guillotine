// TODO: make a static class with these functions

// type checkers as functions (to avoid having to use
// `if (typeof v === "T") return true` everywhere)

export const isString = (v: unknown): v is string => {
  return typeof v === "string";
};

export const isNumber = (v: unknown): v is number => {
  return typeof v === "number";
};

export const isBoolean = (v: unknown): v is boolean => {
  return typeof v === "boolean";
};

// type checkers for literal/union types
// check if type of input v matches predefined union type T[number]
export const isOneOf =
  <T extends readonly any[]>(list: T) =>
  // Returns a type guard function: when it returns true, TS narrows v to T[number].
  (v: any): v is T[number] =>
    // Runtime membership check. Casts are necessary to satisfy the compiler.
    (list as readonly any[]).includes(v as any);
