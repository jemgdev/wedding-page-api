import { DomainError } from '../DomainError'
import { BaseError } from '../BaseError'

describe('DomainError', () => {
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
    const error = new DomainError('Test message')
    expect(error).toBeInstanceOf(BaseError)
  })

  it('should correctly set message, statusCode, and isOperational', () => {
    const message = 'This is a domain error'
    const error = new DomainError(message)

    expect(error.message).toBe(message)
    expect(error.statusCode).toBe(422)
    expect(error.isOperational).toBe(true)
  })

  it('should set the name property to DomainError', () => {
    const error = new DomainError('Name test')
    expect(error.name).toBe('DomainError')
  })

  it('should call Error.captureStackTrace', () => {
    // eslint-disable-next-line no-new
    new DomainError('Stack trace test')

    expect(Error.captureStackTrace).toHaveBeenCalledTimes(1)
    expect(Error.captureStackTrace).toHaveBeenCalledWith(expect.any(DomainError), DomainError)
  })
})
