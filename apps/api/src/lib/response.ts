// Standard API response helpers

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
}

export function ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return { success: true, data, error: null, meta };
}

export function err(code: string, message: string, field?: string): ApiResponse<never> {
  return { success: false, data: null, error: { code, message, field } };
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DATE_RANGE_ERROR: 'DATE_RANGE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
