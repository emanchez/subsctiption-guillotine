import { Result } from "@/lib/types/generics";

// Simple HttpError that carries an HTTP status code
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// Small helpers to create a consistent Result<T> shape for success/failure
export const createSuccess = <T>(value: T, status = 200): Result<T> => {
  const result: Result<T> = {
    success: true,
    value: value,
    status,
  };
  return result;
};

// Creates a failure Result with an error message and status.
export const createFailure = <T>(error: string, status = 500): Result<T> => {
  const result: Result<T> = {
    success: false,
    error: error,
    status,
  };
  return result;
};

// PROMISE HANDLER
// Usage: wrap any async operation with safeAsync(() => fetchStuff())
// Returns a typed Result<T> where callers can inspect `success`/`value`/`error` and `status`.
export const safeAsync = async <T>(
  fn: () => Promise<T>
): Promise<Result<T>> => {
  try {
    const result = await fn();
    return createSuccess(result, 200);
  } catch (error) {
    // If the thrown error is an HttpError, preserve its status
    if (error instanceof HttpError) {
      return createFailure<T>(error.message, error.status);
    }
    // TODO remove this section
    const msg = error instanceof Error ? error.message : String(error);
    // Fallback to 500
    return createFailure<T>(msg);
  }
};

// VALIDATORS
// check if type of input v matches predefined union type T[number]
export const isOneOf =
  <T extends readonly any[]>(list: T) =>
  // Returns a type guard fn: when it returns true, TS narrows v to T[number].
  (v: any): v is T[number] =>
    // Runtime membership check. Casts are necessary to satisfy the compiler.
    (list as readonly any[]).includes(v as any);
