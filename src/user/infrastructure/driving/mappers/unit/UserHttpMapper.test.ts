
import { UserHttpMapper } from '../UserHttpMapper'
import { User } from '@user/domain/User'
import { ICreateUserHttpRequest } from '@user/infrastructure/driving/dtos/ICreateUserHttpRequest'

// Mock the User module and its static create method
jest.mock('@user/domain/User', () => ({
  User: {
    create: jest.fn(),
  },
}));

describe('UserHttpMapper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fromRequest', () => {
    it('should map ICreateUserHttpRequest to User.create arguments and return a User instance', () => {
      const mockToPrimitives = jest.fn().mockReturnValue({ id: 'mock-user-id' });
      const mockUserInstance = {
        toPrimitives: mockToPrimitives
      };
      (User.create as jest.Mock).mockReturnValue(mockUserInstance as any)

      const requestDto: ICreateUserHttpRequest = {
        name: 'John',
        lastname: 'Doe',
        age: 30,
        identificationNumber: '1234567890',
        identificationType: 'DNI'
      }

      const user = UserHttpMapper.fromRequest(requestDto)

      expect(User.create).toHaveBeenCalledTimes(1)
      expect(User.create).toHaveBeenCalledWith({
        name: requestDto.name,
        lastname: requestDto.lastname,
        age: requestDto.age,
        identificationNumber: requestDto.identificationNumber,
        identificationType: requestDto.identificationType
      })
      expect(user).toBe(mockUserInstance)
    })
  })

  describe('toResponse', () => {
    it('should map User to ICreateUserHttpResponse', () => {
      const mockUserId = 'test-user-id'
      const mockToPrimitives = jest.fn().mockReturnValue({ id: mockUserId });
      const mockUserInstance = {
        toPrimitives: mockToPrimitives
      }

      const responseDto = UserHttpMapper.toResponse(mockUserInstance as any)

      expect(mockUserInstance.toPrimitives).toHaveBeenCalledTimes(1)
      expect(responseDto).toEqual({
        id: mockUserId
      })
    })
  })
})
