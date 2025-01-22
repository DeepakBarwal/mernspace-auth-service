import 'reflect-metadata'

import express, { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenant'
import userRouter from './routes/user'
import cors from 'cors'
import { Config } from './config'
import { globalErrorHandler } from './middlewares/globalErrorHandler'

const app = express()
app.use(
  cors({
    origin: [Config.FE_ADMIN_DASHBOARD_URL!],
    credentials: true
  })
)
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res, next) => {
  // const err = createHttpError(401, 'Unauth')
  // next(err)
  // await new Promise(res => res(1))
  res.send('Welcome to Auth service')
})

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)

app.use(globalErrorHandler)

export default app
