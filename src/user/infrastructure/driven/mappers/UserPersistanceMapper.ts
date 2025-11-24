import { User } from '@user/domain/User'
import { IUserPersistance } from '@user/infrastructure/driven/dtos/IUserPersistance'

export class UserPersistanceMapper {
  static toDomain (raw: IUserPersistance): User {
    return User.fromPrimitives({
      id: raw.id,
      name: raw.name,
      lastname: raw.last_name,
      age: raw.age,
      identificationNumber: raw.identification_number,
      identificationType: raw.identification_type
    })
  }

  static toPersistence (user: User): IUserPersistance {
    const p = user.toPrimitives()
    return {
      id: p.id,
      name: p.name,
      last_name: p.lastname,
      age: p.age,
      identification_number: p.identificationNumber,
      identification_type: p.identificationType
    }
  }
}
