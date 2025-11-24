import { BaseError } from '../BaseError'

describe('BaseError', () => {
  // Create a concrete class to test the abstract BaseError
  class ConcreteError extends BaseError {
    constructor (message: string, statusCode?: number, isOperational?: boolean) {
      super(message, statusCode, isOperational)
    }
  }

  // Mock Error.captureStackTrace to prevent actual stack trace capture during tests
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

  it('should correctly set message, statusCode, and isOperational', () => {
    const error = new ConcreteError('Test message', 400, false)

    expect(error.message).toBe('Test message')
    expect(error.statusCode).toBe(400)
    expect(error.isOperational).toBe(false)
  })

  it('should use default statusCode and isOperational if not provided', () => {
    const error = new ConcreteError('Default message')

    expect(error.message).toBe('Default message')
    expect(error.statusCode).toBe(500)
    expect(error.isOperational).toBe(true)
  })

  it('should set the name property to the constructor\'s name', () => {
    const error = new ConcreteError('Name test')

    expect(error.name).toBe('ConcreteError')
  })

  it('should call Error.captureStackTrace', () => {
    // eslint-disable-next-line no-new
    new ConcreteError('Stack trace test')

    expect(Error.captureStackTrace).toHaveBeenCalledTimes(1)
    expect(Error.captureStackTrace).toHaveBeenCalledWith(expect.any(ConcreteError), ConcreteError)
  })
})