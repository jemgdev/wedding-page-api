import { Comment } from '@user/domain/Comment'
import { CommentPersistanceRepository } from '@user/application/ports/CommentPersistanceRepository'

export class GetComments {
  constructor (private readonly commentRepository: CommentPersistanceRepository) {}

  async execute ({
    take,
    cursor
  }: {
    take: number
    cursor?: string
  }): Promise<{ comments: Comment[], nextCursor?: string }> {
    const comments = await this.commentRepository.findAll(take, cursor)
    return comments
  }
}
  