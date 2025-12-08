import { Comment } from '@comment/domain/Comment'
import { CommentPersistanceRepository } from '@comment/application/ports/CommentPersistanceRepository'

export class SaveComments {
  constructor (private readonly commentRepository: CommentPersistanceRepository) {}

  async execute ({
    name,
    comment,
    presence
  }: {
    name: string
    comment: string
    presence: boolean
  }): Promise<void> {
    const commentObject = Comment.create({
      name,
      comment,
      presence
    })
    await this.commentRepository.save(commentObject)
  }
}
  