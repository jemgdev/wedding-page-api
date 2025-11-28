import { Comment } from '@user/domain/Comment'
import { ICreateCommentHttpRequest } from '@user/infrastructure/driving/dtos/ICreateCommentHttpRequest'
import { ICreateCommentHttpResponse } from '@user/infrastructure/driving/dtos/ICreateCommentHttpResponse'

export class CommentHttpMapper {
  static fromRequest (dto: ICreateCommentHttpRequest): Comment {
    return Comment.create({
      name: dto.name,
      presence: dto.presence,
      comment: dto.comment,
    })
  }

  static toResponse (comment: Comment): ICreateCommentHttpResponse {
    const commentData = comment.toPrimitives()
    return {
      id: commentData.id
    }
  }
}
