
import { GetAllUsers } from '../GetAllUsers'
import { UserPersistanceRepository } from '@user/ports/UserPersistanceRepository'
import { User } from '@user/domain/User'

describe('GetAllUsers', () => {
  let userRepository: jest.Mocked<UserPersistanceRepository>
  let getAllUsers: GetAllUsers

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    }
    getAllUsers = new GetAllUsers(userRepository)
  })

  describe('execute', () => {
    it('should return an array of users on successful retrieval', async () => {
      const mockUsers: User[] = [
        {
          toPrimitives: () => ({
            id: 'id1',
            name: 'User1',
            lastname: 'Last1',
            age: 20,
            identificationNumber: '1234567890',
            identificationType: 'DNI'
          })
        } as unknown as User,
        {
          toPrimitives: () => ({
            id: 'id2',
            name: 'User2',
            lastname: 'Last2',
            age: 30,
            identificationNumber: '0987654321',
            identificationType: 'Passport'
          })
        } as unknown as User
      ]
      userRepository.findAll.mockResolvedValue(mockUsers)

      const result = await getAllUsers.execute()

      expect(userRepository.findAll).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockUsers)
    })

    it('should re-throw an error if userRepository.findAll fails', async () => {
      const findError = new Error('Database error')
      userRepository.findAll.mockRejectedValue(findError)

      await expect(getAllUsers.execute()).rejects.toThrow(findError)
      expect(userRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })
})
