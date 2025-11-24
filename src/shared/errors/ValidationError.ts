import { BaseError } from './BaseError'

export class ValidationError extends BaseError {
  public readonly errors: Array<{ field: string, message: string }>

  constructor (errors: Array<{ field: string, message: string }>) {
    super('Validation failed', 400, true)
    this.errors = errors
  }
}
