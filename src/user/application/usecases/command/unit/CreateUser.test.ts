
import { CreateUser } from '../CreateUser'
import { UserPersistanceRepository } from '@user/ports/UserPersistanceRepository'
import { ILogger } from '@shared/libraries/logger/ILogger'
import { User } from '@user/domain/User'

describe('CreateUser', () => {
  let userRepository: jest.Mocked<UserPersistanceRepository>
  let logger: jest.Mocked<ILogger>
  let createUser: CreateUser
  let mockUser: jest.Mocked<User>

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    }
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }
    createUser = new CreateUser(userRepository, logger)

    mockUser = {
      toPrimitives: jest.fn().mockReturnValue({
        id: 'mock-user-id',
        name: 'Test',
        lastname: 'User',
        age: 25,
        identificationNumber: '1234567890',
        identificationType: 'DNI'
      })
    } as unknown as jest.Mocked<User>
  })

  describe('execute', () => {
    it('should save the user and return the userId', async () => {
      const expectedUserId = 'new-user-id'
      userRepository.save.mockResolvedValue(expectedUserId)

      const result = await createUser.execute(mockUser)

      expect(mockUser.toPrimitives).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledTimes(2)
      expect(logger.info).toHaveBeenCalledWith(
        'User data to save',
        'CREATE_USER',
        'User data to save',
        { userData: mockUser.toPrimitives() }
      )
      expect(userRepository.save).toHaveBeenCalledTimes(1)
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
      expect(logger.info).toHaveBeenCalledWith(
        'User saved',
        'CREATE_USER',
        'User saved',
        { id: expectedUserId }
      )
      expect(result).toEqual({ userId: expectedUserId })
    })

    it('should re-throw an error if userRepository.save fails', async () => {
      const saveError = new Error('Failed to save user')
      userRepository.save.mockRejectedValue(saveError)

      await expect(createUser.execute(mockUser)).rejects.toThrow(saveError)

      expect(mockUser.toPrimitives).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledTimes(1) // Only the first info call
      expect(logger.info).toHaveBeenCalledWith(
        'User data to save',
        'CREATE_USER',
        'User data to save',
        { userData: mockUser.toPrimitives() }
      )
      expect(userRepository.save).toHaveBeenCalledTimes(1)
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
    })
  })
})
