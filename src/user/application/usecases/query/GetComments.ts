import { Comment } from '@user/domain/Comment'
import { CommentPersistanceRepository } from '@user/application/ports/CommentPersistanceRepository'

export class GetComments {
  constructor (private readonly commentRepository: CommentPersistanceRepository) {}

  async execute ({
    take,
    page
  }: {
    take: number
    page: number
  }): Promise<Comment[]> {
    const comments = await this.commentRepository.findAll(take, page)
    return comments
  }
}
  