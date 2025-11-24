import { Age } from '@user/value-objects/Age'
import { ID } from '@user/value-objects/ID'
import { IdentificationNumber } from '@user/value-objects/IdentificationNumber'

export class User {
  private constructor (
    private readonly id: ID,
    private readonly name: string,
    private readonly lastname: string,
    private readonly age: Age,
    private readonly identificationNumber: IdentificationNumber,
    private readonly identificationType: string
  ) {}

  public static create (props: {
    name: string
    lastname: string
    age: number
    identificationNumber: string
    identificationType: string
  }): User {
    const id = ID.create()
    const age = Age.create(props.age)
    const identificationNumber = IdentificationNumber.create(props.identificationNumber)

    return new User(
      id,
      props.name,
      props.lastname,
      age,
      identificationNumber,
      props.identificationType
    )
  }

  public static fromPrimitives (props: {
    id: string
    name: string
    lastname: string
    age: number
    identificationNumber: string
    identificationType: string
  }): User {
    const id = ID.fromString(props.id)
    const age = Age.create(props.age)
    console.log(props.identificationNumber)
    const identificationNumber = IdentificationNumber.create(props.identificationNumber)

    return new User(
      id,
      props.name,
      props.lastname,
      age,
      identificationNumber,
      props.identificationType
    )
  }

  public toPrimitives (): {
    id: string
    name: string
    lastname: string
    age: number
    identificationNumber: string
    identificationType: string
  } {
    return {
      id: this.id.getValue(),
      name: this.name,
      lastname: this.lastname,
      age: this.age.getValue(),
      identificationNumber: this.identificationNumber.getValue(),
      identificationType: this.identificationType
    }
  }
}
