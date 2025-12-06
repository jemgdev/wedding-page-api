import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { Loggerfy } from "loggerfy";
import { MessageCodes } from "@shared/utils/constants/MessageCodes";
import { MessageDetail } from "@shared/utils/constants/MessageDetail";
import { StatusCodes } from "@shared/utils/constants/StatusCodes";
import { responseMessage } from "@shared/utils/ResponseMessage";
import { logiflyVerifyUser } from "@shared/utils/LogiflyServices";
import { headerParser } from "@shared/utils/TryExtractData";

const logger = new Loggerfy()

export const isValidUserMiddleware = (handler: Function) => {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
      logger
        .info()
        .setCode('isValidUserMiddleware')
        .setDetail('Event data in middleware')
        .setMessage('Event data in middleware')
        .setMetadata({
          event
        })
        .write()

      const headers = headerParser<{
        Authorization: string,
        'id-token': string
      }>(event)

      const authorization = headers.Authorization
      const idToken = headers['id-token']

      if (!authorization.startsWith('Bearer ')) {
        return responseMessage<{
          code: string
          message: string
        }>({
          statusCode: StatusCodes.UNAUTHORIZED,
          body: {
            code: MessageCodes.UNAUTHORIZED,
            message: MessageDetail.UNAUTHORIZED,
          }
        })
      }

      const token = authorization.split(' ')[1];
      
      logger
        .info()
        .setCode('isValidUserMiddleware')
        .setDetail('token')
        .setMessage('token')
        .setMetadata({
          token
        })
        .write()

      const isValidUser = await logiflyVerifyUser({
        accessToken: token,
        idToken
      })

      if (!isValidUser) {
        return responseMessage<{
          code: string
          message: string
        }>({
          statusCode: StatusCodes.UNAUTHORIZED,
          body: {
            code: MessageCodes.UNAUTHORIZED,
            message: MessageDetail.UNAUTHORIZED,
          }
        })
      }
      return handler(event);
    } catch (err) {
      const error = err as Error
      logger
        .error()
        .setCode('isValidUserMiddleware')
        .setDetail('Error processing middleware')
        .setMessage('Error processing middleware')
        .setMetadata({
          message: error.message,
        })
        .write()
      
      if (error.message === MessageCodes.UNAUTHORIZED) {
        return responseMessage<{
          code: string
          message: string
        }>({
          statusCode: StatusCodes.UNAUTHORIZED,
          body: {
            code: MessageCodes.UNAUTHORIZED,
            message: MessageCodes.UNAUTHORIZED
          }
        })
      }

      return responseMessage<{
        code: string
        message: string
      }>({
        statusCode: StatusCodes.UNCONTROLLER_ERROR,
        body: {
          code: MessageCodes.UNCONTROLLER_ERROR,
          message: MessageDetail.UNCONTROLLER_ERROR,
        }
      })
    }
  };
};