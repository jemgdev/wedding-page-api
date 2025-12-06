import { ID } from '@comment/value-objects/ID'

export class Comment {
  private constructor (
    private readonly id: ID,
    private readonly name: string,
    private readonly presence: boolean,
    private readonly comment: string,
    private readonly createdAt: string
  ) {}

  public static create (props: {
    name: string
    presence: boolean
    comment: string
  }): Comment {
    const id = ID.create()
    const createdAt = new Date().toISOString()

    return new Comment(
      id,
      props.name,
      props.presence,
      props.comment,
      createdAt
    )
  }

  public static fromPrimitives (props: {
    id: string
    name: string
    presence: boolean
    comment: string
    createdAt: string
  }): Comment {
    return new Comment(
      ID.fromString(props.id),
      props.name,
      props.presence,
      props.comment,
      props.createdAt
    )
  }

  public toPrimitives (): {
    id: string
    name: string
    presence: boolean
    comment: string
    createdAt: string
  } {
    return {
      id: this.id.getValue(),
      name: this.name,
      presence: this.presence,
      comment: this.comment,
      createdAt: this.createdAt
    }
  }
}
