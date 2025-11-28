import { Comment } from '@user/domain/Comment'

export interface CommentPersistanceRepository {
  save: (comment: Comment) => Promise<void>
  findAll: (take: number, page: number) => Promise<Comment[]>
  updateLikeCount: (id: string, likeCount: number) => Promise<void>
  deleteComment: (id: string) => Promise<void>
}
