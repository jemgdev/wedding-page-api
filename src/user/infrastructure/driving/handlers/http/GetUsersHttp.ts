import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { GetAllUsers } from '@user/application/usecases/query/GetAllUsers'
import { InMemoryUserRepository } from '@user/infrastructure/driven/InMemoryUserRepository'
import { responseMessage } from '@shared/utils/ResponseMessage'
import { StatusCodes } from '@shared/utils/constants/StatusCodes'
import { MessageCodes } from '@shared/utils/constants/MessageCodes'
import { MessageDetail } from '@shared/utils/constants/MessageDetail'
import { Logger } from '@shared/libraries/logger/Logger'
import { ILogger } from '@shared/libraries/logger/ILogger'

interface GetUsersHandlerDependencies {
  logger: ILogger
  getAllUsersUseCase: GetAllUsers
}

export const buildHandler = ({
  logger,
  getAllUsersUseCase
}: GetUsersHandlerDependencies) => {
  return async (
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> => {
    try {
      logger.info('Http event data', 'GET_USERS', 'Http event data', {
        event
      })

      // The original code instantiated userRepository and getAllUsers here.
      // Now they are injected.
      const users = await getAllUsersUseCase.execute()
      const finalUsers = users.map(user => user.toPrimitives())

      return responseMessage<{
        code: string
        message: string
        data: any[]
      }>({
        statusCode: StatusCodes.OPERATION_SUCCESSFUL,
        body: {
          code: MessageCodes.OPERATION_SUCCESSFUL,
          message: MessageDetail.OPERATION_SUCCESSFUL,
          data: finalUsers
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
const userRepository = new InMemoryUserRepository()
const getAllUsers = new GetAllUsers(userRepository)

export const handler = buildHandler({
  logger,
  getAllUsersUseCase: getAllUsers
})
