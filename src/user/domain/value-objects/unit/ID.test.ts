
import { randomUUID } from 'node:crypto'
import { DomainError } from '../../../../shared/errors/DomainError'
import { ID } from '../ID'

// Mock the randomUUID function to get predictable results
jest.mock('node:crypto', () => ({
  randomUUID: jest.fn()
}))

describe('ID', () => {
  const mockedRandomUUID = randomUUID as jest.Mock

  beforeEach(() => {
    // Reset mocks before each test
    mockedRandomUUID.mockClear()
  })

  it('should create a valid ID using the create method', () => {
    const testUUID = 'a1b2c3d4-1234-5678-abcd-1234567890ab'
    mockedRandomUUID.mockReturnValue(testUUID)

    const id = ID.create()

    expect(id).toBeInstanceOf(ID)
    expect(id.getValue()).toBe(testUUID)
    expect(mockedRandomUUID).toHaveBeenCalledTimes(1)
  })

  it('should create a valid ID from a string', () => {
    const validUUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    const id = ID.fromString(validUUID)
    expect(id).toBeInstanceOf(ID)
    expect(id.getValue()).toBe(validUUID)
  })

  it('should throw a DomainError for an invalid UUID format', () => {
    const invalidUUID = 'not-a-uuid'
    expect(() => ID.fromString(invalidUUID)).toThrow(DomainError)
    expect(() => ID.fromString(invalidUUID)).toThrow('Invalid UUID format')
  })

  it('should throw a DomainError for an empty value', () => {
    expect(() => ID.fromString('')).toThrow(DomainError)
    expect(() => ID.fromString('')).toThrow('ID must have a value')
  })

  it('should return its value with getValue', () => {
    const validUUID = 'e8a8b8e0-0b16-4d8f-9b1e-7e1b1a0e1b2a'
    const id = ID.fromString(validUUID)
    expect(id.getValue()).toBe(validUUID)
  })
})
