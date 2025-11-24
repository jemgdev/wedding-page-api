
import { DomainError } from '../../../../shared/errors/DomainError'
import { Age } from '../Age'

describe('Age', () => {
  it('should create a valid Age object', () => {
    const ageValue = 25
    const age = Age.create(ageValue)
    expect(age).toBeInstanceOf(Age)
    expect(age.getValue()).toBe(ageValue)
  })

  it('should return true for an adult age', () => {
    const age = Age.create(18)
    expect(age.isAdult()).toBe(true)
  })

  it('should return false for a non-adult age', () => {
    const age = Age.create(17)
    expect(age.isAdult()).toBe(false)
  })

  it('should throw a DomainError for a non-positive age', () => {
    expect(() => Age.create(0)).toThrow(DomainError)
    expect(() => Age.create(-1)).toThrow(DomainError)
  })

  it('should throw a DomainError for an unrealistic age', () => {
    expect(() => Age.create(121)).toThrow(DomainError)
  })

  it('should throw a specific error message for non-positive age', () => {
    expect(() => Age.create(0)).toThrow('Age must be positive')
  })

  it('should throw a specific error message for unrealistic age', () => {
    expect(() => Age.create(121)).toThrow('Age seems unrealistic')
  })
})
