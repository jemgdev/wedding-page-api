export interface ICommentPersistance {
  id: string
  name: string
  presence: boolean
  comment: string
  createdAt: string
  type: 'COMMENT'
}
