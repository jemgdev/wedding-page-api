import { Loggerfy } from 'loggerfy'
import { ILogger } from './ILogger'

const loggerfy = new Loggerfy()

export class Logger implements ILogger {
  info (message: string, code: string, detail: string, meta?: Record<string, unknown>): void {
    loggerfy
      .info()
      .setCode(code)
      .setDetail(detail)
      .setMessage(message)
      .setMetadata(meta ?? {})
      .write()
  }

  warn (message: string, code: string, detail: string, meta?: Record<string, unknown>): void {
    loggerfy
      .warn()
      .setCode(code)
      .setDetail(detail)
      .setMessage(message)
      .setMetadata(meta ?? {})
      .write()
  }

  error (message: string, code: string, detail: string, meta?: Record<string, unknown>): void {
    loggerfy
      .error()
      .setCode(code)
      .setDetail(detail)
      .setMessage(message)
      .setMetadata(meta ?? {})
      .write()
  }
}
