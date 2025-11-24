import { buildHandler } from '../GetUsersSQS'
import { SQSEvent, SQSBatchResponse } from 'aws-lambda'
import { GetAllUsers } from '@user/application/usecases/query/GetAllUsers'
import { Logger } from '@shared/libraries/logger/Logger'
import * as Parsers from '@shared/utils/TryExtractData'
import * as ResponseMessage from '@shared/utils/ResponseMessage'
import { User } from '@user/domain/User'
import { StatusCodes } from '@shared/utils/constants/StatusCodes'
import { UserPersistanceRepository } from '@user/ports/UserPersistanceRepository'

// Mock external modules
jest.mock('@user/application/usecases/query/GetAllUsers')
jest.mock('@shared/libraries/logger/Logger')
jest.mock('@shared/utils/TryExtractData')
jest.mock('@shared/utils/ResponseMessage')

describe('GetUsersSQS Handler', () => {
  let loggerInstance: jest.Mocked<Logger>
  let userRepositoryInstance: jest.Mocked<UserPersistanceRepository>
  let getAllUsersInstance: jest.Mocked<GetAllUsers>
  let handler: (event: SQSEvent) => Promise<SQSBatchResponse>

  const MockParsers = Parsers as jest.Mocked<typeof Parsers>
  const MockResponseMessage = ResponseMessage as jest.Mocked<typeof ResponseMessage>

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

  const mockSqsEvent: SQSEvent = {
    Records: [
      {
        messageId: 'msg1',
        body: JSON.stringify({ data: 'payload1' }),
      } as any,
      {
        messageId: 'msg2',
        body: JSON.stringify({ data: 'payload2' }),
      } as any,
    ],
  } as any

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
    MockParsers.sqsParser.mockReturnValue([
      { messageId: 'msg1', body: { data: 'payload1' } },
      { messageId: 'msg2', body: { data: 'payload2' } },
    ])
    MockResponseMessage.responseMessage.mockReturnValue({ statusCode: StatusCodes.OPERATION_SUCCESSFUL })
    loggerInstance.info.mockClear()
    loggerInstance.error.mockClear()
  })

  it('should successfully process all SQS records', async () => {
    const result = await handler(mockSqsEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(loggerInstance.info).toHaveBeenCalledWith(
      'Sqs event data',
      'GET_USERS_SQS',
      'Sqs event data',
      { event: mockSqsEvent }
    )
    expect(MockParsers.sqsParser).toHaveBeenCalledTimes(1)
    expect(MockParsers.sqsParser).toHaveBeenCalledWith(mockSqsEvent)
    expect(getAllUsersInstance.execute).toHaveBeenCalledTimes(2) // Called for each record
    expect(mockUserInstance.toPrimitives).toHaveBeenCalledTimes(2) // Called for each record
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(2) // Called for each record
    expect(result).toEqual({ batchItemFailures: [] })
  })

  it('should handle partial failures and return failed message IDs', async () => {
    getAllUsersInstance.execute.mockImplementationOnce(() => {
      throw new Error('Error processing msg1')
    })

    const result = await handler(mockSqsEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(loggerInstance.error).toHaveBeenCalledTimes(1)
    expect(loggerInstance.error).toHaveBeenCalledWith(
      'SQS event error',
      'GET_USERS',
      'SQS event error',
      { message: 'Error processing msg1' }
    )
    expect(getAllUsersInstance.execute).toHaveBeenCalledTimes(2)
    expect(mockUserInstance.toPrimitives).toHaveBeenCalledTimes(1) // Only for msg2
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1) // Only for msg2
    expect(result).toEqual({ batchItemFailures: [{ itemIdentifier: 'msg1' }] })
  })

  it('should handle all records failing', async () => {
    getAllUsersInstance.execute.mockImplementation(() => {
      throw new Error('Error processing all messages')
    })

    const result = await handler(mockSqsEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(loggerInstance.error).toHaveBeenCalledTimes(2) // Called for each record
    expect(getAllUsersInstance.execute).toHaveBeenCalledTimes(2)
    expect(mockUserInstance.toPrimitives).not.toHaveBeenCalled()
    expect(MockResponseMessage.responseMessage).not.toHaveBeenCalled()
    expect(result).toEqual({ batchItemFailures: [{ itemIdentifier: 'msg1' }, { itemIdentifier: 'msg2' }] })
  })
})
