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

  async findAll(take: number, cursor?: string): Promise<{ comments: Comment[], nextCursor?: string }> {
  try {
    // 1. Decodificar el cursor (igual que antes)
    const ExclusiveStartKey = cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString('utf8')) : undefined;

    // 2. Configurar el QUERY (No Scan)
    const command: QueryCommandInput = {
      TableName: process.env.COMMENTS_TABLE_NAME!,
      
      // A. Especificar el Índice Global que creamos en serverless.yml
      IndexName: 'CommentsByDateIndex', 
      
      // B. La condición: "Dame todos los items donde type sea igual a COMMENT"
      KeyConditionExpression: '#type = :typeVal',
      
      // C. Definir los valores de la condición
      ExpressionAttributeNames: {
        '#type': 'type' // Usamos alias porque 'type' es palabra reservada en DynamoDB
      },
      ExpressionAttributeValues: {
        ':typeVal': { S: 'COMMENT' }
      },

      // D. Ordenamiento: false = Descendente (Más nuevo -> Más viejo)
      ScanIndexForward: false,
      
      Limit: take,
      ExclusiveStartKey: ExclusiveStartKey,
    }

    console.log('Query Command:', command)

    // 3. Ejecutar (QueryCommand)
    const result = await this.dynamoClient.send(new QueryCommand(command))

    if (!result.Items) {
      return { comments: [] }
    }

    // 4. Mapeo (igual que antes)
    const comments = result.Items.map(item => CommentPersistanceMapper.toDomain(item as any))
    
    // 5. Generar siguiente cursor
    let nextCursor: string | undefined;
    if (result.LastEvaluatedKey) {
      nextCursor = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return { comments, nextCursor: nextCursor }
  } catch (error) {
    const err = error as Error
    throw new InfrastructureError(`Error fetching comments from DynamoDB: ${err.message}`, 500)
  }
}
}