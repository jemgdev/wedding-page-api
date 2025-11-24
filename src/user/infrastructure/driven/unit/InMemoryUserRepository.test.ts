import { InMemoryUserRepository } from '../InMemoryUserRepository'
import { UserPersistanceMapper } from '../mappers/UserPersistanceMapper'
import { User } from '@user/domain/User'
import { InfrastructureError } from '@shared/errors/InfrastructureError'
import { randomUUID } from 'crypto'
import { IUserPersistance } from '@user/infrastructure/driven/dtos/IUserPersistance'

// Mock external dependencies
jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}))
jest.mock('../mappers/UserPersistanceMapper')
jest.mock('@user/domain/User')

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository
  const mockRandomUUID = randomUUID as jest.Mock
  const mockUserPersistanceMapperToPersistence = UserPersistanceMapper.toPersistence as jest.Mock
  const mockUserPersistanceMapperToDomain = UserPersistanceMapper.toDomain as jest.Mock

  // Define consistent initial user data for constructor
  const INITIAL_USER_ID = 'initial-user-id-from-mock'
  const INITIAL_USER_NAME = 'Jhon'
  const INITIAL_USER_LASTNAME = 'Freddy'
  const INITIAL_USER_AGE = 10
  const INITIAL_USER_IDENTIFICATION_NUMBER = '123456789012'
  const INITIAL_USER_IDENTIFICATION_TYPE = 'DNI'

  const initialMockUserPrimitives = {
    id: INITIAL_USER_ID,
    name: INITIAL_USER_NAME,
    lastname: INITIAL_USER_LASTNAME,
    age: INITIAL_USER_AGE,
    identificationNumber: INITIAL_USER_IDENTIFICATION_NUMBER,
    identificationType: INITIAL_USER_IDENTIFICATION_TYPE
  }

  const initialMockUserInstance = {
    toPrimitives: jest.fn().mockReturnValue(initialMockUserPrimitives)
  } as unknown as User

  const initialMockPersistanceUser: IUserPersistance = {
    id: INITIAL_USER_ID,
    name: INITIAL_USER_NAME,
    last_name: INITIAL_USER_LASTNAME,
    age: INITIAL_USER_AGE,
    identification_number: INITIAL_USER_IDENTIFICATION_NUMBER,
    identification_type: INITIAL_USER_IDENTIFICATION_TYPE
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockRandomUUID.mockReturnValue(INITIAL_USER_ID)

    // Mock mappers to return the initial user for the constructor's pre-population
    mockUserPersistanceMapperToPersistence.mockReturnValue(initialMockPersistanceUser)
    mockUserPersistanceMapperToDomain.mockReturnValue(initialMockUserInstance)

    // Manually clear the internal map for each test to ensure isolation
    // @ts-ignore - Accessing private property for testing purposes
    InMemoryUserRepository.prototype.users = new Map<string, IUserPersistance>()

    repository = new InMemoryUserRepository()
  })

  describe('constructor', () => {
    it('should initialize with a default user', async () => {
      const users = await repository.findAll()
      expect(users.length).toBe(1)
      expect(users[0].toPrimitives().id).toBe(INITIAL_USER_ID)
      expect(mockUserPersistanceMapperToDomain).toHaveBeenCalledWith(initialMockPersistanceUser)
    })
  })

  describe('save', () => {
    it('should save a new user', async () => {
      const newUserPrimitives = { id: 'new-user-id' }
      const newUser = {
        toPrimitives: jest.fn().mockReturnValue(newUserPrimitives)
      } as unknown as User

      const savedId = await repository.save(newUser)

      expect(newUser.toPrimitives).toHaveBeenCalledTimes(2) // Corrected call count
      expect(mockUserPersistanceMapperToPersistence).toHaveBeenCalledTimes(1)
      expect(mockUserPersistanceMapperToPersistence).toHaveBeenCalledWith(newUser)
      expect(savedId).toBe('new-user-id')
    })

    it('should update an existing user', async () => {
      const existingUserPrimitives = { id: INITIAL_USER_ID }
      const existingUser = {
        toPrimitives: jest.fn().mockReturnValue(existingUserPrimitives)
      } as unknown as User

      const updatedId = await repository.save(existingUser)

      expect(existingUser.toPrimitives).toHaveBeenCalledTimes(2) // Corrected call count
      expect(mockUserPersistanceMapperToPersistence).toHaveBeenCalledTimes(1)
      expect(mockUserPersistanceMapperToPersistence).toHaveBeenCalledWith(existingUser)
      expect(updatedId).toBe(INITIAL_USER_ID)
    })

    it('should throw InfrastructureError if toPersistence fails', async () => {
      mockUserPersistanceMapperToPersistence.mockImplementation(() => {
        throw new Error('Mapper error')
      })
      const newUser = {
        toPrimitives: jest.fn().mockReturnValue({ id: 'new-user-id' })
      } as unknown as User

      await expect(repository.save(newUser)).rejects.toThrow(InfrastructureError)
      await expect(repository.save(newUser)).rejects.toThrow('Mapper error')
    })
  })

  describe('findById', () => {
    it('should return a user if found', async () => {
      const foundUser = await repository.findById(INITIAL_USER_ID)
      expect(foundUser).toBe(initialMockUserInstance)
      expect(mockUserPersistanceMapperToDomain).toHaveBeenCalledTimes(1)
      expect(mockUserPersistanceMapperToDomain).toHaveBeenCalledWith(initialMockPersistanceUser)
    })

    it('should return null if user is not found', async () => {
      const foundUser = await repository.findById('non-existent-id')
      expect(foundUser).toBeNull()
      expect(mockUserPersistanceMapperToDomain).not.toHaveBeenCalled()
    })

    it('should throw InfrastructureError if toDomain fails', async () => {
      mockUserPersistanceMapperToDomain.mockImplementation(() => {
        throw new Error('Domain mapper error')
      })

      await expect(repository.findById(INITIAL_USER_ID)).rejects.toThrow(InfrastructureError)
      await expect(repository.findById(INITIAL_USER_ID)).rejects.toThrow('Domain mapper error')
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      // The repository is initialized with one user in beforeEach.

      // Define the second user's data
      const anotherUserPrimitives = { id: 'another-user-id', name: 'Another', lastname: 'One', age: 40, identificationNumber: '9876543210', identificationType: 'Passport' }
      const anotherUser = {
        toPrimitives: jest.fn().mockReturnValue(anotherUserPrimitives)
      } as unknown as User

      const anotherMockPersistanceUser: IUserPersistance = {
        id: 'another-user-id',
        name: 'Another',
        last_name: 'One',
        age: 40,
        identification_number: '9876543210',
        identification_type: 'Passport'
      }

      // Mock toPersistence for the second user when it's saved
      mockUserPersistanceMapperToPersistence.mockImplementationOnce((user: User) => {
        // This implementation will be used for the next call to toPersistence
        // It should return the correct persistance object based on the user passed in.
        // For this test, we know it's `anotherUser`, so we return `anotherMockPersistanceUser`.
        return anotherMockPersistanceUser;
      });

      await repository.save(anotherUser) // This will add the second user

      // Mock toDomain for the users when findAll is called
      const anotherMockUserInstance = {
        toPrimitives: jest.fn().mockReturnValue(anotherUserPrimitives)
      } as unknown as User

      // The beforeEach sets mockUserPersistanceMapperToDomain.mockReturnValue(initialMockUserInstance)
      // We need to ensure the correct return values for findAll.
      // The first call to toDomain will be for the initial user (from constructor)
      // The second call to toDomain will be for the anotherUser (from save)
      mockUserPersistanceMapperToDomain.mockReturnValueOnce(initialMockUserInstance) // For the initial user
      mockUserPersistanceMapperToDomain.mockReturnValueOnce(anotherMockUserInstance) // For the second user

      const users = await repository.findAll()

      expect(users.length).toBe(2)
      expect(users[0]).toBe(initialMockUserInstance)
      expect(users[1]).toBe(anotherMockUserInstance)
      expect(mockUserPersistanceMapperToDomain).toHaveBeenCalledTimes(2)
      expect(mockUserPersistanceMapperToDomain).toHaveBeenCalledWith(initialMockPersistanceUser)
      expect(mockUserPersistanceMapperToDomain).toHaveBeenCalledWith(anotherMockPersistanceUser)
    })

    it('should return an empty array if no users', async () => {
      // Clear the map initialized by the constructor for this specific test
      // @ts-ignore
      repository.users.clear()

      const users = await repository.findAll()
      expect(users).toEqual([])
      expect(mockUserPersistanceMapperToDomain).not.toHaveBeenCalled()
    })

    it('should throw InfrastructureError if toDomain fails for any user', async () => {
      mockUserPersistanceMapperToDomain.mockImplementation(() => {
        throw new Error('Domain mapper error on findAll')
      })

      await expect(repository.findAll()).rejects.toThrow(InfrastructureError)
      await expect(repository.findAll()).rejects.toThrow('Domain mapper error on findAll')
    })
  })
})