
import { User } from '../User'
import { Age } from '../value-objects/Age'
import { ID } from '../value-objects/ID'
import { IdentificationNumber } from '../value-objects/IdentificationNumber'
import { DomainError } from '@shared/errors/DomainError'

// Mock the value objects
jest.mock('../value-objects/Age')
jest.mock('../value-objects/ID')
jest.mock('../value-objects/IdentificationNumber')

describe('User', () => {
  const mockAgeCreate = Age.create as jest.Mock
  const mockAgeGetValue = jest.fn()
  const mockIDCreate = ID.create as jest.Mock
  const mockIDFromString = ID.fromString as jest.Mock
  const mockIDGetValue = jest.fn()
  const mockIdentificationNumberCreate = IdentificationNumber.create as jest.Mock
  const mockIdentificationNumberGetValue = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations for successful scenarios
    mockAgeGetValue.mockReturnValue(25)
    mockAgeCreate.mockReturnValue({
      getValue: mockAgeGetValue
    })

    mockIDGetValue.mockReturnValue('mock-uuid')
    mockIDCreate.mockReturnValue({
      getValue: mockIDGetValue
    })
    mockIDFromString.mockReturnValue({
      getValue: mockIDGetValue
    })

    mockIdentificationNumberGetValue.mockReturnValue('1234567890')
    mockIdentificationNumberCreate.mockReturnValue({
      getValue: mockIdentificationNumberGetValue
    })
  })

  const validUserProps = {
    name: 'John',
    lastname: 'Doe',
    age: 25,
    identificationNumber: '1234567890',
    identificationType: 'DNI'
  }

  const validUserPrimitives = {
    id: 'mock-uuid',
    name: 'Jane',
    lastname: 'Doe',
    age: 30,
    identificationNumber: '0987654321',
    identificationType: 'Passport'
  }

  describe('create', () => {
    it('should create a User instance with valid properties', () => {
      const user = User.create(validUserProps)

      expect(user).toBeInstanceOf(User)
      expect(mockIDCreate).toHaveBeenCalledTimes(1)
      expect(mockAgeCreate).toHaveBeenCalledWith(validUserProps.age)
      expect(mockIdentificationNumberCreate).toHaveBeenCalledWith(
        validUserProps.identificationNumber
      )
    })

    it('should throw DomainError if Age.create throws an error', () => {
      mockAgeCreate.mockImplementation(() => {
        throw new DomainError('Invalid age')
      })

      expect(() => User.create(validUserProps)).toThrow(DomainError)
      expect(() => User.create(validUserProps)).toThrow('Invalid age')
    })

    it('should throw DomainError if IdentificationNumber.create throws an error', () => {
      mockIdentificationNumberCreate.mockImplementation(() => {
        throw new DomainError('Invalid ID number')
      })

      expect(() => User.create(validUserProps)).toThrow(DomainError)
      expect(() => User.create(validUserProps)).toThrow('Invalid ID number')
    })
  })

  describe('fromPrimitives', () => {
    it('should reconstruct a User instance from valid primitive data', () => {
      const user = User.fromPrimitives(validUserPrimitives)

      expect(user).toBeInstanceOf(User)
      expect(mockIDFromString).toHaveBeenCalledWith(validUserPrimitives.id)
      expect(mockAgeCreate).toHaveBeenCalledWith(validUserPrimitives.age)
      expect(mockIdentificationNumberCreate).toHaveBeenCalledWith(
        validUserPrimitives.identificationNumber
      )
    })

    it('should throw DomainError if ID.fromString throws an error', () => {
      mockIDFromString.mockImplementation(() => {
        throw new DomainError('Invalid ID')
      })

      expect(() => User.fromPrimitives(validUserPrimitives)).toThrow(DomainError)
      expect(() => User.fromPrimitives(validUserPrimitives)).toThrow('Invalid ID')
    })

    it('should throw DomainError if Age.create throws an error', () => {
      mockAgeCreate.mockImplementation(() => {
        throw new DomainError('Invalid age')
      })

      expect(() => User.fromPrimitives(validUserPrimitives)).toThrow(DomainError)
      expect(() => User.fromPrimitives(validUserPrimitives)).toThrow('Invalid age')
    })

    it('should throw DomainError if IdentificationNumber.create throws an error', () => {
      mockIdentificationNumberCreate.mockImplementation(() => {
        throw new DomainError('Invalid ID number')
      })

      expect(() => User.fromPrimitives(validUserPrimitives)).toThrow(DomainError)
      expect(() => User.fromPrimitives(validUserPrimitives)).toThrow('Invalid ID number')
    })
  })

  describe('toPrimitives', () => {
    it('should return a plain object with all user properties in primitive form', () => {
      const user = User.create(validUserProps)
      const primitives = user.toPrimitives()

      expect(primitives).toEqual({
        id: 'mock-uuid',
        name: validUserProps.name,
        lastname: validUserProps.lastname,
        age: validUserProps.age,
        identificationNumber: validUserProps.identificationNumber,
        identificationType: validUserProps.identificationType
      })
      expect(mockIDGetValue).toHaveBeenCalledTimes(1)
      expect(mockAgeGetValue).toHaveBeenCalledTimes(1)
      expect(mockIdentificationNumberGetValue).toHaveBeenCalledTimes(1)
    })
  })
})
