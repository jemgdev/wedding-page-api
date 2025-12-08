import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { GetComments } from '@comment/application/usecases/query/GetComments'
import { CommentDynamoRepository } from '@comment/infrastructure/driven/CommentDynamoRepository'
import { responseMessage } from '@shared/utils/ResponseMessage'
import { StatusCodes } from '@shared/utils/constants/StatusCodes'
import { MessageCodes } from '@shared/utils/constants/MessageCodes'
import { MessageDetail } from '@shared/utils/constants/MessageDetail'
import { Logger } from '@shared/libraries/logger/Logger'
import { ILogger } from '@shared/libraries/logger/ILogger'
import { bodyParser } from '@shared/utils/TryExtractData'
import { logiflyLogin, logiflyOwnerLogin } from '@shared/utils/LogiflyServices'

interface SignInHandlerDependencies {
  logger: ILogger
}

const buildHandler = ({
  logger,
}: SignInHandlerDependencies) => {
  return async (
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> => {
    try {
      logger.info('Http event data', 'SignInHttp', 'Http event data', {
        event
      })

      const {
        email,
        password
      } = bodyParser<{
        email: string
        password: string
      }>(event)

      const ownerSession = await logiflyOwnerLogin()

      const userSession = await logiflyLogin({
        ownerAccessToken: ownerSession.accessToken,
        ownerIdToken: ownerSession.idToken,
        email,
        password
      })

      return responseMessage<{
        code: string
        message: string
        data: {
          accessToken: string;
          idToken: string;
          refreshToken: string;
        }
      }>({
        statusCode: StatusCodes.OPERATION_SUCCESSFUL,
        body: {
          code: MessageCodes.OPERATION_SUCCESSFUL,
          message: MessageDetail.OPERATION_SUCCESSFUL,
          data: userSession
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
  logger
})
