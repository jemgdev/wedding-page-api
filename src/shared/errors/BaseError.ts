export abstract class BaseError extends Error {
  public readonly name: string
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor (message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}
