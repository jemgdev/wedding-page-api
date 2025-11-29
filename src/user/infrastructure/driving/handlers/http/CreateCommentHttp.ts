import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { SaveComments } from '@user/application/usecases/command/SaveComment'
import { CommentDynamoRepository } from '@user/infrastructure/driven/CommentDynamoRepository'
import { responseMessage } from '@shared/utils/ResponseMessage'
import { StatusCodes } from '@shared/utils/constants/StatusCodes'
import { MessageCodes } from '@shared/utils/constants/MessageCodes'
import { MessageDetail } from '@shared/utils/constants/MessageDetail'
import { Logger } from '@shared/libraries/logger/Logger'
import { ILogger } from '@shared/libraries/logger/ILogger'
import { bodyParser, queryParser } from '../../../../../shared/utils/TryExtractData'
import { ICreateCommentHttpRequest } from '../../dtos/ICreateCommentHttpRequest'

interface CreateCommentHandlerDependencies {
  logger: ILogger
  saveCommentsUseCase: SaveComments
}

const buildHandler = ({
  logger,
  saveCommentsUseCase
}: CreateCommentHandlerDependencies) => {
  return async (
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> => {
    try {
      logger.info('Http event data', 'GET_USERS', 'Http event data', {
        event
      })

      const request = bodyParser<ICreateCommentHttpRequest>(event)

      await saveCommentsUseCase.execute(request)

      return responseMessage<{
        code: string
        message: string
      }>({
        statusCode: StatusCodes.OPERATION_SUCCESSFUL,
        body: {
          code: MessageCodes.OPERATION_SUCCESSFUL,
          message: MessageDetail.OPERATION_SUCCESSFUL
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
const saveComments = new SaveComments(commentRepository)

export const handler = buildHandler({
  logger,
  saveCommentsUseCase: saveComments
})
