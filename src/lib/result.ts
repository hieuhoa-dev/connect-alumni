/**
 * Standard Result<T> type for mutation outputs and domain operations.
 * Unifies successful outcomes and domain failures with structured error codes.
 */
export type Result<T, E = string> =
  | {
      success: true;
      data: T;
      error?: never;
      code?: never;
    }
  | {
      success: false;
      data?: never;
      error: E;
      code?: string;
    };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function fail<T = never>(arg1: string, arg2?: string): Result<T> {
  // If arg2 looks like an error message and arg1 looks like an UPPERCASE_CODE, swap them
  if (arg2 && /^[A-Z_]+$/.test(arg1) && !/^[A-Z_]+$/.test(arg2)) {
    return { success: false, error: arg2, code: arg1 };
  }
  return { success: false, error: arg1, code: arg2 };
}
