import { responseMessage } from '../ResponseMessage'
import { APIGatewayProxyResultV2 } from 'aws-lambda'

describe('responseMessage', () => {
  it('should return a successful response with a JSON body', () => {
    const statusCode = 200
    const body = { message: 'Operation successful' }
    const expectedBody = JSON.stringify(body)

    const result = responseMessage({ statusCode, body })

    expect(result).toEqual({
      statusCode: 200,
      body: expectedBody,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  it('should return a successful response without a body', () => {
    const statusCode = 204

    const result = responseMessage({ statusCode })

    expect(result).toEqual({
      statusCode: 204,
      body: undefined,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  it('should return a response with a different status code and body', () => {
    const statusCode = 404
    const body = { error: 'Not Found' }
    const expectedBody = JSON.stringify(body)

    const result = responseMessage({ statusCode, body })

    expect(result).toEqual({
      statusCode: 404,
      body: expectedBody,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  it('should handle empty object body correctly', () => {
    const statusCode = 200
    const body = {}
    const expectedBody = JSON.stringify(body)

    const result = responseMessage({ statusCode, body })

    expect(result).toEqual({
      statusCode: 200,
      body: expectedBody,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })
})
