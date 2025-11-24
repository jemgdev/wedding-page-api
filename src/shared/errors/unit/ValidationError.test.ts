import { ValidationError } from '../ValidationError'
import { BaseError } from '../BaseError'

describe('ValidationError', () => {
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
    const error = new ValidationError([])
    expect(error).toBeInstanceOf(BaseError)
  })

  it('should correctly set default message, statusCode, and isOperational', () => {
    const errors = [{ field: 'email', message: 'Invalid email' }]
    const error = new ValidationError(errors)

    expect(error.message).toBe('Validation failed')
    expect(error.statusCode).toBe(400)
    expect(error.isOperational).toBe(true)
  })

  it('should set the name property to ValidationError', () => {
    const error = new ValidationError([])
    expect(error.name).toBe('ValidationError')
  })

  it('should correctly store the errors array', () => {
    const errors = [
      { field: 'username', message: 'Username is required' },
      { field: 'password', message: 'Password is too short' }
    ]
    const error = new ValidationError(errors)

    expect(error.errors).toEqual(errors)
  })

  it('should call Error.captureStackTrace', () => {
    // eslint-disable-next-line no-new
    new ValidationError([])

    expect(Error.captureStackTrace).toHaveBeenCalledTimes(1)
    expect(Error.captureStackTrace).toHaveBeenCalledWith(expect.any(ValidationError), ValidationError)
  })
})
