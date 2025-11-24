import { ILogger } from '@shared/libraries/logger/ILogger'
import { User } from '@user/domain/User'
import { UserPersistanceRepository } from '@user/ports/UserPersistanceRepository'

export class CreateUser {
  constructor (
    private readonly userRepository: UserPersistanceRepository,
    private readonly logger: ILogger
  ) {}

  async execute (user: User): Promise<{
    userId: string
  }> {
    const userData = user.toPrimitives()

    this.logger.info('User data to save', 'CREATE_USER', 'User data to save', {
      userData
    })

    const userId = await this.userRepository.save(user)

    this.logger.info('User saved', 'CREATE_USER', 'User saved', {
      id: userId
    })

    return {
      userId
    }
  }
}
