import { User } from '@user/domain/User'
import { UserPersistanceRepository } from '@user/ports/UserPersistanceRepository'

export class GetUserById {
  constructor (private readonly userRepository: UserPersistanceRepository) {}

  async execute (id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id)
    return user
  }
}
