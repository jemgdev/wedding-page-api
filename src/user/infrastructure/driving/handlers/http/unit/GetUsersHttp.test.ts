import { buildHandler } from '../GetUsersHttp'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { GetAllUsers } from '@user/application/usecases/query/GetAllUsers'
import { Logger } from '@shared/libraries/logger/Logger'
import * as ResponseMessage from '@shared/utils/ResponseMessage'
import { StatusCodes } from '@shared/utils/constants/StatusCodes'
import { MessageCodes } from '@shared/utils/constants/MessageCodes'
import { MessageDetail } from '@shared/utils/constants/MessageDetail'
import { User } from '@user/domain/User'
import { UserPersistanceRepository } from '@user/ports/UserPersistanceRepository'

// Mock external modules
jest.mock('@user/application/usecases/query/GetAllUsers')
jest.mock('@shared/libraries/logger/Logger')
jest.mock('@shared/utils/ResponseMessage')

describe('GetUsersHttp Handler', () => {
  let loggerInstance: jest.Mocked<Logger>
  let userRepositoryInstance: jest.Mocked<UserPersistanceRepository>
  let getAllUsersInstance: jest.Mocked<GetAllUsers>
  let handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResultV2>

  const MockResponseMessage = ResponseMessage as jest.Mocked<typeof ResponseMessage>

  const mockEvent: APIGatewayProxyEventV2 = {
    body: '',
    headers: {},
    isBase64Encoded: false,
    rawPath: '/users',
    rawQueryString: '',
    requestContext: {} as any,
    routeKey: 'GET /users',
    version: '2.0'
  }

  const mockUserPrimitives = {
    id: 'user-id',
    name: 'John',
    lastname: 'Doe',
    age: 30,
    identificationNumber: '12345678',
    identificationType: 'DNI'
  }

  const mockUserInstance = {
    toPrimitives: jest.fn().mockReturnValue(mockUserPrimitives)
  } as unknown as User

  const mockApiResponse = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' })
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mocks for injected dependencies
    loggerInstance = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as jest.Mocked<Logger>

    userRepositoryInstance = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    } as jest.Mocked<UserPersistanceRepository>

    getAllUsersInstance = {
      execute: jest.fn().mockResolvedValue([mockUserInstance])
    } as unknown as jest.Mocked<GetAllUsers>

    // Build the handler with mocked dependencies
    handler = buildHandler({
      logger: loggerInstance,
      getAllUsersUseCase: getAllUsersInstance
    })

    // Reset mocks for each test
    MockResponseMessage.responseMessage.mockReturnValue(mockApiResponse)
    loggerInstance.info.mockClear()
    loggerInstance.error.mockClear()
  })

  it('should successfully get all users and return 200 OK', async () => {
    const result = await handler(mockEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(loggerInstance.info).toHaveBeenCalledWith(
      'Http event data',
      'GET_USERS',
      'Http event data',
      { event: mockEvent }
    )
    expect(getAllUsersInstance.execute).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledWith({
      statusCode: StatusCodes.OPERATION_SUCCESSFUL,
      body: {
        code: MessageCodes.OPERATION_SUCCESSFUL,
        message: MessageDetail.OPERATION_SUCCESSFUL,
        data: [mockUserPrimitives]
      }
    })
    expect(result).toEqual(mockApiResponse)
  })

  it('should return 500 UNCONTROLLED_ERROR for generic errors', async () => {
    const genericErrorMessage = 'Something unexpected happened'
    const mockGenericError = new Error(genericErrorMessage)

    getAllUsersInstance.execute.mockImplementation(() => {
      throw mockGenericError
    })

    const result = await handler(mockEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(loggerInstance.error).toHaveBeenCalledTimes(1)
    expect(loggerInstance.error).toHaveBeenCalledWith(
      'Http event error',
      'GET_USERS',
      'Http event error',
      { message: genericErrorMessage }
    )
    expect(getAllUsersInstance.execute).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledWith({
      statusCode: StatusCodes.UNCONTROLLER_ERROR,
      body: {
        code: MessageCodes.UNCONTROLLER_ERROR,
        message: MessageDetail.UNCONTROLLER_ERROR
      }
    })
    expect(result).toEqual(mockApiResponse)
  })
})
