import { CommentPersistanceRepository } from '@comment/application/ports/CommentPersistanceRepository'
import { InfrastructureError } from '@shared/errors/InfrastructureError'
import { CommentPersistanceMapper } from './mappers/CommentPersistanceMapper'
import { DynamoClient } from '@shared/libraries/dynamodb/DynamoClient'
import { Comment } from '../../domain/Comment'
// FIX: Usamos ScanCommand para la funcionalidad de escaneo de toda la tabla
import { PutCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb' 
import { QueryCommand } from '@aws-sdk/client-dynamodb'
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
      const command: QueryCommandInput = {
        TableName: process.env.COMMENTS_TABLE_NAME!,
        Limit: take,
        ExclusiveStartKey: ExclusiveStartKey,
        ScanIndexForward: false,
      }

      console.log('Scan Command:', command)

      // CAMBIO: Ejecutar ScanCommand
      const result = await this.dynamoClient.send(new QueryCommand(command))

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
}