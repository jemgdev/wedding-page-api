import { APIGatewayProxyResultV2 } from 'aws-lambda'

/**
 * Generates a standardized HTTP response for AWS API Gateway.
 *
 * @param {Object} params - Parameters for constructing the response.
 * @param {number} params.statusCode - The HTTP status code of the response.
 * @param {T} [params.body] - Optional response body. If provided, it will be stringified as JSON.
 *
 * @returns {APIGatewayProxyResultV2} An object representing the HTTP response with
 * headers, status code, and optional body.
 */
export function responseMessage<T> ({
  statusCode,
  body
}: {
  statusCode: number
  body?: T
}): APIGatewayProxyResultV2 {
  return {
    statusCode,
    body: typeof body !== 'undefined' ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json'
    }
  }
}
