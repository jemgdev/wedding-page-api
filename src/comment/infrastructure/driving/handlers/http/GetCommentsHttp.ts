import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { GetComments } from '@comment/application/usecases/query/GetComments'
import { CommentDynamoRepository } from '@comment/infrastructure/driven/CommentDynamoRepository'
import { responseMessage } from '@shared/utils/ResponseMessage'
import { StatusCodes } from '@shared/utils/constants/StatusCodes'
import { MessageCodes } from '@shared/utils/constants/MessageCodes'
import { MessageDetail } from '@shared/utils/constants/MessageDetail'
import { Logger } from '@shared/libraries/logger/Logger'
import { ILogger } from '@shared/libraries/logger/ILogger'
import { queryParser } from '../../../../../shared/utils/TryExtractData'

interface GetCommentsHandlerDependencies {
  logger: ILogger
  getCommentsUseCase: GetComments
}

const buildHandler = ({
  logger,
  getCommentsUseCase
}: GetCommentsHandlerDependencies) => {
  return async (
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> => {
    try {
      logger.info('Http event data', 'GET_commentS', 'Http event data', {
        event
      })

      const {
        take,
        cursor
      } = queryParser<{
        take: string
        cursor?: string
      }>(event)

      const commentsResult = await getCommentsUseCase.execute({
        take: Number(take),
        cursor: cursor ? cursor : undefined
      })
      const finalComments = commentsResult.comments.map(comment => comment.toPrimitives())

      return responseMessage<{
        code: string
        message: string
        data: {
          comments: any[]
          nextCursor?: string
        }
      }>({
        statusCode: StatusCodes.OPERATION_SUCCESSFUL,
        body: {
          code: MessageCodes.OPERATION_SUCCESSFUL,
          message: MessageDetail.OPERATION_SUCCESSFUL,
          data: {
            comments: finalComments,
            nextCursor: commentsResult.nextCursor
          }
        }
      })
    } catch (err) {
      const error = err as Error
      logger.error('Http event error', 'GET_USERS', 'Http event error', {
        message: error.message
      })

      return responseMessage<{
        code: string
        message: string
      }>({
        statusCode: StatusCodes.UNCONTROLLER_ERROR,
        body: {
          code: MessageCodes.UNCONTROLLER_ERROR,
          message: MessageDetail.UNCONTROLLER_ERROR
        }
      })
    }
  }
}

const logger = new Logger()
const commentRepository = new CommentDynamoRepository()
const getComments = new GetComments(commentRepository)

export const handler = buildHandler({
  logger,
  getCommentsUseCase: getComments
})
