import { User } from '@user/domain/User'
import { UserPersistanceRepository } from '@user/ports/UserPersistanceRepository'

export class GetAllUsers {
  constructor (private readonly userRepository: UserPersistanceRepository) {}

  async execute (): Promise<User[]> {
    const users = await this.userRepository.findAll()
    return users
  }
}
