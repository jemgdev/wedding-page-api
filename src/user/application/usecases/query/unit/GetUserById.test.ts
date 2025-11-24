
import { GetUserById } from '../GetUserById'
import { UserPersistanceRepository } from '@user/ports/UserPersistanceRepository'
import { User } from '@user/domain/User'

describe('GetUserById', () => {
  let userRepository: jest.Mocked<UserPersistanceRepository>
  let getUserById: GetUserById

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    }
    getUserById = new GetUserById(userRepository)
  })

  describe('execute', () => {
    it('should return a user if found', async () => {
      const mockUserId = 'test-user-id'
      const mockUser: User = {
        toPrimitives: () => ({
          id: mockUserId,
          name: 'Test',
          lastname: 'User',
          age: 25,
          identificationNumber: '1234567890',
          identificationType: 'DNI'
        })
      } as unknown as User
      userRepository.findById.mockResolvedValue(mockUser)

      const result = await getUserById.execute(mockUserId)

      expect(userRepository.findById).toHaveBeenCalledTimes(1)
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId)
      expect(result).toEqual(mockUser)
    })

    it('should return null if user is not found', async () => {
      const mockUserId = 'non-existent-id'
      userRepository.findById.mockResolvedValue(null)

      const result = await getUserById.execute(mockUserId)

      expect(userRepository.findById).toHaveBeenCalledTimes(1)
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId)
      expect(result).toBeNull()
    })

    it('should re-throw an error if userRepository.findById fails', async () => {
      const findError = new Error('Database error')
      const mockUserId = 'test-user-id'
      userRepository.findById.mockRejectedValue(findError)

      await expect(getUserById.execute(mockUserId)).rejects.toThrow(findError)
      expect(userRepository.findById).toHaveBeenCalledTimes(1)
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId)
    })
  })
})
