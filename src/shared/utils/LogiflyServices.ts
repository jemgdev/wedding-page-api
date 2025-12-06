
import { MessageCodes } from "@shared/utils/constants/MessageCodes";
import { Environments } from '../environments'
import { Loggerfy } from "loggerfy";
import axios from "axios";
import https from 'https'

const logger = new Loggerfy()

const agent = new https.Agent({
  family: 6
})

export const logiflyOwnerLogin = async (): Promise<{
  accessToken: string
  idToken: string
  refreshToken: string
}> => {
  try {
    const response = await axios.post(`${Environments.LOGIFLY_BASE_URL}/api/v1/owners/signin`, {
      email: Environments.LOGIFLY_EMAIL,
      password: Environments.LOGIFLY_PASSWORD
    }, {
      httpsAgent: agent
    })

    const statusCode = response.status

    if (statusCode !== 200) {
      throw new Error(MessageCodes.UNAUTHORIZED)
    }

    return {
      accessToken: response.data.data.accessToken,
      idToken: response.data.data.idToken,
      refreshToken: response.data.data.refreshToken,
    }
  } catch (err) {
    const error = err as Error
    console.log(error)
    logger
      .error()
      .setCode('logiflyOwnerLogin')
      .setDetail('Response object')
      .setMessage('Response object')
      .setMetadata({
        message: error.message
      })
      .write()

    throw new Error(MessageCodes.UNAUTHORIZED)
  }
}

export const logiflyLogin = async ({
  ownerAccessToken,
  ownerIdToken,
  email,
  password
}: {
  ownerAccessToken: string,
  ownerIdToken: string
  email: string
  password: string
}): Promise<{
  accessToken: string
  idToken: string
  refreshToken: string
}> => {
  try {
    const response = await axios.post(`${Environments.LOGIFLY_BASE_URL}/api/v1/signin`, {
        email,
        password,
        app: 'Mi Dulce Tesoro'
      }, {
      headers: {
        Authorization: `Bearer ${ownerAccessToken}`,
        'id-token': ownerIdToken
      },
      httpsAgent: agent
    })

    const statusCode = response.status

    if (statusCode !== 200) {
      throw new Error(MessageCodes.UNAUTHORIZED)
    }

    return {
      accessToken: response.data.data.accessToken,
      idToken: response.data.data.idToken,
      refreshToken: response.data.data.refreshToken,
    }
  } catch (err) {
    const error = err as Error
    console.log(error)
    logger
      .error()
      .setCode('logiflyLogin')
      .setDetail('Response object')
      .setMessage('Response object')
      .setMetadata({
        message: error.message
      })
      .write()

    throw new Error(MessageCodes.UNAUTHORIZED)
  }
}

export const logiflyVerifyUser = async ({
  accessToken,
  idToken
}: {
  accessToken: string
  idToken: string
}): Promise<boolean> => {
  try {
    const response = await axios.post(`${Environments.LOGIFLY_BASE_URL}/api/v1/verify`, {
      roles: [
        'user'
      ],
      app: 'Mi Dulce Tesoro'
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'id-token': idToken
      },
      httpsAgent: agent
    })

    logger
      .info()
      .setCode('logiflyVerifyUser')
      .setDetail('Response object')
      .setMessage('Response object')
      .setMetadata({
        response: response.data
      })
      .write()

    return response.data.data.isValid as boolean
  } catch (err) {
    const error = err as Error
    console.log(error)
    logger
      .error()
      .setCode('logiflyVerifyUser')
      .setDetail('Response object')
      .setMessage('Response object')
      .setMetadata({
        message: error.message
      })
      .write()

    throw new Error(MessageCodes.UNAUTHORIZED)
  }
}