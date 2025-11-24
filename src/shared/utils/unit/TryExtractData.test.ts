import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { queryParser, bodyParser, headerParser, sqsParser } from '../TryExtractData'

describe('Parsers', () => {
  describe('queryParser', () => {
    it('should parse query string parameters correctly', () => {
      const mockEvent: APIGatewayProxyEventV2 = {
        queryStringParameters: { param1: 'value1', param2: 'value2' },
      } as any
      const result = queryParser<{ param1: string, param2: string }>(mockEvent)
      expect(result).toEqual({ param1: 'value1', param2: 'value2' })
    })

    it('should return an empty object if queryStringParameters is undefined', () => {
      const mockEvent: APIGatewayProxyEventV2 = {} as any
      const result = queryParser<{}>(mockEvent)
      expect(result).toEqual({})
    })

    it('should return an empty object if queryStringParameters is null', () => {
      const mockEvent: APIGatewayProxyEventV2 = { queryStringParameters: null } as any
      const result = queryParser<{}>(mockEvent)
      expect(result).toEqual({})
    })

    it('should return an empty object if queryStringParameters is an empty object', () => {
      const mockEvent: APIGatewayProxyEventV2 = { queryStringParameters: {} } as any
      const result = queryParser<{}>(mockEvent)
      expect(result).toEqual({})
    })
  })

  describe('bodyParser', () => {
    it('should parse a valid JSON body', () => {
      const mockEvent: APIGatewayProxyEventV2 = { body: JSON.stringify({ key: 'value' }) } as any
      const result = bodyParser<{ key: string }>(mockEvent)
      expect(result).toEqual({ key: 'value' })
    })

    it('should return an empty object if body is null or undefined', () => {
      const mockEventNull: APIGatewayProxyEventV2 = { body: null } as any
      const resultNull = bodyParser<{}>(mockEventNull)
      expect(resultNull).toEqual({})

      const mockEventUndefined: APIGatewayProxyEventV2 = {} as any
      const resultUndefined = bodyParser<{}>(mockEventUndefined)
      expect(resultUndefined).toEqual({})
    })

    it('should return an empty object if body is an empty string', () => {
      const mockEvent: APIGatewayProxyEventV2 = { body: '' } as any
      const result = bodyParser<{}>(mockEvent)
      expect(result).toEqual({})
    })

    it('should throw an error for invalid JSON body', () => {
      const mockEvent: APIGatewayProxyEventV2 = { body: 'invalid json' } as any
      expect(() => bodyParser<{}>(mockEvent)).toThrow()
    })
  })

  describe('headerParser', () => {
    it('should extract headers correctly', () => {
      const mockEvent: APIGatewayProxyEventV2 = {
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      } as any
      const result = headerParser<{ 'Content-Type': string, Authorization: string }>(mockEvent)
      expect(result).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer token' })
    })

    it('should return an empty object if headers is null or undefined', () => {
      const mockEventNull: APIGatewayProxyEventV2 = { headers: null } as any
      const resultNull = headerParser<{}>(mockEventNull)
      expect(resultNull).toEqual({})

      const mockEventUndefined: APIGatewayProxyEventV2 = {} as any
      const resultUndefined = headerParser<{}>(mockEventUndefined)
      expect(resultUndefined).toEqual({})
    })

    it('should return an empty object if headers is an empty object', () => {
      const mockEvent: APIGatewayProxyEventV2 = { headers: {} } as any
      const result = headerParser<{}>(mockEvent)
      expect(result).toEqual({})
    })
  })

  describe('sqsParser', () => {
    it('should parse a single SQS record', () => {
      const mockSqsEvent: SQSEvent = {
        Records: [
          {
            messageId: 'msg1',
            body: JSON.stringify({ data: 'payload1' }),
          } as any,
        ],
      } as any
      const result = sqsParser<{ data: string }>(mockSqsEvent)
      expect(result).toEqual([{ messageId: 'msg1', body: { data: 'payload1' } }])
    })

    it('should parse multiple SQS records', () => {
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
      const result = sqsParser<{ data: string }>(mockSqsEvent)
      expect(result).toEqual([
        { messageId: 'msg1', body: { data: 'payload1' } },
        { messageId: 'msg2', body: { data: 'payload2' } },
      ])
    })

    it('should return an empty array if Records is empty', () => {
      const mockSqsEvent: SQSEvent = { Records: [] } as any
      const result = sqsParser<{}>(mockSqsEvent)
      expect(result).toEqual([])
    })

    it('should throw an error for SQS records with non-JSON bodies', () => {
      const mockSqsEvent: SQSEvent = {
        Records: [
          {
            messageId: 'msg1',
            body: 'invalid json',
          } as any,
        ],
      } as any
      expect(() => sqsParser<{}>(mockSqsEvent)).toThrow()
    })
  })
})
