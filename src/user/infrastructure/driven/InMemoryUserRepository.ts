
import { UserPersistanceRepository } from '@user/application/ports/UserPersistanceRepository'
import { randomUUID } from 'crypto'
import { User } from '@user/domain/User'
import { InfrastructureError } from '@shared/errors/InfrastructureError'
import { IUserPersistance } from './dtos/IUserPersistance'
import { UserPersistanceMapper } from './mappers/UserPersistanceMapper'

export class InMemoryUserRepository implements UserPersistanceRepository {
  private readonly users = new Map<string, IUserPersistance>()

  constructor () {
    const id = randomUUID()
    this.users.set(id, {
      id,
      name: 'Jhon',
      last_name: 'Freddy',
      age: 10,
      identification_type: 'DNI',
      identification_number: '123456789012'
    })
  }

  async save (user: User): Promise<string> {
    try {
      this.users.set(
        user.toPrimitives().id,
        UserPersistanceMapper.toPersistence(user)
      )

      return user.toPrimitives().id
    } catch (error) {
      const err = error as Error
      throw new InfrastructureError(err.message, 503)
    }
  }

  async findById (id: string): Promise<User | null> {
    try {
      const userFound = this.users.get(id)

      if (userFound == null) {
        return null
      }

      return UserPersistanceMapper.toDomain(userFound)
    } catch (error) {
      const err = error as Error
      throw new InfrastructureError(err.message, 503)
    }
  }

  async findAll (): Promise<User[]> {
    try {
      const rawUsers = Array.from(this.users.values())
      return rawUsers.map(rawUser => UserPersistanceMapper.toDomain(rawUser))
    } catch (error) {
      const err = error as Error
      throw new InfrastructureError(err.message, 503)
    }
  }
}
