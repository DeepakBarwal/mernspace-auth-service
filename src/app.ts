import 'reflect-metadata'

import express from 'express'
import cookieParser from 'cookie-parser'
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
  res.send('Welcome to Auth service')
})

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)

app.use(globalErrorHandler)

export default app
