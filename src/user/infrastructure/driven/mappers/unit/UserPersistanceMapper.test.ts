
import { UserPersistanceMapper } from '../UserPersistanceMapper'
import { User } from '../../../../domain/User'
import { IUserPersistance } from '../../dtos/IUserPersistance'
// Mock the User module
jest.mock('@user/domain/User', () => ({
  User: {
    fromPrimitives: jest.fn(),
  },
}));

describe('UserPersistanceMapper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('toDomain', () => {
    it('should map IUserPersistance to User.fromPrimitives arguments and return a User instance', () => {
      const mockUserInstance = {
        toPrimitives: jest.fn(),
      } as unknown as User; // Explicitly cast to User type

      (User.fromPrimitives as jest.Mock).mockReturnValue(mockUserInstance);

      const rawUser: IUserPersistance = {
        id: 'persistance-id',
        name: 'Jane',
        last_name: 'Doe',
        age: 28,
        identification_number: '0987654321',
        identification_type: 'Passport'
      }

      const user = UserPersistanceMapper.toDomain(rawUser)

      expect(User.fromPrimitives).toHaveBeenCalledTimes(1)
      expect(User.fromPrimitives).toHaveBeenCalledWith({
        id: rawUser.id,
        name: rawUser.name,
        lastname: rawUser.last_name,
        age: rawUser.age,
        identificationNumber: rawUser.identification_number,
        identificationType: rawUser.identification_type
      })
      expect(user).toBe(mockUserInstance)
    })
  })

  describe('toPersistence', () => {
    it('should map User to IUserPersistance', () => {
      const mockUserPrimitives = {
        id: 'user-id',
        name: 'John',
        lastname: 'Doe',
        age: 30,
        identificationNumber: '1234567890',
        identificationType: 'DNI'
      }
      const mockUserInstance = {
        toPrimitives: jest.fn().mockReturnValue(mockUserPrimitives)
      } as unknown as User; // Explicitly cast to User type

      const persistanceDto = UserPersistanceMapper.toPersistence(mockUserInstance)

      expect(mockUserInstance.toPrimitives).toHaveBeenCalledTimes(1)
      expect(persistanceDto).toEqual({
        id: mockUserPrimitives.id,
        name: mockUserPrimitives.name,
        last_name: mockUserPrimitives.lastname,
        age: mockUserPrimitives.age,
        identification_number: mockUserPrimitives.identificationNumber,
        identification_type: mockUserPrimitives.identificationType
      })
    })
  })
})
