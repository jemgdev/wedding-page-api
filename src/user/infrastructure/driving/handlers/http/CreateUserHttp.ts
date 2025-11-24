import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { CreateUser } from '@user/application/usecases/command/CreateUser'
import { UserHttpMapper } from '@user/infrastructure/driving/mappers/UserHttpMapper'
import { ICreateUserHttpResponse } from '@user/infrastructure/driving/dtos/ICreateUserHttpResponse'
import { CreateUserSchema } from '@user/infrastructure/driving/schemas/CreateUserSchema'
import { InMemoryUserRepository } from '@user/infrastructure/driven/InMemoryUserRepository'
import { bodyParser } from '@shared/utils/TryExtractData'
import { responseMessage } from '@shared/utils/ResponseMessage'
import { StatusCodes } from '@shared/utils/constants/StatusCodes'
import { MessageCodes } from '@shared/utils/constants/MessageCodes'
import { MessageDetail } from '@shared/utils/constants/MessageDetail'
import { Logger } from '@shared/libraries/logger/Logger'
import { ValidationError } from '@shared/errors/ValidationError'
import { ApplicationError } from '@shared/errors/ApplicationError'
import { DomainError } from '@shared/errors/DomainError'
import { InfrastructureError } from '@shared/errors/InfrastructureError'
import { ILogger } from '@shared/libraries/logger/ILogger'

interface CreateUserHandlerDependencies {
  logger: ILogger
  createUserUseCase: CreateUser
}

export const buildHandler = ({
  logger,
  createUserUseCase
}: CreateUserHandlerDependencies) => {
  return async (
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> => {
    try {
      logger.info('Http event data', 'CREATE_USER', 'Http event data', {
        event
      })

      const body = bodyParser<{
        name: string
        lastname: string
        age: number
        identificationNumber: string
        identificationType: string
      }>(event)

      const parsed = CreateUserSchema.safeParse(body)

      if (!parsed.success) {
        const message = parsed.error.message
        throw new ValidationError([
          {
            field: 'any',
            message
          }
        ])
      }

      const user = UserHttpMapper.fromRequest({
        name: body.name,
        lastname: body.lastname,
        age: body.age,
        identificationNumber: body.identificationNumber,
        identificationType: body.identificationType
      })

      const userData = await createUserUseCase.execute(user)

      const response: ICreateUserHttpResponse = {
        id: userData.userId
      }

      return responseMessage<{
        code: string
        message: string
        data: ICreateUserHttpResponse
      }>({
        statusCode: StatusCodes.OPERATION_SUCCESSFUL,
        body: {
          code: MessageCodes.OPERATION_SUCCESSFUL,
          message: MessageDetail.OPERATION_SUCCESSFUL,
          data: response
        }
      })
    } catch (error) {
      const handleErrorResponse = (err: unknown) => {
        if (err instanceof ValidationError) {
          return responseMessage<{
            code: string
            message: string
            errors: Array<{
              field: string
              message: string
            }>
          }>({
            statusCode: StatusCodes.BAD_REQUEST,
            body: {
              code: MessageCodes.BAD_REQUEST,
              message: err.message,
              errors: err.errors
            }
          })
        }

        if (err instanceof DomainError) {
          return responseMessage<{
            code: string
            message: string
          }>({
            statusCode: StatusCodes.PROCESS_ERROR,
            body: {
              code: MessageCodes.PROCESS_ERROR,
              message: err.message
            }
          })
        }

        if (err instanceof ApplicationError) {
          return responseMessage<{
            code: string
            message: string
          }>({
            statusCode: err.statusCode,
            body: {
              code: MessageCodes.PROCESS_ERROR,
              message: err.message
            }
          })
        }

        if (err instanceof InfrastructureError) {
          return responseMessage<{
            code: string
            message: string
          }>({
            statusCode: err.statusCode,
            body: {
              code: MessageCodes.PROCESS_ERROR,
              message: err.message
            }
          })
        }

        return responseMessage<{
          code: string
          message: string
        }>({
          statusCode: StatusCodes.UNCONTROLLER_ERROR,
          body: {
            code: MessageCodes.UNCONTROLLER_ERROR,
            message: err instanceof Error ? err.message : MessageDetail.UNCONTROLLER_ERROR
          }
        })
      }
      return handleErrorResponse(error)
    }
  }
}

const logger = new Logger()
const userRepository = new InMemoryUserRepository()
const createUser = new CreateUser(userRepository, logger)

export const handler = buildHandler({
  logger,
  createUserUseCase: createUser
})
