import { Comment } from '@comment/domain/Comment'
import { ICommentPersistance } from '@comment/infrastructure/driven/dtos/ICommentPersistance'

export class CommentPersistanceMapper {
  static toDomain (raw: ICommentPersistance): Comment {
    return Comment.fromPrimitives({
      id: raw.id,
      name: raw.name,
      presence: raw.presence,
      comment: raw.comment,
      createdAt: raw.createdAt,
      likeCount: raw.likeCount
    })
  }

  static toPersistence (comment: Comment): ICommentPersistance {
    const p = comment.toPrimitives()
    return {
      id: p.id,
      name: p.name,
      presence: p.presence,
      comment: p.comment,
      createdAt: p.createdAt,
      likeCount: p.likeCount
    }
  }
}
