/**
 * Production-grade API helpers.
 * Provides retry logic, timeout handling, and typed error responses.
 */

import { logger } from "./logger";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly context: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  context?: string;
}

/**
 * Fetch with retry, timeout, and structured error logging.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: RetryOptions = {},
): Promise<Response> {
  const {
    maxRetries = 2,
    baseDelayMs = 1000,
    timeoutMs = 15000,
    context = "API",
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok && response.status >= 500 && attempt < maxRetries) {
        logger.warn(context, `Server error ${response.status}, retrying (${attempt + 1}/${maxRetries})`, {
          url,
          status: response.status,
        });
        await sleep(baseDelayMs * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (lastError.name === "AbortError") {
        logger.error(context, `Request timed out after ${timeoutMs}ms`, { url });
        throw new ApiError(`Request timed out`, 408, context);
      }

      if (attempt < maxRetries) {
        logger.warn(context, `Network error, retrying (${attempt + 1}/${maxRetries})`, {
          url,
          error: lastError.message,
        });
        await sleep(baseDelayMs * Math.pow(2, attempt));
        continue;
      }
    }
  }

  logger.error(context, `All ${maxRetries + 1} attempts failed`, {
    url,
    error: lastError?.message,
  });
  throw lastError || new Error("Fetch failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate that a Supabase response has data and no error.
 */
export function validateSupabaseResponse<T>(
  result: { data: T | null; error: { message: string; code?: string } | null },
  context: string,
): T {
  if (result.error) {
    logger.error(context, `Supabase error: ${result.error.message}`, {
      code: result.error.code,
    });
    throw new ApiError(result.error.message, 500, context);
  }
  if (result.data === null || result.data === undefined) {
    logger.warn(context, "Supabase returned null data");
  }
  return result.data as T;
}
