import { InfrastructureError } from '../InfrastructureError'
import { BaseError } from '../BaseError'

describe('InfrastructureError', () => {
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
    const error = new InfrastructureError('Test message', 500)
    expect(error).toBeInstanceOf(BaseError)
  })

  it('should correctly set message, statusCode (500), and isOperational', () => {
    const message = 'Database connection failed'
    const error = new InfrastructureError(message, 500)

    expect(error.message).toBe(message)
    expect(error.statusCode).toBe(500)
    expect(error.isOperational).toBe(true)
  })

  it('should correctly set message, statusCode (503), and isOperational', () => {
    const message = 'Service unavailable'
    const error = new InfrastructureError(message, 503)

    expect(error.message).toBe(message)
    expect(error.statusCode).toBe(503)
    expect(error.isOperational).toBe(true)
  })

  it('should set the name property to InfrastructureError', () => {
    const error = new InfrastructureError('Name test', 500)
    expect(error.name).toBe('InfrastructureError')
  })

  it('should call Error.captureStackTrace', () => {
    // eslint-disable-next-line no-new
    new InfrastructureError('Stack trace test', 500)

    expect(Error.captureStackTrace).toHaveBeenCalledTimes(1)
    expect(Error.captureStackTrace).toHaveBeenCalledWith(expect.any(InfrastructureError), InfrastructureError)
  })
})
