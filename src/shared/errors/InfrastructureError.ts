import { BaseError } from './BaseError'

export class InfrastructureError extends BaseError {
  constructor (message: string, statusCode: 500 | 503) {
    super(message, statusCode, true)
  }
}
