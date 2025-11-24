import { randomUUID } from 'node:crypto'
import { DomainError } from '@shared/errors/DomainError'

export class ID {
  private constructor (private readonly value: string) {
    if (value === '') throw new DomainError('ID must have a value')
    if (!ID.isUUID(value)) throw new DomainError('Invalid UUID format')
  }

  public static create (): ID {
    return new ID(randomUUID())
  }

  public getValue (): string {
    return this.value
  }

  public static fromString (value: string): ID {
    return new ID(value)
  }

  private static isUUID (value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  }
}
