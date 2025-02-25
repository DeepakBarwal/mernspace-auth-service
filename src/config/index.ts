import path from 'node:path'
import { config } from 'dotenv'

config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV ?? 'dev'}`)
})

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
  FE_ADMIN_DASHBOARD_URL
} = process.env

export const Config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
  FE_ADMIN_DASHBOARD_URL
}
