import { CommentPersistanceRepository } from '@user/application/ports/CommentPersistanceRepository'
import { InfrastructureError } from '@shared/errors/InfrastructureError'
import { CommentPersistanceMapper } from './mappers/CommentPersistanceMapper'
import { DynamoClient } from '@shared/libraries/dynamodb/DynamoClient'
import { Comment } from '../../domain/Comment'
// FIX: Usamos ScanCommand para la funcionalidad de escaneo de toda la tabla
import { DeleteCommand, PutCommand, UpdateCommand, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb' 
// REMOVIDO: Se eliminan las importaciones de QueryCommand al cambiar a Scan

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

  // CAMBIO CRÍTICO: Implementación ahora realiza un Scan, ideal para obtener 'todo' con paginación basada en cursor.
  // La firma se simplifica ya que no requiere el entityId (HASH Key).
  async findAll(take: number, cursor?: string): Promise<{ comments: Comment[], nextCursor?: string }> {
    try {
      // Usamos Base64 decoding para el cursor para recuperar el objeto LastEvaluatedKey complejo.
      const ExclusiveStartKey = cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString('utf8')) : undefined;

      // CAMBIO: Usamos ScanCommandInput. KeyConditionExpression no es requerida para Scan.
      const command: ScanCommandInput = {
        TableName: process.env.COMMENTS_TABLE_NAME!,
        Limit: take,
        ExclusiveStartKey: ExclusiveStartKey
      }

      console.log('Scan Command:', command)

      // CAMBIO: Ejecutar ScanCommand
      const result = await this.dynamoClient.send(new ScanCommand(command))

      if (!result.Items) {
        return { comments: [] }
      }

      const comments = result.Items.map(item => CommentPersistanceMapper.toDomain(item as any))
      
      let nextCursor: string | undefined;
      if (result.LastEvaluatedKey) {
        // Codificar el objeto LastEvaluatedKey a una cadena Base64 para el siguiente cursor
        nextCursor = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
      }

      // IMPORTANTE: Un Scan recorre toda la tabla, por lo que puede ser lento.
      return { comments, nextCursor: nextCursor }
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