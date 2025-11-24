
import { DomainError } from '../../../../shared/errors/DomainError'
import { IdentificationNumber } from '../IdentificationNumber'

describe('IdentificationNumber', () => {
  it('should create a valid IdentificationNumber object', () => {
    const validNumber = '123456789'
    const idNumber = IdentificationNumber.create(validNumber)
    expect(idNumber).toBeInstanceOf(IdentificationNumber)
    expect(idNumber.getValue()).toBe(validNumber)
  })

  it('should throw a DomainError if the length is 8 or less', () => {
    const invalidNumberShort = '1234567'
    const invalidNumberEqual = '12345678'

    expect(() => IdentificationNumber.create(invalidNumberShort)).toThrow(DomainError)
    expect(() => IdentificationNumber.create(invalidNumberShort)).toThrow(
      'Invalid identification number format'
    )

    expect(() => IdentificationNumber.create(invalidNumberEqual)).toThrow(DomainError)
    expect(() => IdentificationNumber.create(invalidNumberEqual)).toThrow(
      'Invalid identification number format'
    )
  })

  it('should return its value with getValue', () => {
    const validNumber = 'ABC-12345'
    const idNumber = IdentificationNumber.create(validNumber)
    expect(idNumber.getValue()).toBe(validNumber)
  })
})
