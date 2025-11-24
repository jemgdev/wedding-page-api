export interface ILogger {
  info: (message: string, code: string, detail: string, meta?: Record<string, unknown>) => void
  warn: (message: string, code: string, detail: string, meta?: Record<string, unknown>) => void
  error: (message: string, code: string, detail: string, meta?: Record<string, unknown>) => void
}
