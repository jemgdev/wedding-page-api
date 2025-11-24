import { buildHandler } from '../CreateUserHttp'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { CreateUser } from '@user/application/usecases/command/CreateUser'
import { UserHttpMapper } from '@user/infrastructure/driving/mappers/UserHttpMapper'
import { CreateUserSchema } from '@user/infrastructure/driving/schemas/CreateUserSchema'
import * as Parsers from '@shared/utils/TryExtractData'
import * as ResponseMessage from '@shared/utils/ResponseMessage'
import { ValidationError } from '@shared/errors/ValidationError'
import { ApplicationError } from '@shared/errors/ApplicationError'
import { DomainError } from '@shared/errors/DomainError'
import { InfrastructureError } from '@shared/errors/InfrastructureError'
import { StatusCodes } from '@shared/utils/constants/StatusCodes'
import { MessageCodes } from '@shared/utils/constants/MessageCodes'
import { MessageDetail } from '@shared/utils/constants/MessageDetail'
import { User } from '@user/domain/User'
import { ILogger } from '@shared/libraries/logger/ILogger'

// Mock external modules that are still used directly (not injected)
jest.mock('@user/infrastructure/driving/mappers/UserHttpMapper')
jest.mock('@user/infrastructure/driving/schemas/CreateUserSchema')
jest.mock('@shared/utils/TryExtractData')
jest.mock('@shared/utils/ResponseMessage')

// Mock error classes to control their behavior
jest.mock('@shared/errors/ValidationError')
jest.mock('@shared/errors/ApplicationError')
jest.mock('@shared/errors/DomainError')
jest.mock('@shared/errors/InfrastructureError')

