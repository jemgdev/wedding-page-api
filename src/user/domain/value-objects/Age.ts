import { DomainError } from '@shared/errors/DomainError'

export class Age {
  private constructor (private readonly value: number) {
    if (value <= 0) throw new DomainError('Age must be positive')
    if (value > 120) throw new DomainError('Age seems unrealistic')
  }

  public static create (value: number): Age {
    return new Age(value)
  }

  public getValue (): number {
    return this.value
  }

  public isAdult (): boolean {
    return this.value >= 18
  }
}
