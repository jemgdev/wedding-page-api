
import { CreateUserSchema } from '../CreateUserSchema'

describe('CreateUserSchema', () => {
  const validUserData = {
    name: 'John',
    lastname: 'Doe',
    age: 25,
    identificationNumber: '12345678',
    identificationType: 'DNI'
  }

  it('should successfully parse valid user data', () => {
    const result = CreateUserSchema.safeParse(validUserData)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(validUserData)
  })

  describe('validation errors', () => {
    it('should return an error if name is missing', () => {
      const { name, ...data } = validUserData
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['name'])
    })

    it('should return an error if name is not a string', () => {
      const data = { ...validUserData, name: 123 }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['name'])
    })

    it('should return an error if lastname is missing', () => {
      const { lastname, ...data } = validUserData
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['lastname'])
    })

    it('should return an error if lastname is not a string', () => {
      const data = { ...validUserData, lastname: 123 }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['lastname'])
    })

    it('should return an error if age is missing', () => {
      const { age, ...data } = validUserData
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['age'])
    })

    it('should return an error if age is not a number', () => {
      const data = { ...validUserData, age: 'abc' }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['age'])
    })

    it('should return an error if age is less than 18', () => {
      const data = { ...validUserData, age: 17 }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['age'])
    })

    it('should return an error if age is greater than 120', () => {
      const data = { ...validUserData, age: 121 }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['age'])
    })

    it('should return an error if identificationNumber is missing', () => {
      const { identificationNumber, ...data } = validUserData
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['identificationNumber'])
    })

    it('should return an error if identificationNumber is not a string', () => {
      const data = { ...validUserData, identificationNumber: 123 }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['identificationNumber'])
    })

    it('should return an error if identificationNumber length is not 8 (less)', () => {
      const data = { ...validUserData, identificationNumber: '1234567' }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['identificationNumber'])
    })

    it('should return an error if identificationNumber length is not 8 (more)', () => {
      const data = { ...validUserData, identificationNumber: '123456789' }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['identificationNumber'])
    })

    it('should return an error if identificationType is missing', () => {
      const { identificationType, ...data } = validUserData
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['identificationType'])
    })

    it('should return an error if identificationType is not a string', () => {
      const data = { ...validUserData, identificationType: 123 }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['identificationType'])
    })
  })
})
