import { ApplicationError } from '../ApplicationError'
import { BaseError } from '../BaseError'

describe('ApplicationError', () => {
  // Mock Error.captureStackTrace as it's called in BaseError constructor
  const originalCaptureStackTrace = Error.captureStackTrace
  beforeAll(() => {
    Error.captureStackTrace = jest.fn()
  })

  afterAll(() => {
    Error.captureStackTrace = originalCaptureStackTrace
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should extend BaseError', () => {
    const error = new ApplicationError('Test message')
    expect(error).toBeInstanceOf(BaseError)
  })

  it('should correctly set message, statusCode, and isOperational', () => {
    const message = 'This is an application error'
    const error = new ApplicationError(message)

    expect(error.message).toBe(message)
    expect(error.statusCode).toBe(422)
    expect(error.isOperational).toBe(true)
  })

  it('should set the name property to ApplicationError', () => {
    const error = new ApplicationError('Name test')
    expect(error.name).toBe('ApplicationError')
  })

  it('should call Error.captureStackTrace', () => {
    // eslint-disable-next-line no-new
    new ApplicationError('Stack trace test')

    expect(Error.captureStackTrace).toHaveBeenCalledTimes(1)
    expect(Error.captureStackTrace).toHaveBeenCalledWith(expect.any(ApplicationError), ApplicationError)
  })
})
