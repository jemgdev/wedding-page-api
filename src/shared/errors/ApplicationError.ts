import { BaseError } from './BaseError'

export class ApplicationError extends BaseError {
  constructor (message: string) {
    super(message, 422, true)
  }
}
