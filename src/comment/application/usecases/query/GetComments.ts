import { Comment } from '@comment/domain/Comment'
import { CommentPersistanceRepository } from '@comment/application/ports/CommentPersistanceRepository'

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
  