
import { CommentPersistanceRepository } from '@user/application/ports/CommentPersistanceRepository'
import { InfrastructureError } from '@shared/errors/InfrastructureError'
import { CommentPersistanceMapper } from './mappers/CommentPersistanceMapper'
import { DynamoClient } from '@shared/libraries/dynamodb/DynamoClient'
import { Comment } from '../../domain/Comment'
import { DeleteCommand, PutCommand, QueryCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { QueryCommand } from '@aws-sdk/client-dynamodb'

export class CommentDynamoRepository implements CommentPersistanceRepository {
  private readonly dynamoClient

  constructor () {
    this.dynamoClient = DynamoClient
  }

  async save(comment: Comment): Promise<void> {
    try {
      const item = CommentPersistanceMapper.toPersistence(comment)
      await this.dynamoClient.send(new PutCommand({
        TableName: process.env.COMMENTS_TABLE_NAME!,
        Item: item
      }))
    } catch (error) {
      const err = error as Error
      throw new InfrastructureError(`Error saving comment to DynamoDB: ${err.message}`, 500)
    }
  }

  async findAll(take: number, page: number): Promise<Comment[]> {
    try {
      const command: QueryCommandInput = {
        TableName: process.env.COMMENTS_TABLE_NAME!,
        Limit: take,
        ExclusiveStartKey: page > 0 ? { id: { S: (page * take).toString() } } : undefined
      }

      console.log('Query Command:', command)

      const result = await this.dynamoClient.send(new QueryCommand(command))

      if (!result.Items) {
        return []
      }

      const comments = result.Items.map(item => CommentPersistanceMapper.toDomain(item as any))
      
      return comments
    } catch (error) {
      const err = error as Error
      throw new InfrastructureError(`Error fetching comments from DynamoDB: ${err.message}`, 500)
    }
  }

  async deleteComment(id: string): Promise<void> {
    try {
      await this.dynamoClient.send(new DeleteCommand({
        TableName: process.env.COMMENTS_TABLE_NAME!,
        Key: { id }
      }))
    } catch (error) {
      const err = error as Error
      throw new InfrastructureError(`Error deleting comment from DynamoDB: ${err.message}`, 500)
    }
  }

  async updateLikeCount(id: string, likeCount: number): Promise<void> {
    try {
      await this.dynamoClient.send(new UpdateCommand({
        TableName: process.env.COMMENTS_TABLE_NAME!,
        Key: { id },
        UpdateExpression: 'set likeCount = :likeCount',
        ExpressionAttributeValues: {
          ':likeCount': likeCount
        }
      }))
    } catch (error) {
      const err = error as Error
      throw new InfrastructureError(`Error updating like count in DynamoDB: ${err.message}`, 500)
    }
  }
}
