export type Result<T> =
  | { success: true; value: T; status: number }
  | { success: false; error: string; status: number };
