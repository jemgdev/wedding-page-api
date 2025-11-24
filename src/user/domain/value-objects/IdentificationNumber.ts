import { DomainError } from '@shared/errors/DomainError'

export class IdentificationNumber {
  private constructor (private readonly value: string) {
    if (value.length <= 8) {
      throw new DomainError('Invalid identification number format')
    }
  }

  public static create (value: string): IdentificationNumber {
    return new IdentificationNumber(value)
  }

  public getValue (): string {
    return this.value
  }
}
