/**
 * Production-grade logging system.
 * Centralizes error reporting and provides structured logs
 * for all critical flows.
 */

type LogLevel = "info" | "warn" | "error" | "critical";

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

// In-memory log buffer for diagnostics panel
const LOG_BUFFER_MAX = 200;
const logBuffer: LogEntry[] = [];

function createEntry(level: LogLevel, context: string, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    level,
    context,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

function pushToBuffer(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_MAX) {
    logBuffer.shift();
  }
}

export const logger = {
  info(context: string, message: string, data?: Record<string, unknown>) {
    const entry = createEntry("info", context, message, data);
    pushToBuffer(entry);
    if (import.meta.env.DEV) {
      console.info(`[${context}]`, message, data ?? "");
    }
  },

  warn(context: string, message: string, data?: Record<string, unknown>) {
    const entry = createEntry("warn", context, message, data);
    pushToBuffer(entry);
    console.warn(`[${context}]`, message, data ?? "");
  },

  error(context: string, message: string, data?: Record<string, unknown>) {
    const entry = createEntry("error", context, message, data);
    pushToBuffer(entry);
    console.error(`[${context}]`, message, data ?? "");
  },

  critical(context: string, message: string, data?: Record<string, unknown>) {
    const entry = createEntry("critical", context, message, data);
    pushToBuffer(entry);
    console.error(`[CRITICAL FLOW FAILURE] [${context}]`, message, data ?? "");
  },

  /** Get recent log entries for diagnostics */
  getRecentLogs(count = 50): LogEntry[] {
    return logBuffer.slice(-count);
  },

  /** Get logs filtered by level */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return logBuffer.filter(e => e.level === level);
  },

  /** Clear log buffer */
  clear() {
    logBuffer.length = 0;
  },
};