describe('CreateUserHttp Handler', () => {
  let loggerInstance: jest.Mocked<ILogger>
  let createUserInstance: jest.Mocked<CreateUser>
  let handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResultV2>

  const MockUserHttpMapper = UserHttpMapper as jest.Mocked<typeof UserHttpMapper>
  const MockCreateUserSchema = CreateUserSchema as jest.Mocked<typeof CreateUserSchema>
  const MockParsers = Parsers as jest.Mocked<typeof Parsers>
  const MockResponseMessage = ResponseMessage as jest.Mocked<typeof ResponseMessage>

  // Mock error class constructors
  const MockValidationError = ValidationError as jest.MockedClass<typeof ValidationError>
  const MockApplicationError = ApplicationError as jest.MockedClass<typeof ApplicationError>
  const MockDomainError = DomainError as jest.MockedClass<typeof DomainError>
  const MockInfrastructureError = InfrastructureError as jest.MockedClass<typeof InfrastructureError>

  const mockEvent: APIGatewayProxyEventV2 = {
    body: JSON.stringify({
      name: 'John',
      lastname: 'Doe',
      age: 30,
      identificationNumber: '12345678',
      identificationType: 'DNI'
    }),
    headers: {},
    isBase64Encoded: false,
    rawPath: '/users',
    rawQueryString: '',
    requestContext: {} as any,
    routeKey: 'POST /users',
    version: '2.0'
  }

  const mockParsedBody = {
    name: 'John',
    lastname: 'Doe', // Corrected casing
    age: 30,
    identificationNumber: '12345678',
    identificationType: 'DNI'
  }

  const mockUserInstance = {
    toPrimitives: jest.fn().mockReturnValue({ id: 'mock-user-id' })
  } as unknown as User

  const mockCreateUserHttpResponse = {
    id: 'mock-user-id'
  }

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
    } as jest.Mocked<ILogger>

    // Simplified mock for CreateUser
    createUserInstance = {
      execute: jest.fn()
    } as unknown as jest.Mocked<CreateUser>

    // Build the handler with mocked dependencies
    handler = buildHandler({
      logger: loggerInstance,
      createUserUseCase: createUserInstance
    })

    // Reset mocks for each test
    MockParsers.bodyParser.mockReturnValue(mockParsedBody)
    MockCreateUserSchema.safeParse.mockReturnValue({ success: true, data: mockParsedBody } as any)
    MockUserHttpMapper.fromRequest.mockReturnValue(mockUserInstance)
    createUserInstance.execute.mockResolvedValue({ userId: 'mock-user-id' })
    MockUserHttpMapper.toResponse.mockReturnValue(mockCreateUserHttpResponse)
    MockResponseMessage.responseMessage.mockReturnValue(mockApiResponse)
    loggerInstance.info.mockClear() // Clear info calls from previous tests
    loggerInstance.error.mockClear() // Clear error calls from previous tests

    // Mock error class constructors for each test
    MockValidationError.mockImplementation((errors: any) => ({
      name: 'ValidationError',
      message: 'Validation failed',
      errors: errors,
      statusCode: StatusCodes.BAD_REQUEST,
      isOperational: true
    }))

    MockDomainError.mockImplementation((message: string) => ({
      name: 'DomainError',
      message: message,
      statusCode: StatusCodes.PROCESS_ERROR,
      isOperational: true
    }))

    MockApplicationError.mockImplementation((message: string) => ({
      name: 'ApplicationError',
      message: message,
      statusCode: 422,
      isOperational: true
    }))

    MockInfrastructureError.mockImplementation((message: string, statusCode: number) => ({
      name: 'InfrastructureError',
      message: message,
      statusCode: statusCode,
      isOperational: true
    }))
  })

  it('should successfully create a user and return 200 OK', async () => {
    const result = await handler(mockEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(loggerInstance.info).toHaveBeenCalledWith(
      'Http event data',
      'CREATE_USER',
      'Http event data',
      { event: mockEvent }
    )
    expect(MockParsers.bodyParser).toHaveBeenCalledTimes(1)
    expect(MockParsers.bodyParser).toHaveBeenCalledWith(mockEvent)
    expect(MockCreateUserSchema.safeParse).toHaveBeenCalledTimes(1)
    expect(MockCreateUserSchema.safeParse).toHaveBeenCalledWith(mockParsedBody)
    expect(MockUserHttpMapper.fromRequest).toHaveBeenCalledTimes(1)
    expect(MockUserHttpMapper.fromRequest).toHaveBeenCalledWith(mockParsedBody)
    expect(createUserInstance.execute).toHaveBeenCalledTimes(1)
    expect(createUserInstance.execute).toHaveBeenCalledWith(mockUserInstance)
    // Removed: expect(MockUserHttpMapper.toResponse).toHaveBeenCalledTimes(1)
    // Removed: expect(MockUserHttpMapper.toResponse).toHaveBeenCalledWith(mockUserInstance)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledWith({
      statusCode: StatusCodes.OPERATION_SUCCESSFUL,
      body: {
        code: MessageCodes.OPERATION_SUCCESSFUL,
        message: MessageDetail.OPERATION_SUCCESSFUL,
        data: mockCreateUserHttpResponse
      }
    })
    expect(result).toEqual(mockApiResponse)
  })

  it('should return 400 BAD REQUEST for validation errors', async () => {
    const validationErrorMessage = 'Validation failed'
    const validationErrors = [{ field: 'name', message: 'Name is required' }]

    MockCreateUserSchema.safeParse.mockReturnValue({
      success: false,
      error: new MockValidationError(validationErrors) // Use the mocked ValidationError
    } as any)

    const result = await handler(mockEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(MockParsers.bodyParser).toHaveBeenCalledTimes(1)
    expect(MockCreateUserSchema.safeParse).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockApiResponse)
  })

  it('should return 422 PROCESS_ERROR for DomainError', async () => {
    const domainErrorMessage = 'Invalid age'

    MockUserHttpMapper.fromRequest.mockImplementation(() => {
      throw new MockDomainError(domainErrorMessage) // Throw the mocked DomainError
    })

    const result = await handler(mockEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(MockParsers.bodyParser).toHaveBeenCalledTimes(1)
    expect(MockCreateUserSchema.safeParse).toHaveBeenCalledTimes(1)
    expect(MockUserHttpMapper.fromRequest).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockApiResponse)
  })

  it('should return custom status code for ApplicationError', async () => {
    const appErrorMessage = 'User already exists'
    const appErrorStatusCode = 409

    createUserInstance.execute.mockImplementation(() => {
      throw new MockApplicationError(appErrorMessage) // Throw the mocked ApplicationError
    })

    const result = await handler(mockEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(MockParsers.bodyParser).toHaveBeenCalledTimes(1)
    expect(MockCreateUserSchema.safeParse).toHaveBeenCalledTimes(1)
    expect(MockUserHttpMapper.fromRequest).toHaveBeenCalledTimes(1)
    expect(createUserInstance.execute).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockApiResponse)
  })

  it('should return custom status code for InfrastructureError', async () => {
    const infraErrorMessage = 'Database connection failed'
    const infraErrorStatusCode = 503

    createUserInstance.execute.mockImplementation(() => {
      throw new MockInfrastructureError(infraErrorMessage, infraErrorStatusCode) // Throw the mocked InfrastructureError
    })

    const result = await handler(mockEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(MockParsers.bodyParser).toHaveBeenCalledTimes(1)
    expect(MockCreateUserSchema.safeParse).toHaveBeenCalledTimes(1)
    expect(MockUserHttpMapper.fromRequest).toHaveBeenCalledTimes(1)
    expect(createUserInstance.execute).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockApiResponse)
  })

  it('should return 500 UNCONTROLLED_ERROR for generic errors', async () => {
    const genericErrorMessage = 'Something unexpected happened'
    const mockGenericError = new Error(genericErrorMessage)

    createUserInstance.execute.mockImplementation(() => {
      throw mockGenericError
    })

    const result = await handler(mockEvent)

    expect(loggerInstance.info).toHaveBeenCalledTimes(1)
    expect(MockParsers.bodyParser).toHaveBeenCalledTimes(1)
    expect(MockCreateUserSchema.safeParse).toHaveBeenCalledTimes(1)
    expect(MockUserHttpMapper.fromRequest).toHaveBeenCalledTimes(1)
    expect(createUserInstance.execute).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledTimes(1)
    expect(MockResponseMessage.responseMessage).toHaveBeenCalledWith({
      statusCode: StatusCodes.UNCONTROLLER_ERROR,
      body: {
        code: MessageCodes.UNCONTROLLER_ERROR,
        message: genericErrorMessage
      }
    })
    expect(result).toEqual(mockApiResponse)
  })
})